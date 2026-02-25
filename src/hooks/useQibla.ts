import { useState, useEffect, useCallback } from "react";

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function calculateQiblaDirection(lat: number, lng: number): number {
  const latR = toRad(lat);
  const lngR = toRad(lng);
  const kLatR = toRad(KAABA_LAT);
  const kLngR = toRad(KAABA_LNG);
  const dLng = kLngR - lngR;
  const x = Math.sin(dLng);
  const y = Math.cos(latR) * Math.tan(kLatR) - Math.sin(latR) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(x, y));
  return (bearing + 360) % 360;
}

export function useQibla() {
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate qibla from GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const angle = calculateQiblaDirection(pos.coords.latitude, pos.coords.longitude);
          setQiblaAngle(angle);
        },
        () => {
          // Default Brussels
          setQiblaAngle(calculateQiblaDirection(50.8503, 4.3517));
        },
        { timeout: 5000 }
      );
    } else {
      setQiblaAngle(calculateQiblaDirection(50.8503, 4.3517));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      // iOS 13+ requires permission
      const DeviceOrientationEvent = window.DeviceOrientationEvent as any;
      if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === "granted") {
          setPermissionGranted(true);
        } else {
          setError("permission_denied");
          return;
        }
      } else {
        setPermissionGranted(true);
      }
    } catch {
      setError("permission_error");
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;
    const handler = (e: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS, alpha for Android
      const heading = (e as any).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : 0);
      setCompassHeading(heading);
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [permissionGranted]);

  // The rotation to apply to the compass needle: qibla direction - device heading
  const needleRotation = qiblaAngle !== null ? qiblaAngle - compassHeading : 0;

  // How far off from Qibla (0 = perfect alignment)
  const rawDelta = qiblaAngle !== null ? ((qiblaAngle - compassHeading) % 360 + 360) % 360 : 180;
  const qiblaDelta = rawDelta > 180 ? 360 - rawDelta : rawDelta;
  const isAligned = qiblaDelta <= 5;

  return { qiblaAngle, compassHeading, needleRotation, qiblaDelta, isAligned, permissionGranted, requestPermission, error };
}
