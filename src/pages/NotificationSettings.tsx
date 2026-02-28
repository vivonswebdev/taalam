import { ArrowLeft, Bell, BellOff, Clock, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import BottomNav from "@/components/BottomNav";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { prefs, loading, saving, savePrefs } = useNotificationPreferences();

  const timeLabel = `${String(prefs.reminder_hour).padStart(2, "0")}:${String(prefs.reminder_minute).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            {t("notif.title" as any)}
          </h1>
          <p className="text-xs text-muted-foreground">{t("notif.subtitle" as any)}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Hifz reminder */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <div>
                <p className="text-sm font-semibold">{t("notif.hifzReminder" as any)}</p>
                <p className="text-[11px] text-muted-foreground">{t("notif.hifzReminderDesc" as any)}</p>
              </div>
            </div>
            <Switch
              checked={prefs.hifz_reminder}
              onCheckedChange={(v) => savePrefs({ hifz_reminder: v })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Assignment reminder */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <div>
                <p className="text-sm font-semibold">{t("notif.assignmentReminder" as any)}</p>
                <p className="text-[11px] text-muted-foreground">{t("notif.assignmentReminderDesc" as any)}</p>
              </div>
            </div>
            <Switch
              checked={prefs.assignment_reminder}
              onCheckedChange={(v) => savePrefs({ assignment_reminder: v })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Nudge */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-pink-400" />
              <div>
                <p className="text-sm font-semibold">{t("notif.nudge" as any)}</p>
                <p className="text-[11px] text-muted-foreground">{t("notif.nudgeDesc" as any)}</p>
              </div>
            </div>
            <Switch
              checked={prefs.nudge_enabled}
              onCheckedChange={(v) => savePrefs({ nudge_enabled: v })}
              disabled={saving}
            />
          </div>
          {prefs.nudge_enabled && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                {t("notif.nudgeAfter" as any)} <strong className="text-foreground">{prefs.nudge_after_days}</strong> {t("notif.days" as any)}
              </p>
              <Slider
                value={[prefs.nudge_after_days]}
                onValueChange={([v]) => savePrefs({ nudge_after_days: v })}
                min={1}
                max={7}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Reminder time */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            <div>
              <p className="text-sm font-semibold">{t("notif.reminderTime" as any)}</p>
              <p className="text-[11px] text-muted-foreground">{t("notif.reminderTimeDesc" as any)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <input
                type="time"
                value={timeLabel}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  if (!isNaN(h) && !isNaN(m)) savePrefs({ reminder_hour: h, reminder_minute: m });
                }}
                className="bg-transparent text-sm font-mono font-bold text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Firebase info */}
        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t("notif.pushInfo" as any)}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
