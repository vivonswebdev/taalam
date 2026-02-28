import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Calendar, ChevronRight, CheckCircle2, Circle, BookOpen, Mic, Target, Trash2, Plus, Sparkles } from "lucide-react";
import { useHifzPlan, type HifzPlan } from "@/hooks/useHifzPlan";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { surahs } from "@/data/surahs";

const POPULAR_SURAHS = [
  { number: 114, label: "An-Nās" }, { number: 113, label: "Al-Falaq" },
  { number: 112, label: "Al-Ikhlāṣ" }, { number: 111, label: "Al-Masad" },
  { number: 110, label: "An-Naṣr" }, { number: 109, label: "Al-Kāfirūn" },
  { number: 108, label: "Al-Kawthar" }, { number: 107, label: "Al-Mā'ūn" },
  { number: 106, label: "Quraysh" }, { number: 105, label: "Al-Fīl" },
  { number: 36, label: "Yā-Sīn" }, { number: 67, label: "Al-Mulk" },
  { number: 55, label: "Ar-Raḥmān" }, { number: 56, label: "Al-Wāqi'a" },
  { number: 18, label: "Al-Kahf" }, { number: 2, label: "Al-Baqarah" },
];

function WizardStep({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

function CreatePlanWizard({ onCreate, t }: { onCreate: (params: any) => void; t: (key: string) => string }) {
  const [step, setStep] = useState(1);
  const [targetType, setTargetType] = useState<"surahs" | "juz">("surahs");
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [selectedJuz, setSelectedJuz] = useState<number[]>([]);
  const [dailyAyat, setDailyAyat] = useState(5);
  const [durationDays, setDurationDays] = useState(90);

  const toggleSurah = (n: number) => {
    setSelectedSurahs((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);
  };

  const toggleJuz = (n: number) => {
    setSelectedJuz((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]);
  };

  const targetItems = targetType === "surahs" ? selectedSurahs : selectedJuz;
  const canProceed = step === 1 ? true : step === 2 ? targetItems.length > 0 : true;

  const handleCreate = () => {
    onCreate({
      name: t("hifz.planTitle"),
      target_type: targetType,
      target_items: targetItems,
      duration_days: durationDays,
      daily_ayat: dailyAyat,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <WizardStep step={1}>
            <h3 className="text-sm font-semibold text-foreground">{t("hifz.whatToMemorize")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: "surahs" as const, label: t("hifz.surahs"), icon: "📖", desc: t("hifz.surahsDesc") },
                { type: "juz" as const, label: t("hifz.juzLabel"), icon: "📚", desc: t("hifz.juzDesc") },
              ]).map((opt) => (
                <button key={opt.type} onClick={() => setTargetType(opt.type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${targetType === opt.type ? "border-primary bg-primary/10" : "border-border"}`}>
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              {t("hifz.next")}
            </button>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep step={2}>
            <h3 className="text-sm font-semibold text-foreground">
              {targetType === "surahs" ? t("hifz.chooseSurahs") : t("hifz.chooseJuz")}
            </h3>

            {targetType === "surahs" ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {POPULAR_SURAHS.map((s) => {
                  const surah = surahs.find((x) => x.number === s.number);
                  const selected = selectedSurahs.includes(s.number);
                  return (
                    <button key={s.number} onClick={() => toggleSurah(s.number)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors text-left ${selected ? "border-primary bg-primary/10" : "border-border"}`}>
                      {selected ? <CheckCircle2 size={18} className="text-primary shrink-0" /> : <Circle size={18} className="text-muted-foreground shrink-0" />}
                      <span className="font-arabic text-sm text-primary">{surah?.nameArabic}</span>
                      <span className="text-xs text-muted-foreground flex-1">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">{surah?.versesCount} ayat</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).reverse().map((j) => (
                  <button key={j} onClick={() => toggleJuz(j)}
                    className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${selectedJuz.includes(j) ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>
                    {j}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">{t("hifz.back")}</button>
              <button onClick={() => canProceed && setStep(3)} disabled={!canProceed}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold ${canProceed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {t("hifz.next")}
              </button>
            </div>
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep step={3}>
            <h3 className="text-sm font-semibold text-foreground">{t("hifz.memorizationPace")}</h3>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("hifz.ayatPerDay")}</p>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((n) => (
                  <button key={n} onClick={() => setDailyAyat(n)}
                    className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${dailyAyat === n ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>
                    {n} ayat
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{t("hifz.planDuration")}</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ d: 30, l: t("hifz.1month") }, { d: 90, l: t("hifz.3months") }, { d: 180, l: t("hifz.6months") }].map((opt) => (
                  <button key={opt.d} onClick={() => setDurationDays(opt.d)}
                    className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${durationDays === opt.d ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">{t("hifz.back")}</button>
              <button onClick={handleCreate}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                <Sparkles size={16} /> {t("hifz.createPlan")}
              </button>
            </div>
          </WizardStep>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HifzPlanPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    plan, todayTasks, upcomingTasks, completedCount, totalCount, overallProgress,
    createPlan, completeTask, deletePlan, loading, isAuthenticated,
  } = useHifzPlan();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          🧠 {t("hifz.planTitle")}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">{t("hifz.planSubtitle")}</p>
      </div>

      <div className="px-6 space-y-4">
        {!plan ? (
          /* ── No plan: show wizard ── */
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-center mb-5">
              <span className="text-4xl">📖</span>
              <h2 className="text-base font-bold text-foreground mt-2">{t("hifz.createTitle")}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t("hifz.createSubtitle")}</p>
            </div>
            <CreatePlanWizard onCreate={createPlan} t={t} />
          </motion.div>
        ) : (
          <>
            {/* ── Plan overview ── */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                </div>
                <button onClick={() => setShowDeleteConfirm(true)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.8 }} />
                </div>
                <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {completedCount}/{totalCount} tâches · {plan.daily_ayat} ayat/jour · Démarré le {new Date(plan.started_at).toLocaleDateString("fr")}
              </p>
            </motion.div>

            {/* ── Today's tasks ── */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Révisions du jour</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  {todayTasks.filter((t) => !t.is_completed).length} restante(s)
                </span>
              </div>

              {todayTasks.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-medium text-foreground mt-2">Rien pour aujourd'hui !</p>
                  <p className="text-xs text-muted-foreground">Reviens demain pour ta prochaine tâche</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => {
                    const surah = surahs.find((s) => s.number === task.surah_number);
                    return (
                      <motion.div key={task.id} layout
                        className={`bg-card border rounded-2xl p-4 transition-colors ${task.is_completed ? "border-success/30 bg-success/5" : "border-border"}`}>
                        <div className="flex items-center gap-3">
                          <button onClick={() => !task.is_completed && completeTask(task.id)}
                            className="shrink-0">
                            {task.is_completed
                              ? <CheckCircle2 size={22} className="text-success" />
                              : <Circle size={22} className="text-muted-foreground" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.task_type === "new" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                                {task.task_type === "new" ? "Nouveau" : "Révision"}
                              </span>
                              <span className="font-arabic text-sm text-primary">{surah?.nameArabic}</span>
                            </div>
                            <p className={`text-xs mt-1 ${task.is_completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              Ayat {task.ayah_from}–{task.ayah_to}
                            </p>
                          </div>
                          {!task.is_completed && (
                            <button onClick={() => navigate(`/learn/${task.surah_number}`)}
                              className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              <Mic size={18} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ── Upcoming ── */}
            {upcomingTasks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-secondary" />
                  <span className="text-sm font-semibold text-foreground">À venir</span>
                </div>
                <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                  {upcomingTasks.map((task) => {
                    const surah = surahs.find((s) => s.number === task.surah_number);
                    return (
                      <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${task.task_type === "new" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                          {task.task_type === "new" ? "N" : "R"}
                        </span>
                        <span className="font-arabic text-xs text-primary">{surah?.nameArabic}</span>
                        <span className="text-[10px] text-muted-foreground flex-1">v.{task.ayah_from}–{task.ayah_to}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(task.task_date).toLocaleDateString("fr", { day: "numeric", month: "short" })}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Cloud sync hint */}
            {!isAuthenticated && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground">📱 Connecte-toi pour sauvegarder ton plan entre appareils</p>
                <button onClick={() => navigate("/auth")} className="mt-2 text-xs font-semibold text-primary">Se connecter →</button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-8">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-card-foreground mb-2">Supprimer le plan ?</h3>
            <p className="text-sm text-muted-foreground mb-6">Toutes les tâches et ta progression seront perdues.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-card-foreground">Annuler</button>
              <button onClick={() => { deletePlan(); setShowDeleteConfirm(false); }}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium">Supprimer</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
