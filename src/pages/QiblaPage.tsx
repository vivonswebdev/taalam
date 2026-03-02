import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQibla } from "@/hooks/useQibla";
import { useSound } from "@/hooks/useSound";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, RotateCcw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QiblaPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { qiblaAngle, compassHeading, needleRotation, qiblaDelta, isAligned, permissionGranted, requestPermission, error } = useQibla();
  const { play } = useSound();
  const [city, setCity] = useState<string>("");
  const [calibrating, setCalibrating] = useState(false);
  const lastVibratedRef = useRef(false);
  const alignSoundRef = useRef(false);

  // Reverse geocode user position for display
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=fr`,
          { headers: { "User-Agent": "Taaloum/1.0" } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const addr = data.address || {};
        setCity(addr.city || addr.town || addr.village || addr.municipality || "");
      } catch { /* ignore */ }
    }, () => { /* ignore */ });
  }, []);

  // Vibration + sound when aligned
  useEffect(() => {
    if (isAligned && !lastVibratedRef.current) {
      lastVibratedRef.current = true;
      try { navigator.vibrate?.(200); } catch { /* noop */ }
      if (!alignSoundRef.current) {
        play("qiblaFound");
        alignSoundRef.current = true;
      }
    }
    if (!isAligned) {
      lastVibratedRef.current = false;
      alignSoundRef.current = false;
    }
  }, [isAligned, play]);

  // Calibration shake
  const handleCalibrate = useCallback(() => {
    setCalibrating(true);
    setTimeout(() => setCalibrating(false), 2000);
  }, []);

  const compassDeg = -compassHeading;

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-700",
      isAligned ? "bg-emerald-500/20" : "bg-background"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t("qibla.title" as any)}</h1>
          {city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{city}</p>}
        </div>
        <button onClick={handleCalibrate} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <RotateCcw className={cn("w-5 h-5 text-foreground", calibrating && "animate-spin")} />
        </button>
      </div>

      {/* Permission gate */}
      {!permissionGranted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl">🧭</div>
          <p className="text-center text-muted-foreground text-sm max-w-xs">
            {t("qibla.permissionMsg" as any)}
          </p>
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            {t("qibla.enableCompass" as any)}
          </button>
          {error && <p className="text-destructive text-xs">{t("qibla.error" as any)}</p>}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          {/* Compass container */}
          <div className="relative w-72 h-72">
            {/* Compass rose - rotates with device heading */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-border/30 bg-card/50 backdrop-blur-sm shadow-2xl"
              style={{ rotate: compassDeg }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
            >
              {/* Cardinal directions */}
              {[
                { label: "N", deg: 0 },
                { label: "E", deg: 90 },
                { label: "S", deg: 180 },
                { label: "W", deg: 270 },
              ].map((d) => (
                <div
                  key={d.label}
                  className="absolute w-full h-full flex items-start justify-center"
                  style={{ transform: `rotate(${d.deg}deg)` }}
                >
                  <span className={cn(
                    "mt-3 text-xs font-bold",
                    d.label === "N" ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {d.label}
                  </span>
                </div>
              ))}

              {/* Tick marks */}
              {Array.from({ length: 72 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full flex items-start justify-center"
                  style={{ transform: `rotate(${i * 5}deg)` }}
                >
                  <div className={cn(
                    "mt-1",
                    i % 6 === 0 ? "w-0.5 h-3 bg-foreground/40" : "w-px h-2 bg-foreground/15"
                  )} />
                </div>
              ))}

              {/* Kaaba indicator on compass rose */}
              {qiblaAngle !== null && (
                <div
                  className="absolute w-full h-full flex items-start justify-center"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="flex flex-col items-center -mt-1">
                    <span className="text-lg">🕋</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Fixed center needle (always points up) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-1 h-28">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-primary" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-primary to-primary/20" />
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={cn(
                "w-4 h-4 rounded-full border-2 shadow-lg transition-colors duration-500",
                isAligned ? "bg-emerald-500 border-emerald-300 shadow-emerald-500/50" : "bg-primary border-primary-foreground"
              )} />
            </div>
          </div>

          {/* Alignment feedback */}
          <AnimatePresence mode="wait">
            {isAligned ? (
              <motion.div
                key="aligned"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-4xl">🕋</div>
                <p className="text-lg font-bold text-emerald-600">{t("qibla.aligned" as any)}</p>
                <p className="text-xs text-muted-foreground">{t("qibla.facingMecca" as any)}</p>
              </motion.div>
            ) : (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-sm font-semibold text-foreground">
                  {Math.round(qiblaDelta)}° {t("qibla.away" as any)}
                </p>
                <p className="text-xs text-muted-foreground">{t("qibla.turnDevice" as any)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Degree info */}
          <div className="flex items-center gap-4 mt-2">
            <div className="px-4 py-2 bg-card rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t("qibla.heading" as any)}</p>
              <p className="font-mono font-bold text-foreground">{Math.round(compassHeading)}°</p>
            </div>
            <div className="px-4 py-2 bg-card rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{t("qibla.qiblaDir" as any)}</p>
              <p className="font-mono font-bold text-foreground">{qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : "—"}</p>
            </div>
          </div>

          {/* Calibration hint */}
          <AnimatePresence>
            {calibrating && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-primary text-center mt-2"
              >
                {t("qibla.calibrateHint" as any)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mini world map hint */}
      <div className="p-4 pb-24 flex justify-center">
        <div className="px-4 py-3 bg-card/80 backdrop-blur rounded-2xl border border-border/50 shadow-md flex items-center gap-3 max-w-xs">
          <span className="text-2xl">🕌</span>
          <div>
            <p className="text-xs font-semibold text-foreground">{t("qibla.meccaInfo" as any)}</p>
            <p className="text-[10px] text-muted-foreground">21.4225°N, 39.8262°E</p>
          </div>
        </div>
      </div>
    </div>
  );
}
