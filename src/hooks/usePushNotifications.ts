import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

type PushState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const { user } = useAuth();
  const { saveFcmToken } = useNotificationPreferences();
  const [pushState, setPushState] = useState<PushState>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    setPushState(Notification.permission as PushState);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setPushState("unsupported");
      return false;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPushState(permission as PushState);

      if (permission === "granted") {
        // Register the Firebase messaging SW
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Firebase SW registered:", registration.scope);

        // For now, we store a placeholder token
        // When Firebase is configured, this will use firebase.messaging().getToken()
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
