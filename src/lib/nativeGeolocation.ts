import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

/**
 * In the iOS/Android app, route navigator.geolocation.getCurrentPosition through the
 * native plugin. Otherwise WKWebView adds its own « localhost aimerait utiliser votre
 * position » prompt on top of the system one, on every launch.
 * Existing callers (prayers, Qibla, mosque map…) keep using the standard web API.
 */
export function installNativeGeolocation() {
  if (!Capacitor.isNativePlatform() || !navigator.geolocation) return;

  const toPositionError = (e: unknown): GeolocationPositionError => {
    const message = e instanceof Error ? e.message : String(e);
    const denied = /denied|permission/i.test(message);
    return {
      code: denied ? 1 : 2,
      message,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
  };

  navigator.geolocation.getCurrentPosition = (success, error, options) => {
    Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? false,
      timeout: options?.timeout,
      maximumAge: options?.maximumAge,
    })
      .then((pos) => success(pos as unknown as GeolocationPosition))
      .catch((e) => error?.(toPositionError(e)));
  };
}
