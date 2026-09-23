import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type PushState = "default" | "granted" | "denied" | "unsupported";

const isNative = Capacitor.isNativePlatform();

export function usePushNotifications() {
  const { user } = useAuth();
  const { saveFcmToken } = useNotificationPreferences();
  const [pushState, setPushState] = useState<PushState>("default");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Refs so native listeners (registered once) always see the latest values
  const navigateRef = useRef(navigate);
  const userRef = useRef(user);
  const saveFcmTokenRef = useRef(saveFcmToken);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { saveFcmTokenRef.current = saveFcmToken; }, [saveFcmToken]);

  useEffect(() => {
    if (isNative) {
      let cancelled = false;
      const handles: { remove: () => Promise<void> }[] = [];
      initNative(handles, () => cancelled);
      return () => {
        cancelled = true;
        handles.forEach((h) => { h.remove().catch(() => {}); });
      };
    }
    // Web fallback
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    setPushState(Notification.permission as PushState);
  }, []);

  // ─── Native Capacitor Push ─────────────────────────────────
  async function initNative(handles: { remove: () => Promise<void> }[], isCancelled: () => boolean) {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      handles.push(
        // Listen for registration success
        await PushNotifications.addListener("registration", async (token) => {
          console.log("[Push] Native token received");
          if (userRef.current) {
            await saveFcmTokenRef.current(token.value, `${Capacitor.getPlatform()}-native`);
          }
        }),
        // Listen for registration error
        await PushNotifications.addListener("registrationError", (err) => {
          console.error("[Push] Registration error:", err);
        }),
        // Listen for push received (foreground)
        await PushNotifications.addListener("pushNotificationReceived", (notification) => {
          toast(notification.title || "📬 Notification", {
            description: notification.body,
          });
        }),
        // Listen for push action (tap)
        await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          const data = action.notification.data;
          if (data?.route) {
            navigateRef.current(data.route);
          }
        }),
      );
      if (isCancelled()) {
        handles.forEach((h) => { h.remove().catch(() => {}); });
        return;
      }

      const permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === "granted") {
        setPushState("granted");
        // Re-register on each launch: APNs tokens can change
        await PushNotifications.register();
      } else if (permResult.receive === "denied") {
        setPushState("denied");
      }
    } catch (e) {
      console.error("[Push] Native init error:", e);
      setPushState("unsupported");
    }
  }

  // ─── Request Permission ────────────────────────────────────
  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      if (isNative) {
        try {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          const permResult = await PushNotifications.requestPermissions();

          if (permResult.receive === "granted") {
            setPushState("granted");
            await PushNotifications.register();
            return true;
          } else {
            setPushState("denied");
            return false;
          }
        } catch (pushErr) {
          // Push not available — fallback to LocalNotifications
          console.warn("[Push] PushNotifications unavailable, falling back to LocalNotifications:", pushErr);
          try {
            const { LocalNotifications } = await import("@capacitor/local-notifications");
            const localPerm = await LocalNotifications.requestPermissions();
            if (localPerm.display === "granted") {
              setPushState("granted");
              return true;
            }
            setPushState("denied");
            return false;
          } catch (localErr) {
            console.warn("[Push] LocalNotifications also unavailable:", localErr);
            setPushState("unsupported");
            return false;
          }
        }
      }

      // ─── Web fallback (existing logic) ───────────────────
      if (!("Notification" in window)) {
        setPushState("unsupported");
        return false;
      }

      const permission = await Notification.requestPermission();
      setPushState(permission as PushState);

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Firebase SW registered:", registration.scope);

        const placeholderToken = `web-push-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        if (user) {
          await saveFcmToken(placeholderToken, navigator.userAgent);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Push notification setup failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, saveFcmToken]);

  return { pushState, loading, requestPermission };
}
