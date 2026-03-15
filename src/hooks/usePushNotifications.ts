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
  const navigateRef = useRef<ReturnType<typeof useNavigate> | null>(null);

  // Safe navigate — only works inside Router context
  try {
    navigateRef.current = useNavigate();
  } catch {
    // Not inside Router — that's fine
  }

  useEffect(() => {
    if (isNative) {
      initNative();
    } else {
      // Web fallback
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setPushState("unsupported");
        return;
      }
      setPushState(Notification.permission as PushState);
    }
  }, []);

  // ─── Native Capacitor Push ─────────────────────────────────
  const initNative = useCallback(async () => {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === "granted") {
        setPushState("granted");
      } else if (permResult.receive === "denied") {
        setPushState("denied");
      }

      // Listen for registration success
      PushNotifications.addListener("registration", async (token) => {
        console.log("[Push] Native token:", token.value);
        if (user) {
          await saveFcmToken(token.value, `${Capacitor.getPlatform()}-native`);
        }
      });

      // Listen for registration error
      PushNotifications.addListener("registrationError", (err) => {
        console.error("[Push] Registration error:", err);
      });

      // Listen for push received (foreground)
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[Push] Received in foreground:", notification);
        toast(notification.title || "📬 Notification", {
          description: notification.body,
        });
      });

      // Listen for push action (tap)
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("[Push] Action performed:", action);
        const data = action.notification.data;
        if (data?.route && navigateRef.current) {
          navigateRef.current(data.route);
        }
      });
    } catch (e) {
      console.error("[Push] Native init error:", e);
      setPushState("unsupported");
    }
  }, [user, saveFcmToken]);

  // ─── Request Permission ────────────────────────────────────
  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      if (isNative) {
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
