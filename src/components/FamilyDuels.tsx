import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Plus, Trophy, Clock, Flame, Target, BookOpen, Mic, X, Medal, Zap, CheckCircle2 } from "lucide-react";
import { useFamilyDuels } from "@/hooks/useFamilyDuels";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { surahs } from "@/data/surahs";

const CHALLENGE_TYPES = [
  { value: "quiz", icon: Target, color: "text-primary" },
  { value: "tarteel", icon: Mic, color: "text-emerald-500" },
  { value: "hifz", icon: BookOpen, color: "text-violet-500" },
  { value: "reading", icon: BookOpen, color: "text-amber-500" },
];

interface FamilyDuelsProps {
  familyId: string;
  isParent: boolean;
}

export default function FamilyDuels({ familyId, isParent }: FamilyDuelsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeChallenges, pastChallenges, createChallenge, submitScore, deleteChallenge, getScoresForChallenge, loading } = useFamilyDuels(familyId);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("quiz");
  const [surahNum, setSurahNum] = useState<number | undefined>();
  const [xpReward, setXpReward] = useState(50);
  const [days, setDays] = useState(7);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const res = await createChallenge({
      title: title.trim(),
      challenge_type: type,
      surah_number: surahNum,
      xp_reward: xpReward,
      ends_at: new Date(Date.now() + days * 86400000).toISOString(),
    });
    if (res) {
      toast.success(t("duels.created"));
      setShowCreate(false);
      setTitle("");
      setSurahNum(undefined);
    }
  };

  const handleParticipate = async (challengeId: string) => {
    // Simulate a score (in production, this would come from actual quiz/tarteel results)
    const score = Math.floor(Math.random() * 50) + 50;
    const ok = await submitScore(challengeId, score);
    if (ok) toast.success(`${t("duels.scored")} ${score} pts ! +${50} XP`);
  };

  const endsIn = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    const d = Math.max(0, Math.floor(diff / 86400000));
    const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    return d > 0 ? `${d}j ${h}h` : `${h}h`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords size={18} className="text-secondary" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("duels.title")}</h3>
        </div>
        {isParent && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
          >
            <Plus size={14} /> {t("duels.newChallenge")}
          </button>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{t("duels.createTitle")}</p>
                <button onClick={() => setShowCreate(false)}><X size={16} className="text-muted-foreground" /></button>
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("duels.titlePlaceholder")}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />

              {/* Type selector */}
              <div className="flex gap-2">
                {CHALLENGE_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setType(ct.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      type === ct.value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/30 border-border/50 text-muted-foreground"
                    }`}
                  >
                    <ct.icon size={16} className={type === ct.value ? ct.color : ""} />
                    {t(`duels.type_${ct.value}` as any)}
                  </button>
                ))}
              </div>

              {/* Surah picker */}
              <select
                value={surahNum || ""}
                onChange={(e) => setSurahNum(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground"
              >
                <option value="">{t("duels.anySurah")}</option>
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>

              {/* XP + Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">{t("duels.xpReward")}</label>
                  <select value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground">
                    {[25, 50, 75, 100].map((v) => <option key={v} value={v}>{v} XP</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">{t("duels.duration")}</label>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground">
                    {[1, 3, 5, 7, 14].map((d) => <option key={d} value={d}>{d} {t("duels.daysUnit")}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {t("duels.launch")} 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active challenges */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : activeChallenges.length === 0 && pastChallenges.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card border border-dashed border-border rounded-2xl p-5 text-center space-y-2">
          <span className="text-3xl block">⚔️</span>
          <p className="text-sm font-medium text-foreground">{t("duels.empty")}</p>
          <p className="text-xs text-muted-foreground">{t("duels.emptyDesc")}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {activeChallenges.map((ch, idx) => {
            const chScores = getScoresForChallenge(ch.id);
            const myScore = chScores.find((s) => s.user_id === user?.id);
            const typeInfo = CHALLENGE_TYPES.find((ct) => ct.value === ch.challenge_type);

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 space-y-3"
              >
                {/* Challenge header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    {typeInfo ? <typeInfo.icon size={18} className={typeInfo.color} /> : <Swords size={18} className="text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{ch.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={10} /> {endsIn(ch.ends_at)}
                      </span>
                      <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                        <Zap size={10} /> {ch.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  {isParent && (
                    <button onClick={() => deleteChallenge(ch.id)} className="text-muted-foreground hover:text-destructive">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Leaderboard */}
                {chScores.length > 0 && (
                  <div className="space-y-1.5">
                    {chScores.slice(0, 5).map((s, i) => {
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      const isMe = s.user_id === user?.id;
                      return (
                        <div key={s.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs ${
                          isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                        }`}>
                          <span className="w-5 text-center">{medal || `#${i + 1}`}</span>
                          <span>{s.avatar_emoji}</span>
                          <span className={`flex-1 truncate font-medium ${isMe ? "text-primary" : "text-foreground"}`}>
                            {s.display_name} {isMe && `(${t("duels.you")})`}
                          </span>
                          <span className="font-bold text-foreground">{s.score} pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Participate button */}
                {!myScore ? (
                  <button
                    onClick={() => handleParticipate(ch.id)}
                    className="w-full flex items-center justify-center gap-2 bg-secondary/10 text-secondary rounded-xl py-2.5 text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    <Flame size={16} /> {t("duels.participate")}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 font-semibold py-1.5">
                    <CheckCircle2 size={14} /> {t("duels.completed")} — {myScore.score} pts
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Past challenges */}
          {pastChallenges.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold px-1">{t("duels.past")}</p>
              {pastChallenges.slice(0, 3).map((ch) => {
                const chScores = getScoresForChallenge(ch.id);
                const winner = chScores[0];
                return (
                  <div key={ch.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 opacity-70">
                    <Medal size={16} className="text-secondary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{ch.title}</p>
                      {winner && (
                        <p className="text-[10px] text-muted-foreground">
                          🏆 {winner.display_name} — {winner.score} pts
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("duels.ended")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
