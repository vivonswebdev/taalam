import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useQibla } from "@/hooks/useQibla";
import { useChildMode } from "@/hooks/useChildMode";
import { Clock, Compass, MapPin, Loader2 } from "lucide-react";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};

export default function Prayers() {
  const { t } = useLanguage();
  const { times, loading, nextPrayer } = usePrayerTimes();
  const { needleRotation, permissionGranted, requestPermission, qiblaAngle } = useQibla();
  const { isChildMode } = useChildMode();

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          {t("prayers.title")}
        </motion.h1>
      </div>

      <div className="px-6 space-y-5">
        {/* Next Prayer Countdown */}
        {nextPrayer && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-2xl p-5 text-center"
          >
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">{t("prayers.next")}</p>
            <p className="text-3xl font-bold mb-1">
              {isChildMode ? PRAYER_ICONS[nextPrayer.name] : ""} {t(`prayers.${nextPrayer.name.toLowerCase()}` as any)}
            </p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Clock size={18} />
              <span>{nextPrayer.time}</span>
              <span className="opacity-60">•</span>
              <span className="font-semibold">{nextPrayer.countdown}</span>
            </div>
          </motion.div>
        )}

        {/* Qibla Compass */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Compass size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.qibla")}</h3>
          </div>

          <div className="flex flex-col items-center">
            {!permissionGranted ? (
              <button
                onClick={requestPermission}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
              >
                {t("prayers.enableCompass")}
              </button>
            ) : (
              <div className="relative w-48 h-48">
                {/* Compass ring */}
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                {/* N/S/E/W markers */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">N</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
                {/* Qibla needle */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: needleRotation }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-16 bg-primary rounded-full" />
                    <span className="text-lg mt-1">🕌</span>
                  </div>
                </motion.div>
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-secondary rounded-full" />
                </div>
              </div>
            )}
            {qiblaAngle !== null && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <MapPin size={12} /> {Math.round(qiblaAngle)}° {t("prayers.fromNorth")}
              </p>
            )}
          </div>
        </motion.div>

        {/* Prayer Times List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("prayers.times")}</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : times ? (
            <div className="space-y-2">
              {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((name, i) => {
                const isNext = nextPrayer?.name === name;
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                      isNext ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{PRAYER_ICONS[name]}</span>
                      <span className={`text-sm font-medium ${isNext ? "text-primary font-bold" : "text-card-foreground"}`}>
                        {t(`prayers.${name.toLowerCase()}` as any)}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${isNext ? "text-primary" : "text-muted-foreground"}`}>
                      {times[name]}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t("prayers.error")}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
