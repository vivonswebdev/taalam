import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import { Button } from "@/components/ui/button";
import SimpleRecorder from "./SimpleRecorder";
import type { TranscriptionData } from "./SimpleRecorder";
import SimpleFeedback from "./SimpleFeedback";
import SurahSelector from "./SurahSelector";
import TranscriptionView from "./TranscriptionView";

export default function TarteelEasyPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedSurah, setSelectedSurah] = useState(114);
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

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

        {/* Flow: Record → Transcription → Feedback */}
        {!transcription ? (
          <SimpleRecorder
            surahNumber={selectedSurah}
            onScore={(_score, data) => setTranscription(data)}
          />
        ) : !showFeedback ? (
          <TranscriptionView
            transcription={transcription}
            onContinue={() => setShowFeedback(true)}
          />
        ) : (
          <SimpleFeedback
            score={transcription.score}
            surahNumber={selectedSurah}
            onRetry={() => {
              setTranscription(null);
              setShowFeedback(false);
            }}
            onNext={() => {
              setTranscription(null);
              setShowFeedback(false);
              setSelectedSurah((prev) => (prev > 78 ? prev - 1 : 114));
            }}
          />
        )}
      </div>
    </div>
  );
}
