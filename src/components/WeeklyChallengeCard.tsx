import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, CheckCircle2, Zap } from "lucide-react";
import { surahs } from "@/data/surahs";
import type { WeeklyChallenge, ChallengeResult } from "@/hooks/useWeeklyChallenge";

interface Props {
  challenge: WeeklyChallenge | null;
  results: ChallengeResult[];
  myResult: ChallengeResult | null;
  isTeacher: boolean;
  loading: boolean;
  onCreateChallenge: (surahNumber: number, ayahFrom: number, ayahTo: number, doubleXp: boolean) => void;
  onStartChallenge: () => void;
  /** Map user_id → { name, emoji } */
  memberProfiles?: Map<string, { name: string; emoji: string }>;
}

export default function WeeklyChallengeCard({
  challenge, results, myResult, isTeacher, loading,
  onCreateChallenge, onStartChallenge, memberProfiles,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(7);
  const [doubleXp, setDoubleXp] = useState(false);

  const surah = challenge ? surahs.find((s) => s.number === challenge.surah_number) : null;
  const selectedSurahData = surahs.find((s) => s.number === selectedSurah);

  const handleCreate = () => {
    onCreateChallenge(selectedSurah, ayahFrom, ayahTo, doubleXp);
    setShowForm(false);
  };

  if (loading) return <div className="animate-pulse bg-muted rounded-xl h-24" />;

  // No challenge yet
  if (!challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-dashed border-primary/30 rounded-xl p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-primary" />
          <p className="text-sm font-semibold">Défi Hifz de la semaine</p>
        </div>
        <p className="text-xs text-muted-foreground">Aucun défi pour cette semaine.</p>

        {isTeacher && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg"
          >
            + Créer le défi de cette semaine
          </button>
        )}

        {showForm && (
          <div className="space-y-3 bg-muted/50 rounded-lg p-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Sourate</label>
              <select
                value={selectedSurah}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setSelectedSurah(num);
                  setAyahFrom(1);
                  const s = surahs.find((s) => s.number === num);
                  setAyahTo(s?.versesCount || 7);
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1"
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} – {s.nameArabic}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ayah début</label>
                <input
                  type="number" min={1} max={selectedSurahData?.versesCount || 999}
                  value={ayahFrom}
                  onChange={(e) => setAyahFrom(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ayah fin</label>
                <input
                  type="number" min={ayahFrom} max={selectedSurahData?.versesCount || 999}
                  value={ayahTo}
                  onChange={(e) => setAyahTo(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={doubleXp}
                onChange={(e) => setDoubleXp(e.target.checked)}
                className="rounded border-border"
              />
              <Zap size={14} className="text-yellow-500" />
              <span className="text-sm font-medium">x2 XP</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted font-medium">
                Annuler
              </button>
              <button onClick={handleCreate} className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold">
                Créer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Challenge exists
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-primary" />
          <p className="text-sm font-bold">Défi Hifz de la semaine</p>
        </div>
        {challenge.double_xp && (
          <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Zap size={10} /> x2 XP
          </span>
        )}
      </div>

      <div className="bg-background/60 rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground">Sourate</p>
        <p className="font-semibold text-sm">
          {surah ? `${surah.number}. ${surah.name} – ${surah.nameArabic}` : `Sourate ${challenge.surah_number}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Ayahs {challenge.ayah_from} – {challenge.ayah_to}
        </p>
      </div>

      {/* My status */}
      {myResult ? (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-sm font-semibold text-green-600">Complété – {Math.round(myResult.score)}%</span>
        </div>
      ) : (
        <button
          onClick={onStartChallenge}
          className="w-full py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg animate-pulse"
        >
          🎤 Commencer le défi
        </button>
      )}

      {/* Results leaderboard */}
      {sortedResults.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Star size={12} /> Classement du défi ({sortedResults.length})
          </p>
          {sortedResults.map((r, i) => {
            const profile = memberProfiles?.get(r.user_id);
            return (
              <div key={r.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                <span className="text-xs font-bold w-5 text-center text-muted-foreground">{i + 1}</span>
                <span className="text-sm">{profile?.emoji || "👤"}</span>
                <span className="text-xs font-medium flex-1 truncate">{profile?.name || "Membre"}</span>
                <span className="text-xs font-bold text-primary">{Math.round(r.score)}%</span>
                {challenge.double_xp && (
                  <Flame size={10} className="text-yellow-500" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
