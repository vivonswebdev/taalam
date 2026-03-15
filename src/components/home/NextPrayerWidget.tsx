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

  return (
    <button
      onClick={() => navigate("/prayers")}
      className="mx-auto mt-3 flex flex-col items-center gap-1 rounded-2xl p-3 bg-gradient-to-r from-primary/12 to-accent/8 border border-primary/15 shadow-sm active:scale-[0.98] transition-transform w-fit px-6"
    >
      <p className="text-xs font-bold text-foreground">
        {t("prayer.next" as any)} · {t(`prayers.${nextPrayer.name.toLowerCase()}` as any)} · {nextPrayer.time}
      </p>
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-primary" />
        <span className="text-xs font-bold text-primary">{nextPrayer.countdown}</span>
        {cityName && <span className="text-[10px] text-muted-foreground">· {cityName}</span>}
      </div>
    </button>
  );
}
