import { motion } from "framer-motion";
import { Baby, User, Globe, BookOpen, Flame } from "lucide-react";
import { useVoiceProfile, type VoiceType, type SpeakerOrigin, type ScoringMode } from "@/hooks/useVoiceProfile";
import { useLanguage } from "@/hooks/useLanguage";

interface VoiceProfileSettingsProps {
  compact?: boolean;
}

export default function VoiceProfileSettings({ compact }: VoiceProfileSettingsProps) {
  const { voiceType, setVoiceType, speakerOrigin, setSpeakerOrigin, scoringMode, setScoringMode } = useVoiceProfile();
  const { t } = useLanguage();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );

  const Chip = ({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${compact ? "" : "bg-card border border-border rounded-2xl p-4"}`}
    >
      {!compact && <p className="text-sm font-bold text-foreground">⚙️ {t("voice.title" as any)}</p>}

      <Section title={t("voice.voiceType" as any)}>
        <Chip
          selected={voiceType === "adult"}
          onClick={() => setVoiceType("adult")}
          icon={<User size={14} />}
          label={t("voice.adult" as any)}
        />
        <Chip
          selected={voiceType === "child"}
          onClick={() => setVoiceType("child")}
          icon={<Baby size={14} />}
          label={t("voice.child" as any)}
        />
      </Section>

      <Section title={t("voice.originLang" as any)}>
        <Chip
          selected={speakerOrigin === "native"}
          onClick={() => setSpeakerOrigin("native")}
          icon={<Globe size={14} />}
          label={t("voice.native" as any)}
        />
        <Chip
          selected={speakerOrigin === "non_native"}
          onClick={() => setSpeakerOrigin("non_native")}
          icon={<Globe size={14} />}
          label={t("voice.nonNative" as any)}
        />
      </Section>

      <Section title={t("voice.scoringMode" as any)}>
        <Chip
          selected={scoringMode === "beginner"}
          onClick={() => setScoringMode("beginner")}
          icon={<BookOpen size={14} />}
          label={t("voice.beginner" as any)}
        />
        <Chip
          selected={scoringMode === "strict"}
          onClick={() => setScoringMode("strict")}
          icon={<Flame size={14} />}
          label={t("voice.strict" as any)}
        />
      </Section>

      <p className="text-[10px] text-muted-foreground">
        {scoringMode === "beginner"
          ? t("voice.beginnerDesc" as any)
          : t("voice.strictDesc" as any)}
      </p>
    </motion.div>
  );
}
