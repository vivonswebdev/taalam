import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Users, Trophy, MessageCircle, Copy, Check, UserPlus, ChevronRight, Flame, Star, Zap, TrendingUp, Share2 } from "lucide-react";
import { useFamily, type FamilyMember } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import FamilyShareCard from "@/components/FamilyShareCard";

const TROPHIES = [
  { type: "gold", emoji: "🏆", label: "gold" },
  { type: "star", emoji: "⭐", label: "star" },
  { type: "fire", emoji: "🔥", label: "fire" },
  { type: "heart", emoji: "❤️", label: "heart" },
];

function getLevel(xp: number) {
  if (xp >= 10000) return 20;
  return Math.floor(xp / 500) + 1;
}

function getFamilyBadge(totalXp: number, t: (k: any) => string) {
  if (totalXp >= 10000) return { emoji: "💎", label: t("family.badgePlatinum"), color: "from-violet-500/20 to-violet-500/5" };
  if (totalXp >= 5000) return { emoji: "🥇", label: t("family.badgeGold"), color: "from-yellow-500/20 to-yellow-500/5" };
  if (totalXp >= 2000) return { emoji: "🥈", label: t("family.badgeSilver"), color: "from-slate-400/20 to-slate-400/5" };
  return { emoji: "🥉", label: t("family.badgeBronze"), color: "from-orange-400/20 to-orange-400/5" };
}

function Sparkline({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="inline-block ml-2">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function ChildCard({ child, totalXp, familyId, onTrophy, onMsg, t }: {
  child: FamilyMember; totalXp: number; familyId: string;
  onTrophy: (fid: string, uid: string, name: string) => void;
  onMsg: (fid: string, uid: string, name: string) => void;
  t: (k: any) => string;
}) {
  const navigate = useNavigate();
  const level = getLevel(child.xp_total || 0);
  // Fake sparkline from xp_today (would need historical data in production)
  const sparkData = useMemo(() => {
    const base = child.xp_today || 0;
    return Array.from({ length: 7 }, (_, i) => Math.max(0, base - Math.floor(Math.random() * 20) + i * 3));
  }, [child.xp_today]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="text-3xl">{child.avatar_emoji || "🌙"}</span>
          <span className="absolute -bottom-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {level}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{child.display_name || t("family.child")}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-0.5"><Flame size={11} className="text-orange-400" /> {child.streak_days || 0}{t("family.days")}</span>
            <span className="flex items-center gap-0.5"><Star size={11} className="text-yellow-400" /> Lv.{level}</span>
            <span className="flex items-center gap-0.5"><Zap size={11} className="text-primary" /> {child.xp_today || 0} XP</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onTrophy(familyId, child.user_id, child.display_name || "?")}
            className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Trophy size={14} className="text-secondary" />
          </button>
          <button
            onClick={() => onMsg(familyId, child.user_id, child.display_name || "?")}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <MessageCircle size={14} className="text-primary" />
          </button>
        </div>
      </div>

      {/* XP bar + sparkline */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>XP : {child.xp_total || 0}</span>
          <Sparkline data={sparkData} />
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((child.xp_total || 0) / Math.max(1, totalXp)) * 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate(`/child/${child.user_id}`)}
        className="w-full flex items-center justify-center gap-1 text-xs text-primary font-semibold py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        {t("family.viewDetail")} <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}

export default function FamilyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    families, loading, createFamily, joinFamily, sendNotification,
    getMembersForFamily, getMyRole, notifications, markNotificationRead,
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
        <p className="text-muted-foreground mt-20">{t("family.loginRequired")}</p>
        <button onClick={() => navigate("/auth")} className="mt-4 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold">
          {t("auth.login")}
        </button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    const f = await createFamily(familyName.trim());
    if (f) { toast.success(t("family.familyCreated")); setShowCreate(false); setFamilyName(""); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const ok = await joinFamily(joinCode.trim());
    if (ok) { toast.success(t("family.joinedFamily")); setShowJoin(false); setJoinCode(""); }
    else toast.error(t("family.invalidCode"));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t("family.codeCopied"));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendTrophy = async (trophyType: string) => {
    if (!trophyModal) return;
    await sendNotification(trophyModal.familyId, trophyModal.toUserId, "trophy", { trophyType });
    toast.success(t("family.trophySent"));
    setTrophyModal(null);
  };

  const handleSendMessage = async () => {
    if (!msgModal || !msgText.trim()) return;
    await sendNotification(msgModal.familyId, msgModal.toUserId, "message", { text: msgText.trim() });
    toast.success(t("family.messageSent"));
    setMsgModal(null); setMsgText("");
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
        <h1 className="text-2xl font-bold text-foreground">{t("family.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("family.subtitle")}</p>
      </div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <div className="px-6 mb-4 space-y-2">
          {unreadNotifs.slice(0, 3).map((n) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">
                {n.type === "trophy" ? (TROPHIES.find((tr) => tr.type === (n.payload as any)?.trophyType)?.emoji || "🏆") : "💬"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {n.type === "trophy"
                    ? `${n.from_display_name} ${t("family.trophyNotif")}`
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
          <div className="text-center py-10 space-y-4">
            <span className="text-5xl block">👨‍👩‍👧‍👦</span>
            <p className="text-lg font-bold text-foreground">{t("family.noFamily")}</p>
            <p className="text-sm text-muted-foreground">{t("family.noFamilyDesc")}</p>
          </div>
        ) : (
          families.map((family) => {
            const familyMembers = getMembersForFamily(family.id);
            const myRole = getMyRole(family.id);
            const children = familyMembers.filter((m) => m.role_in_family === "child");
            const parents = familyMembers.filter((m) => m.role_in_family === "parent");

            const totalXP = familyMembers.reduce((s, c) => s + (c.xp_total || 0), 0);
            const maxStreak = familyMembers.reduce((m, c) => Math.max(m, c.streak_days || 0), 0);
            const avgStreak = familyMembers.length > 0
              ? Math.round(familyMembers.reduce((s, c) => s + (c.streak_days || 0), 0) / familyMembers.length * 10) / 10
              : 0;
            const totalXPToday = familyMembers.reduce((s, c) => s + (c.xp_today || 0), 0);
            const badge = getFamilyBadge(totalXP, t);

            return (
              <div key={family.id} className="space-y-5">
                {/* Family info */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-foreground text-lg">{family.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {familyMembers.length} {t("family.members")} · {children.length} {children.length > 1 ? t("family.childPlural") : t("family.child")}
                      </p>
                    </div>
                    {/* Badge */}
                    <div className={`bg-gradient-to-br ${badge.color} rounded-xl px-2.5 py-1.5 text-center`}>
                      <span className="text-lg">{badge.emoji}</span>
                      <p className="text-[9px] text-muted-foreground font-semibold">{badge.label.replace(/🥉|🥈|🥇|💎/g, "").trim()}</p>
                    </div>
                  </div>
                  {/* Invite code */}
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">{t("family.shareCode")} :</span>
                    <span className="font-mono font-bold text-foreground tracking-widest text-sm flex-1">{family.invite_code}</span>
                    <button
                      onClick={() => handleCopyCode(family.invite_code)}
                      className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
                    >
                      {copiedCode === family.invite_code ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === family.invite_code ? t("family.copied") : t("family.copy")}
                    </button>
                  </div>
                </motion.div>

                {/* Stats grid */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("family.familyStats")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: totalXP, label: t("family.totalXp"), icon: <Zap size={16} className="text-primary" />, bg: "from-primary/15 to-primary/5" },
                      { value: `${avgStreak}${t("family.days")}`, label: t("family.avgStreak"), icon: <TrendingUp size={16} className="text-emerald-500" />, bg: "from-emerald-500/15 to-emerald-500/5" },
                      { value: `🔥 ${maxStreak}`, label: t("family.bestStreak"), icon: null, bg: "from-orange-500/15 to-orange-500/5" },
                      { value: `⭐ ${totalXPToday}`, label: t("family.xpToday"), icon: null, bg: "from-yellow-500/15 to-yellow-500/5" },
                    ].map((stat, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                        className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl border border-border/40 rounded-2xl p-3.5 text-center shadow-sm`}>
                        {stat.icon && <div className="flex justify-center mb-1">{stat.icon}</div>}
                        <span className="text-lg font-bold text-foreground">{stat.value}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Children */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("family.children")}</h3>
                  {children.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-card border border-dashed border-border rounded-2xl p-5 text-center space-y-2">
                      <span className="text-3xl block">🧒</span>
                      <p className="text-sm font-medium text-foreground">{t("family.noChildren")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("family.noChildrenDesc")} <strong className="text-primary font-mono">{family.invite_code}</strong>
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {children.map((child) => (
                        <ChildCard
                          key={child.id}
                          child={child}
                          totalXp={totalXP}
                          familyId={family.id}
                          onTrophy={(fid, uid, name) => setTrophyModal({ familyId: fid, toUserId: uid, toName: name })}
                          onMsg={(fid, uid, name) => setMsgModal({ familyId: fid, toUserId: uid, toName: name })}
                          t={t}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Discussions */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("family.discussions")}</h3>
                  <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (children.length > 0) {
                        setMsgModal({ familyId: family.id, toUserId: children[0].user_id, toName: children[0].display_name || t("family.child") });
                      } else toast.info(t("family.addChildrenFirst"));
                    }}
                    className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:bg-accent/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageCircle size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-foreground">{t("family.openChat")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("family.chatDesc")}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>

                {/* Child view */}
                {myRole === "child" && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground">
                      👨‍👩‍👧 {t("family.familyWith")} {parents.map((p) => p.display_name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{familyMembers.length} {t("family.members")}</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bottom buttons */}
        <div className="flex gap-3 pt-2">
          <button onClick={() => setShowCreate(true)}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20">
            <Plus size={16} /> {t("family.newFamily")}
          </button>
          <button onClick={() => setShowJoin(true)}
            className="flex-1 bg-card border border-border text-foreground rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <UserPlus size={16} /> {t("family.join")}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">{t("family.createTitle")}</h3>
              <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder={t("family.namePlaceholder")} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">{t("family.cancel")}</button>
                <button onClick={handleCreate} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">{t("family.create")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setShowJoin(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">{t("family.joinTitle")}</h3>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder={t("family.codePlaceholder")} maxLength={6} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground font-mono text-center tracking-widest" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setShowJoin(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">{t("family.cancel")}</button>
                <button onClick={handleJoin} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">{t("family.join")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trophyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setTrophyModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">{t("family.sendTrophy")} {trophyModal.toName}</h3>
              <div className="grid grid-cols-4 gap-3">
                {TROPHIES.map((tr) => (
                  <button key={tr.type} onClick={() => handleSendTrophy(tr.type)} className="flex flex-col items-center gap-1 p-3 bg-muted rounded-xl active:scale-95 transition-transform">
                    <span className="text-3xl">{tr.emoji}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setTrophyModal(null)} className="w-full bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">{t("family.cancel")}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {msgModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={() => setMsgModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">{t("family.messageTo")} {msgModal.toName}</h3>
              <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder={t("family.msgPlaceholder")} rows={3} className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground resize-none" autoFocus />
              <div className="flex gap-3">
                <button onClick={() => { setMsgModal(null); setMsgText(""); }} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-sm font-semibold">{t("family.cancel")}</button>
                <button onClick={handleSendMessage} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold">{t("family.send")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
