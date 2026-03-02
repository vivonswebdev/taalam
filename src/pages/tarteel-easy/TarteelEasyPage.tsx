import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SimpleRecorder from "./SimpleRecorder";
import SimpleFeedback from "./SimpleFeedback";
import SurahSelector from "./SurahSelector";

export default function TarteelEasyPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedSurah, setSelectedSurah] = useState(114);
  const [score, setScore] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-sm font-bold">🌱 {t("tarteel.easyMode" as any)}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Surah Selector */}
        <SurahSelector selectedSurah={selectedSurah} onSelect={setSelectedSurah} />

        {/* Recorder or Feedback */}
        {score === null ? (
          <SimpleRecorder surahNumber={selectedSurah} onScore={setScore} />
        ) : (
          <SimpleFeedback
            score={score}
            surahNumber={selectedSurah}
            onRetry={() => setScore(null)}
            onNext={() => {
              setScore(null);
              setSelectedSurah((prev) => (prev > 78 ? prev - 1 : 114));
            }}
          />
        )}
      </div>
    </div>
  );
}
