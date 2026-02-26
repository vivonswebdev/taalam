import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Users, Trophy, MessageCircle, Copy, Check, UserPlus } from "lucide-react";
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

  // Unread notifications popup
  const unreadNotifs = notifications.filter((n) => !n.read_at);

  return (
    <div className="min-h-screen pb-24">
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
                {n.type === "trophy" ? (TROPHIES.find((t) => t.type === (n.payload as any)?.trophyType)?.emoji || "🏆") : "💬"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {n.type === "trophy"
                    ? `${n.from_display_name} t'a envoyé un trophée !`
                    : `${n.from_display_name} : "${(n.payload as any)?.text || ""}"`}
                </p>
              </div>
              <button
                onClick={() => markNotificationRead(n.id)}
                className="text-xs text-muted-foreground"
              >
                ✓
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Families */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-4xl">👨‍👩‍👧‍👦</p>
            <p className="text-muted-foreground">Pas encore de famille</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Créer
              </button>
              <button onClick={() => setShowJoin(true)} className="bg-muted text-foreground rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                <UserPlus size={16} /> Rejoindre
              </button>
            </div>
          </div>
        ) : (
          <>
            {families.map((family) => {
              const familyMembers = getMembersForFamily(family.id);
              const myRole = getMyRole(family.id);
              const children = familyMembers.filter((m) => m.role_in_family === "child");
              const parents = familyMembers.filter((m) => m.role_in_family === "parent");

              return (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      <h2 className="font-bold text-foreground">{family.name}</h2>
                    </div>
                    <button
                      onClick={() => handleCopyCode(family.invite_code)}
                      className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-xs font-mono text-muted-foreground"
                    >
                      {copiedCode === family.invite_code ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      {family.invite_code}
                    </button>
                  </div>

                  {/* Members list */}
                  {myRole === "parent" ? (
                    <div className="space-y-2">
                      {children.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Aucun enfant. Partagez le code <strong>{family.invite_code}</strong> !
                        </p>
                      ) : (
                        children.map((child) => (
                          <div key={child.id} className="flex items-center gap-3 bg-background/60 rounded-xl px-3 py-2.5">
                            <span className="text-2xl">{child.avatar_emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{child.display_name}</p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span>🔥 {child.streak_days}j</span>
                                <span>⭐ {child.xp_today} XP</span>
                                <span>🏅 {child.xp_total} total</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setTrophyModal({ familyId: family.id, toUserId: child.user_id, toName: child.display_name || "?" })}
                                className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center"
                              >
                                <Trophy size={14} className="text-secondary" />
                              </button>
                              <button
                                onClick={() => setMsgModal({ familyId: family.id, toUserId: child.user_id, toName: child.display_name || "?" })}
                                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                              >
                                <MessageCircle size={14} className="text-primary" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>👨‍👩‍👧 Famille avec {parents.map((p) => p.display_name).join(", ")}</p>
                      <p className="text-xs mt-1">{familyMembers.length} membres</p>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Add family buttons */}
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(true)} className="flex-1 bg-primary/10 border border-primary/20 text-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                <Plus size={14} /> Nouvelle famille
              </button>
              <button onClick={() => setShowJoin(true)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                <UserPlus size={14} /> Rejoindre
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Créer une famille</h3>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Nom de la famille"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground"
                autoFocus
              />
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
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Code d'invitation (6 lettres)"
                maxLength={6}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground font-mono text-center tracking-widest"
                autoFocus
              />
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
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Bravo pour tes efforts ! Continue..."
                rows={3}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground resize-none"
                autoFocus
              />
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
