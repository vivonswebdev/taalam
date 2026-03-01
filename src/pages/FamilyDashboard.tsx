import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Users, Trophy, MessageCircle, Copy, Check, UserPlus, ChevronRight, BarChart3, Flame, Star, BookOpen } from "lucide-react";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const TROPHIES = [
  { type: "gold", emoji: "🏆", label: "Trophée d'or" },
  { type: "star", emoji: "⭐", label: "Étoile" },
  { type: "fire", emoji: "🔥", label: "Flamme" },
  { type: "heart", emoji: "❤️", label: "Cœur" },
];

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    families,
    loading,
    createFamily,
    joinFamily,
    sendNotification,
    getMembersForFamily,
    getMyRole,
    notifications,
    markNotificationRead,
    unreadCount,
  } = useFamily();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [trophyModal, setTrophyModal] = useState<{ familyId: string; toUserId: string; toName: string } | null>(null);
  const [msgModal, setMsgModal] = useState<{ familyId: string; toUserId: string; toName: string } | null>(null);
  const [msgText, setMsgText] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-14 text-center">
        <p className="text-muted-foreground mt-20">Connecte-toi pour accéder à la Classe Famille</p>
        <button onClick={() => navigate("/auth")} className="mt-4 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold">
          {t("auth.login")}
        </button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    const f = await createFamily(familyName.trim());
    if (f) {
      toast.success("Famille créée !");
      setShowCreate(false);
      setFamilyName("");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const ok = await joinFamily(joinCode.trim());
    if (ok) {
      toast.success("Tu as rejoint la famille !");
      setShowJoin(false);
      setJoinCode("");
    } else {
      toast.error("Code invalide");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copié !");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendTrophy = async (trophyType: string) => {
    if (!trophyModal) return;
    await sendNotification(trophyModal.familyId, trophyModal.toUserId, "trophy", { trophyType });
    toast.success(`Trophée envoyé à ${trophyModal.toName} !`);
    setTrophyModal(null);
  };

  const handleSendMessage = async () => {
    if (!msgModal || !msgText.trim()) return;
    await sendNotification(msgModal.familyId, msgModal.toUserId, "message", { text: msgText.trim() });
    toast.success(`Message envoyé à ${msgModal.toName} !`);
    setMsgModal(null);
    setMsgText("");
  };

  const unreadNotifs = notifications.filter((n) => !n.read_at);

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("quiz.back")}</span>
        </button>
        <h1 className="text-2xl font-bold text-foreground">👨‍👩‍👧‍👦 Classe Famille</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivez les progrès Hifz de vos enfants</p>
      </div>

      {/* Unread notifications */}
      {unreadNotifs.length > 0 && (
        <div className="px-6 mb-4 space-y-2">
          {unreadNotifs.slice(0, 3).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 flex items-center gap-3"
            >
              <span className="text-2xl">
                {n.type === "trophy" ? (TROPHIES.find((tr) => tr.type === (n.payload as any)?.trophyType)?.emoji || "🏆") : "💬"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {n.type === "trophy"
                    ? `${n.from_display_name} t'a envoyé un trophée !`
                    : `${n.from_display_name} : "${(n.payload as any)?.text || ""}"`}
                </p>
              </div>
              <button onClick={() => markNotificationRead(n.id)} className="text-xs text-muted-foreground">✓</button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-6 space-y-5">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : families.length === 0 ? (
          /* ═══ No family yet ═══ */
          <div className="text-center py-10 space-y-4">
            <span className="text-5xl block">👨‍👩‍👧‍👦</span>
            <p className="text-lg font-bold text-foreground">Pas encore de famille</p>
            <p className="text-sm text-muted-foreground">Créez une famille ou rejoignez-en une avec un code d'invitation.</p>
          </div>
        ) : (
          /* ═══ Family exists ═══ */
          families.map((family) => {
            const familyMembers = getMembersForFamily(family.id);
            const myRole = getMyRole(family.id);
            const children = familyMembers.filter((m) => m.role_in_family === "child");
            const parents = familyMembers.filter((m) => m.role_in_family === "parent");

            // Stats
            const totalXP = children.reduce((sum, c) => sum + (c.xp_total || 0), 0);
            const maxStreak = children.reduce((max, c) => Math.max(max, c.streak_days || 0), 0);
            const totalXPToday = children.reduce((sum, c) => sum + (c.xp_today || 0), 0);

            return (
              <div key={family.id} className="space-y-5">
                {/* ─── Family info block ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-foreground text-lg">{family.name}</h2>
                      <p className="text-xs text-muted-foreground">{familyMembers.length} membres · {children.length} enfant{children.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {/* Invite code */}
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">Code de partage :</span>
                    <span className="font-mono font-bold text-foreground tracking-widest text-sm flex-1">{family.invite_code}</span>
                    <button
                      onClick={() => handleCopyCode(family.invite_code)}
                      className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
                    >
                      {copiedCode === family.invite_code ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === family.invite_code ? "Copié" : "Copier"}
                    </button>
                  </div>
                </motion.div>

                {/* ─── Section: Enfants ─── */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Enfants</h3>
                  {children.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card border border-dashed border-border rounded-2xl p-5 text-center space-y-2"
                    >
                      <span className="text-3xl block">🧒</span>
                      <p className="text-sm font-medium text-foreground">Aucun enfant inscrit pour le moment</p>
                      <p className="text-xs text-muted-foreground">
                        Partagez le code <strong className="text-primary font-mono">{family.invite_code}</strong> avec vos enfants pour qu'ils rejoignent la classe.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {children.map((child, idx) => (
                        <motion.div
                          key={child.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                        >
                          {/* Child header */}
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{child.avatar_emoji || "🌙"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{child.display_name || "Enfant"}</p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-0.5"><Flame size={11} className="text-orange-400" /> {child.streak_days || 0}j</span>
                                <span className="flex items-center gap-0.5"><Star size={11} className="text-yellow-400" /> {child.xp_today || 0} XP aujourd'hui</span>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setTrophyModal({ familyId: family.id, toUserId: child.user_id, toName: child.display_name || "?" })}
                                className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Trophy size={14} className="text-secondary" />
                              </button>
                              <button
                                onClick={() => setMsgModal({ familyId: family.id, toUserId: child.user_id, toName: child.display_name || "?" })}
                                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <MessageCircle size={14} className="text-primary" />
                              </button>
                            </div>
                          </div>

                          {/* XP progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>XP total : {child.xp_total || 0}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, ((child.xp_total || 0) / Math.max(1, totalXP)) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* View detail button */}
                          <button
                            onClick={() => navigate(`/child/${child.user_id}`)}
                            className="w-full flex items-center justify-center gap-1 text-xs text-primary font-semibold py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            Voir le détail <ChevronRight size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── Section: Statistiques ─── */}
                {children.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Statistiques famille</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: totalXP, label: "XP total", emoji: "⚡", color: "text-primary", bg: "from-primary/15 to-primary/5" },
                        { value: `🔥 ${maxStreak}`, label: "Meilleur streak", emoji: "", color: "text-foreground", bg: "from-orange-500/15 to-orange-500/5" },
                        { value: `⭐ ${totalXPToday}`, label: "XP aujourd'hui", emoji: "", color: "text-foreground", bg: "from-yellow-500/15 to-yellow-500/5" },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl border border-border/40 rounded-2xl p-3.5 text-center shadow-sm`}
                        >
                          <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Section: Discussions ─── */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Discussions</h3>
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      // For now, use inline message modal for first child or show toast
                      if (children.length > 0) {
                        setMsgModal({ familyId: family.id, toUserId: children[0].user_id, toName: children[0].display_name || "Enfant" });
                      } else {
                        toast.info("Ajoutez des enfants d'abord !");
                      }
                    }}
                    className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageCircle size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-foreground">Ouvrir le chat de famille</p>
                      <p className="text-[11px] text-muted-foreground">Envoyez des messages et des trophées à vos enfants</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>

                {/* Child view (if user is child) */}
                {myRole === "child" && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground">
                      👨‍👩‍👧 Famille avec {parents.map((p) => p.display_name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{familyMembers.length} membres</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ─── Bottom buttons ─── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Nouvelle famille
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="flex-1 bg-card border border-border text-foreground rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <UserPlus size={16} /> Rejoindre
          </button>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Créer une famille</h3>
              <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Nom de la famille" className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">Annuler</button>
                <button onClick={handleCreate} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">Créer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setShowJoin(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Rejoindre une famille</h3>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Code d'invitation (6 lettres)" maxLength={6} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground font-mono text-center tracking-widest" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setShowJoin(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">Annuler</button>
                <button onClick={handleJoin} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">Rejoindre</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trophy modal */}
      <AnimatePresence>
        {trophyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setTrophyModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Envoyer un trophée à {trophyModal.toName}</h3>
              <div className="grid grid-cols-4 gap-3">
                {TROPHIES.map((tr) => (
                  <button key={tr.type} onClick={() => handleSendTrophy(tr.type)} className="flex flex-col items-center gap-1 p-3 bg-muted rounded-xl active:scale-95 transition-transform">
                    <span className="text-3xl">{tr.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{tr.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setTrophyModal(null)} className="w-full bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">Annuler</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message modal */}
      <AnimatePresence>
        {msgModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setMsgModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Message à {msgModal.toName}</h3>
              <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Bravo pour tes efforts ! Continue..." rows={3} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground resize-none" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => { setMsgModal(null); setMsgText(""); }} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">Annuler</button>
                <button onClick={handleSendMessage} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">Envoyer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
