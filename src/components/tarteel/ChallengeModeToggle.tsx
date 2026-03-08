import { useLanguage } from "@/hooks/useLanguage";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trophy, Eye } from "lucide-react";

interface ChallengeModeToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  canEnable: boolean;
  cachedVerseSurah?: number;
  cachedVerseAyah?: number;
  showHint: boolean;
  onShowHint: () => void;
}

export default function ChallengeModeToggle({
  enabled,
  onToggle,
  canEnable,
  cachedVerseSurah,
  cachedVerseAyah,
  showHint,
  onShowHint,
}: ChallengeModeToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border/40">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-primary" />
          <div>
            <p className="text-xs font-bold">{t("tarteelOffline.challengeMode" as any)}</p>
            <p className="text-[10px] text-muted-foreground">
              {t("tarteelOffline.challengeModeDesc" as any)}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            if (checked && !canEnable) return;
            onToggle(checked);
          }}
          disabled={!canEnable && !enabled}
        />
      </div>

      {enabled && cachedVerseSurah && cachedVerseAyah && (
        <div className="rounded-xl bg-primary/5 border-2 border-primary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-primary">
              🏆 {t("tarteelOffline.challengeMode" as any)}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {t("tarteelOffline.surah" as any)} {cachedVerseSurah}, {t("tarteelOffline.ayah" as any)} {cachedVerseAyah}
          </p>

          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-center">
            {showHint ? null : (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  {t("tarteelOffline.textHidden" as any)} 🙈
                </p>
                <Button variant="outline" size="sm" onClick={onShowHint} className="gap-1">
                  <Eye size={14} />
                  {t("tarteelOffline.showHint" as any)}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
