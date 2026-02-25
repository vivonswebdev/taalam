import { useState, useRef } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, BookOpen, Loader2 } from "lucide-react";
import type { TajwidRule } from "@/data/tajwidRules";

interface TajwidTutorialSheetProps {
  rule: TajwidRule | null;
  onClose: () => void;
}

export default function TajwidTutorialSheet({ rule, onClose }: TajwidTutorialSheetProps) {
  const [playingExample, setPlayingExample] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playSafely: safePlay } = useAntiDoubleAudio();

  if (!rule) return null;

  const playExampleAudio = async (exampleWord: string, index: number) => {
    if (playingExample !== null) {
      audioRef.current?.pause();
      setPlayingExample(null);
      return;
    }
    setPlayingExample(index);
    try {
      // Use a Quran recitation API to find an ayah containing the word
      const searchRes = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(exampleWord.split(" ")[0])}/all/ar`
      );
      const searchData = await searchRes.json();
      if (searchData.data?.matches?.[0]) {
        const match = searchData.data.matches[0];
        const audioRes = await fetch(
          `https://api.alquran.cloud/v1/ayah/${match.surah.number}:${match.numberInSurah}/ar.alafasy`
        );
        const audioData = await audioRes.json();
        if (audioData.data?.audio) {
          const ok = await safePlay(audioData.data.audio);
          if (!ok) setPlayingExample(null);
          return;
        }
      }
    } catch {}
    setPlayingExample(null);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div className="px-6 pb-8 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `hsl(${rule.color} / 0.15)` }}
              >
                {rule.icon}
              </div>
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: `hsl(${rule.color})` }}
                >
                  {rule.name}
                </h2>
                <p className="font-arabic text-base text-foreground">{rule.nameArabic}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* Letters involved */}
          {rule.letters && (
            <div
              className="rounded-xl p-3 border"
              style={{
                backgroundColor: `hsl(${rule.color} / 0.08)`,
                borderColor: `hsl(${rule.color} / 0.2)`,
              }}
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Lettres concernées
              </p>
              <p className="font-arabic text-xl text-foreground tracking-wider text-center">
                {rule.letters}
              </p>
            </div>
          )}

          {/* Detailed explanation */}
          {rule.detailedExplanation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Explication détaillée
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {rule.detailedExplanation}
              </p>
            </div>
          )}

          {/* Examples with audio */}
          {rule.examples && rule.examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                🎧 Exemples avec audio
              </p>
              <div className="space-y-2">
                {rule.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl p-3"
                  >
                    <button
                      onClick={() => playExampleAudio(ex.word, i)}
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: `hsl(${rule.color} / 0.15)`,
                        color: `hsl(${rule.color})`,
                      }}
                    >
                      {playingExample === i ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0" dir="rtl">
                      <p className="font-arabic text-lg text-foreground">{ex.word}</p>
                      <p className="text-[10px] text-muted-foreground font-sans" dir="ltr">
                        {ex.context}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual tip */}
          <div
            className="rounded-xl p-4 text-center border"
            style={{
              backgroundColor: `hsl(${rule.color} / 0.05)`,
              borderColor: `hsl(${rule.color} / 0.15)`,
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">💡 Astuce de prononciation</p>
            <p className="text-sm font-medium text-foreground">
              {rule.id.startsWith("idgham") && "Laisse le son du Noon se fondre naturellement dans la lettre suivante."}
              {rule.id === "ikhfa" && "Prononce le Noon 'du bout du nez' — ni clairement, ni en le supprimant."}
              {rule.id === "iqlab" && "Transforme le Noon en Mim en fermant les lèvres, puis prononce le Ba."}
              {rule.id === "izhar" && "Prononce le Noon clairement et distinctement, sans nasalisation."}
              {rule.id === "ghunnah" && "Fais vibrer le son dans le nez pendant 2 temps — comme un bourdonnement."}
              {rule.id === "qalqala" && "Ajoute un léger 'écho' après la lettre — comme un petit rebond sonore."}
              {rule.id.startsWith("madd") && "Allonge le son de la voyelle en gardant un flux d'air régulier."}
              {rule.id === "ikhfa_shafawi" && "Rapproche les lèvres sans les fermer complètement devant le Ba."}
              {rule.id === "lam_shamsiyyah" && "Ne prononce pas le Lam — double la lettre solaire qui suit."}
              {rule.id === "lam_qamariyyah" && "Prononce le Lam clairement — il garde son son normal."}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
