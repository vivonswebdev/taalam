import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import { useLanguage } from "@/hooks/useLanguage";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr: "🌅", Dhuhr: "☀️", Asr: "🌤️", Maghrib: "🌇", Isha: "🌙",
};

export default function NextPrayerWidget() {
  const { t } = useLanguage();
  const { settings } = usePrayerSettings();
  const { nextPrayer, loading, cityName } = usePrayerTimes(settings);
  const navigate = useNavigate();

  if (loading || !nextPrayer) return null;

  const emoji = PRAYER_EMOJIS[nextPrayer.name] || "🕌";

  return (
    <button
      onClick={() => navigate("/prayers")}
      className="mx-5 mt-3 flex items-center gap-3 rounded-2xl p-3.5 bg-gradient-to-r from-primary/12 to-accent/8 border border-primary/15 shadow-sm active:scale-[0.98] transition-transform"
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-bold text-foreground">
          {t("prayer.next" as any)} · {t(`prayer.${nextPrayer.name.toLowerCase()}` as any)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {nextPrayer.time} {cityName ? `· ${cityName}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1 bg-card/80 border border-border/40 rounded-full px-2.5 py-1">
        <Clock size={12} className="text-primary" />
        <span className="text-xs font-bold text-primary">{nextPrayer.countdown}</span>
      </div>
    </button>
  );
}
