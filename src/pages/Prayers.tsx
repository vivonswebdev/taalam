import { useCallback } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { useQibla } from "@/hooks/useQibla";
import { useChildMode } from "@/hooks/useChildMode";
import { useNavigate } from "react-router-dom";
import { Clock, Compass, MapPin, Loader2, Settings2, Bell, BellOff, AlertTriangle, Navigation } from "lucide-react";
import { reverseGeocode } from "@/hooks/useCityAutocomplete";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};

const PRAYER_NAMES_LIST = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export default function Prayers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { settings, updateSettings } = usePrayerSettings();
  const { isChildMode } = useChildMode();

  const handleAutoDetect = useCallback((city: string, country: string, lat: number, lng: number) => {
    if (!settings.locationDetected) {
      updateSettings({ city, country, lat, lng, source: "city", locationDetected: true });
    }
  }, [settings.locationDetected, updateSettings]);

  const { times, loading, nextPrayer, cityName } = usePrayerTimes(settings, handleAutoDetect);
  const { needleRotation, permissionGranted, requestPermission, qiblaAngle } = useQibla();

  const displayCity = cityName || (settings.city && settings.country ? `${settings.city}, ${settings.country}` : settings.city || null);

  const notif = usePrayerNotifications(times, displayCity || undefined);

  const handleDetectCity = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) {
          updateSettings({
            city: geo.city,
            country: geo.country,
            lat: geo.lat,
            lng: geo.lng,
            source: "city",
            locationDetected: true,
          });
        }
      },
      () => {},
      { timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          {t("prayers.title")}
        </motion.h1>
        <button
          onClick={() => navigate("/prayer-settings")}
          className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full active:scale-[0.97] transition-transform"
        >
          <Settings2 size={14} />
          {t("prayers.settings.button")}
        </button>
      </div>

      <div className="px-6 space-y-5">
        {/* Location badge */}
        {displayCity ? (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} className="text-primary" />
              <span>{t("prayers.horairesPour")} <strong className="text-foreground">{displayCity}</strong></span>
            </div>
            <button
              onClick={() => navigate("/prayer-settings?focus=city")}
              className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full"
            >
              {t("prayers.changeCity")}
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl px-3 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("prayers.noCity")}</span>
            <button
              onClick={handleDetectCity}
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Navigation size={12} />
              {t("prayers.detectCity")}
            </button>
          </div>
        )}

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

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">{t("prayers.notif.title")}</h3>
          </div>

          {!notif.supported ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle size={14} />
              <span>{t("prayers.notif.unsupported")}</span>
            </div>
          ) : notif.permissionState === "denied" ? (
            <p className="text-xs text-destructive">{t("prayers.notif.denied")}</p>
          ) : (
            <>
              <button
                onClick={() => {
                  if (!notif.config.enabled && notif.permissionState !== "granted") {
                    notif.requestPermission();
                  } else {
                    notif.updateConfig({ enabled: !notif.config.enabled });
                  }
                }}
                className="w-full flex items-center justify-between mb-3"
              >
                <span className="text-xs font-medium text-foreground">{t("prayers.notif.enable")}</span>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${notif.config.enabled ? "bg-primary" : "bg-muted"}`}>
                  <motion.div
                    animate={{ x: notif.config.enabled ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-md"
                  />
                </div>
              </button>

              {notif.config.enabled && (
                <div className="space-y-1.5">
                  {PRAYER_NAMES_LIST.map((name) => (
                    <button
                      key={name}
                      onClick={() => notif.togglePrayer(name)}
                      className="w-full flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{PRAYER_ICONS[name]}</span>
                        <span className="text-xs text-foreground">{t(`prayers.${name.toLowerCase()}` as any)}</span>
                      </div>
                      {notif.config.prayers[name] ? (
                        <Bell size={14} className="text-primary" />
                      ) : (
                        <BellOff size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={notif.config.offsetMinutes}
                      onChange={(e) => notif.updateConfig({ offsetMinutes: Math.max(1, Math.min(60, Number(e.target.value))) })}
                      className="w-14 bg-muted rounded-lg px-2 py-1 text-xs text-center text-foreground outline-none"
                    />
                    <span className="text-xs text-muted-foreground">{t("prayers.notif.offset")}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

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
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">N</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
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
              {PRAYER_NAMES_LIST.map((name, i) => {
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
