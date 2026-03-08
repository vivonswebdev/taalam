import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerTimes, calculateDohaTime } from "@/hooks/usePrayerTimes";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { useQibla } from "@/hooks/useQibla";
import { useChildMode } from "@/hooks/useChildMode";
import { useSound } from "@/hooks/useSound";
import { useNavigate } from "react-router-dom";
import { Clock, Compass, MapPin, Loader2, Settings2, Bell, BellOff, AlertTriangle, Navigation, CheckCircle2, Volume2, VolumeX, Vibrate } from "lucide-react";
import HijriCalendar from "@/components/HijriCalendar";
import { reverseGeocode } from "@/hooks/useCityAutocomplete";

const PRAYER_NAMES_LIST = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

interface PrayerCubeData {
  key: string;
  name: string;
  icon: string;
  time: string;
  gradient: string;
  glowColor: string;
  isNext: boolean;
  isPast: boolean;
  timeLeft: string;
  isSunnah?: boolean;
}

const CUBE_CONFIG: Record<string, { icon: string; gradient: string; glowColor: string }> = {
  Fajr:    { icon: "🌅", gradient: "from-blue-400/20 to-cyan-500/20",    glowColor: "shadow-blue-500/20" },
  Doha:    { icon: "☀️", gradient: "from-yellow-400/20 to-orange-500/20", glowColor: "shadow-yellow-500/20" },
  Dhuhr:   { icon: "🌞", gradient: "from-orange-400/20 to-red-400/20",   glowColor: "shadow-orange-500/20" },
  Asr:     { icon: "🌤️", gradient: "from-amber-400/20 to-yellow-600/20", glowColor: "shadow-amber-500/20" },
  Maghrib: { icon: "🌆", gradient: "from-purple-400/20 to-pink-500/20",  glowColor: "shadow-purple-500/20" },
  Isha:    { icon: "🌙", gradient: "from-indigo-500/20 to-purple-600/20", glowColor: "shadow-indigo-500/20" },
};

function NeonGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
      style={{
        backgroundImage:
          "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function isPrayerPast(time: string): boolean {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return now > t;
}

function calcTimeLeft(time: string): string {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const t = new Date();
  t.setHours(h, m, 0, 0);
  const diff = t.getTime() - now.getTime();
  if (diff <= 0) return "";
  const hoursLeft = Math.floor(diff / 3600000);
  const minutesLeft = Math.floor((diff % 3600000) / 60000);
  if (hoursLeft > 0) return `${hoursLeft}h ${minutesLeft}m`;
  return `${minutesLeft}m`;
}

/* ──────── Prayer Cube Component ──────── */
function PrayerCube({ cube, t }: { cube: PrayerCubeData; t: (k: any) => string }) {
  return (
    <div
      className={`
        relative flex flex-col justify-between rounded-2xl p-3 min-h-[130px]
        bg-white/[0.07] backdrop-blur-md border transition-all duration-300
        ${cube.isNext
          ? "border-cyan-400/50 shadow-lg " + cube.glowColor + " scale-[1.02]"
          : cube.isPast
            ? "border-white/10 opacity-60"
            : "border-white/15 hover:border-white/30"
        }
      `}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cube.gradient} pointer-events-none`} />

      {/* Top row: icon + badge */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-2xl">{cube.icon}</span>
        {cube.isNext && (
          <span className="text-[9px] font-bold bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
            {t("prayers.nextLabel" as any)}
          </span>
        )}
        {cube.isSunnah && !cube.isNext && (
          <span className="text-[9px] font-bold bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30">
            Sunnah
          </span>
        )}
        {cube.isPast && !cube.isNext && (
          <CheckCircle2 size={14} className="text-emerald-400/70" />
        )}
      </div>

      {/* Name */}
      <div className="relative z-10 mt-2">
        <p className="text-sm font-bold text-white/90">{t(`prayers.${cube.key}` as any)}</p>
      </div>

      {/* Time */}
      <div className="relative z-10 mt-auto pt-1">
        <p className={`text-xl font-black tabular-nums ${cube.isNext ? "text-cyan-300" : "text-white/80"}`}>
          {cube.time}
        </p>
        {cube.isNext && cube.timeLeft && (
          <p className="text-[10px] text-cyan-400/80 font-medium mt-0.5">
            {t("prayers.in" as any)} {cube.timeLeft}
          </p>
        )}
      </div>
    </div>
  );
}

/* ──────── Main Page ──────── */
export default function Prayers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { settings, updateSettings } = usePrayerSettings();
  const { isChildMode } = useChildMode();
  const [openPanel, setOpenPanel] = useState<"notif" | "qibla" | null>(null);

  const handleAutoDetect = useCallback((city: string, country: string, lat: number, lng: number) => {
    if (!settings.locationDetected) {
      updateSettings({ city, country, lat, lng, source: "city", locationDetected: true });
    }
  }, [settings.locationDetected, updateSettings]);

  const { times, loading, nextPrayer, cityName } = usePrayerTimes(settings, handleAutoDetect);
  const { needleRotation, permissionGranted, requestPermission, qiblaAngle, qiblaDelta, isAligned } = useQibla();
  const { play, vibrate } = useSound();
  const alignedRef = useRef(false);

  useEffect(() => {
    if (isAligned && !alignedRef.current) { alignedRef.current = true; play("qiblaFound"); vibrate([50, 30, 50]); }
    else if (!isAligned) { alignedRef.current = false; }
  }, [isAligned, play, vibrate]);

  const displayCity = cityName || (settings.city && settings.country ? `${settings.city}, ${settings.country}` : settings.city || null);
  const notif = usePrayerNotifications(times, displayCity || undefined);

  const handleDetectCity = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) updateSettings({ city: geo.city, country: geo.country, lat: geo.lat, lng: geo.lng, source: "city", locationDetected: true });
      },
      () => {},
      { timeout: 8000 }
    );
  };

  // Build cube data
  const cubes: PrayerCubeData[] = times
    ? (() => {
        const dohaTime = calculateDohaTime(times.Sunrise);
        const allKeys = ["fajr", "doha", "dhuhr", "asr", "maghrib", "isha"];
        const allTimes: Record<string, string> = {
          fajr: times.Fajr, doha: dohaTime, dhuhr: times.Dhuhr,
          asr: times.Asr, maghrib: times.Maghrib, isha: times.Isha,
        };

        // Determine next prayer
        const now = new Date();
        let nextKey: string | null = null;
        for (const k of allKeys) {
          const [h, m] = allTimes[k].split(":").map(Number);
          const pt = new Date(); pt.setHours(h, m, 0, 0);
          if (pt > now) { nextKey = k; break; }
        }

        return allKeys.map((key) => {
          const cfgKey = key.charAt(0).toUpperCase() + key.slice(1);
          const cfg = CUBE_CONFIG[cfgKey] || CUBE_CONFIG.Fajr;
          return {
            key,
            name: cfgKey,
            icon: cfg.icon,
            time: allTimes[key],
            gradient: cfg.gradient,
            glowColor: cfg.glowColor,
            isNext: key === nextKey,
            isPast: isPrayerPast(allTimes[key]),
            timeLeft: calcTimeLeft(allTimes[key]),
            isSunnah: key === "doha",
          };
        });
      })()
    : [];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]">
      <NeonGrid />

      {/* Header */}
      <div className="px-5 pt-14 pb-1 relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{t("prayers.title")}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/athan-settings")}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-300 bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/10 active:scale-[0.97] transition-transform"
            >
              🕌 {t("athan.title" as any)}
            </button>
            <button
              onClick={() => navigate("/prayer-settings")}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-300 bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/10 active:scale-[0.97] transition-transform"
            >
              <Settings2 size={14} />
              {t("prayers.settings.button")}
            </button>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-1">
          📅 {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="px-5 space-y-4 relative z-10">
        {/* Location badge */}
        {displayCity ? (
          <div className="flex items-center justify-between bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <MapPin size={12} className="text-cyan-400" />
              <span>{t("prayers.horairesPour")} <strong className="text-white/90">{displayCity}</strong></span>
            </div>
            <button onClick={() => navigate("/prayer-settings?focus=city")} className="text-[10px] font-semibold text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded-full border border-cyan-400/20">
              {t("prayers.changeCity")}
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-xl px-3 py-3 flex items-center justify-between">
            <span className="text-xs text-white/50">{t("prayers.noCity")}</span>
            <button onClick={handleDetectCity} className="flex items-center gap-1 text-xs font-semibold text-cyan-300 bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20">
              <Navigation size={12} />
              {t("prayers.detectCity")}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={28} />
          </div>
        )}

        {/* Error */}
        {!loading && !times && (
          <p className="text-sm text-white/50 text-center py-8">{t("prayers.error")}</p>
        )}

        {/* 3x3 Cube Grid */}
        {!loading && cubes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cubes.map((cube) => (
              <PrayerCube key={cube.key} cube={cube} t={t} />
            ))}
          </div>
        )}


        {/* Notifications + Qibla */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOpenPanel(openPanel === "notif" ? null : "notif")}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 border transition-colors ${openPanel === "notif" ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/[0.07] border-white/15"}`}
          >
            <span className="text-3xl">🔔</span>
            <p className="text-xs font-bold text-white/80">{t("prayers.notif.title")}</p>
          </button>
          <button
            onClick={() => setOpenPanel(openPanel === "qibla" ? null : "qibla")}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 border transition-colors ${openPanel === "qibla" ? "bg-cyan-400/10 border-cyan-400/30" : "bg-white/[0.07] border-white/15"}`}
          >
            <span className="text-3xl">🧭</span>
            <p className="text-xs font-bold text-white/80">{t("prayers.qibla")}</p>
          </button>
        </div>

        {/* Expanded panels */}
        <AnimatePresence>
          {openPanel === "notif" && (
            <motion.div
              key="notif-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-2xl p-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white/90">{t("prayers.notif.title")}</h3>
              </div>
              {!notif.supported ? (
                <div className="flex items-center gap-2 text-xs text-white/50"><AlertTriangle size={14} /><span>{t("prayers.notif.unsupported")}</span></div>
              ) : notif.permissionState === "denied" ? (
                <p className="text-xs text-red-400">{t("prayers.notif.denied")}</p>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (!notif.config.enabled && notif.permissionState !== "granted") notif.requestPermission();
                      else notif.updateConfig({ enabled: !notif.config.enabled });
                    }}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <span className="text-xs font-medium text-white/80">{t("prayers.notif.enable")}</span>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${notif.config.enabled ? "bg-cyan-500" : "bg-white/20"}`}>
                      <motion.div animate={{ x: notif.config.enabled ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md" />
                    </div>
                  </button>
                  {notif.config.enabled && (
                    <div className="space-y-1.5">
                      {PRAYER_NAMES_LIST.map((name) => (
                        <button key={name} onClick={() => notif.togglePrayer(name)} className="w-full flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{CUBE_CONFIG[name]?.icon || "🕌"}</span>
                            <span className="text-xs text-white/70">{t(`prayers.${name.toLowerCase()}` as any)}</span>
                          </div>
                          {notif.config.prayers[name] ? <Bell size={14} className="text-cyan-400" /> : <BellOff size={14} className="text-white/30" />}
                        </button>
                      ))}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <input type="number" min={1} max={60} value={notif.config.offsetMinutes}
                          onChange={(e) => notif.updateConfig({ offsetMinutes: Math.max(1, Math.min(60, Number(e.target.value))) })}
                          className="w-14 bg-white/10 rounded-lg px-2 py-1 text-xs text-center text-white outline-none border border-white/10"
                        />
                        <span className="text-xs text-white/50">{t("prayers.notif.offset")}</span>
                      </div>

                      <button
                        onClick={() => notif.updateConfig({ athanEnabled: !notif.config.athanEnabled })}
                        className="w-full flex items-center justify-between mt-3 pt-3 border-t border-white/10"
                      >
                        <div className="flex items-center gap-2">
                          {notif.config.athanEnabled !== false ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} className="text-white/30" />}
                          <span className="text-xs font-medium text-white/80">{t("prayers.notif.athanSound" as any)}</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${notif.config.athanEnabled !== false ? "bg-cyan-500" : "bg-white/20"}`}>
                          <motion.div animate={{ x: notif.config.athanEnabled !== false ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md" />
                        </div>
                      </button>

                      <button
                        onClick={() => notif.updateConfig({ vibrationEnabled: !notif.config.vibrationEnabled })}
                        className="w-full flex items-center justify-between mt-2"
                      >
                        <div className="flex items-center gap-2">
                          <Vibrate size={14} className={notif.config.vibrationEnabled !== false ? "text-cyan-400" : "text-white/30"} />
                          <span className="text-xs font-medium text-white/80">{t("prayers.notif.vibration" as any)}</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${notif.config.vibrationEnabled !== false ? "bg-cyan-500" : "bg-white/20"}`}>
                          <motion.div animate={{ x: notif.config.vibrationEnabled !== false ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md" />
                        </div>
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {openPanel === "qibla" && (
            <motion.div
              key="qibla-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-2xl p-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <Compass size={18} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white/90">{t("prayers.qibla")}</h3>
              </div>
              <div className="flex flex-col items-center">
                {!permissionGranted ? (
                  <button onClick={requestPermission} className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform">
                    {t("prayers.enableCompass")}
                  </button>
                ) : (
                  <div className="relative w-48 h-48">
                    <motion.div className="absolute inset-0 rounded-full border-4 transition-colors duration-500"
                      animate={{ borderColor: isAligned ? "hsl(142, 76%, 36%)" : "hsl(0, 0%, 30%)", boxShadow: isAligned ? "0 0 20px hsla(142, 76%, 36%, 0.4), 0 0 40px hsla(142, 76%, 36%, 0.15)" : "none" }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white/40">N</span>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white/40">S</span>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">E</span>
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">W</span>
                    <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: needleRotation }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                      <div className="flex flex-col items-center">
                        <div className={`w-1 h-16 rounded-full transition-colors duration-300 ${isAligned ? "bg-emerald-400" : "bg-cyan-400"}`} />
                        <span className="text-lg mt-1">🕌</span>
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className={`rounded-full transition-colors duration-300 ${isAligned ? "bg-emerald-400" : "bg-cyan-500"}`}
                        animate={isAligned ? { scale: [1, 1.6, 1], opacity: [1, 0.6, 1] } : { scale: 1 }}
                        transition={isAligned ? { duration: 1.2, repeat: Infinity } : {}}
                        style={{ width: 12, height: 12 }}
                      />
                    </div>
                  </div>
                )}
                {isAligned && permissionGranted && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 mt-3 bg-emerald-500/15 text-emerald-400 rounded-full px-4 py-1.5">
                    <CheckCircle2 size={14} /><span className="text-xs font-bold">{t("prayers.qiblaFound")}</span>
                  </motion.div>
                )}
                {qiblaAngle !== null && (
                  <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                    <MapPin size={12} />
                    {permissionGranted ? `${qiblaDelta.toFixed(1)}° ${t("prayers.fromQibla")}` : `${Math.round(qiblaAngle)}° ${t("prayers.fromNorth")}`}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
