import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Share2, Trash2, BarChart3, Clock, Send, MessageSquare, Trophy, LogOut, Sparkles, History, QrCode, X, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useWeeklyChallenge } from "@/hooks/useWeeklyChallenge";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import StudentTaskKanban from "@/components/StudentTaskKanban";
import { surahs } from "@/data/surahs";
import WeeklyChallengeCard from "@/components/WeeklyChallengeCard";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, nl, ar } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";

const LOCALES: Record<string, typeof fr> = { fr, en: enUS, nl, ar };

interface ChatMessage {
  id: string;
  classroom_id: string;
  author_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

function LeaveClassButton({ classId, isTeacher, user, classroomName, onLeft }: {
  classId: string; isTeacher: boolean; user: any; classroomName: string; onLeft: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isTeacher) {
        // Delete entire class + members
        await supabase.from("classroom_members").delete().eq("classroom_id", classId);
        await supabase.from("class_messages").delete().eq("classroom_id", classId);
        await supabase.from("class_weekly_challenges").delete().eq("class_id", classId);
        await supabase.from("classrooms").delete().eq("id", classId);
        toast.success("Classe supprimée");
      } else {
        // Just remove membership
        await supabase.from("classroom_members").delete().eq("classroom_id", classId).eq("user_id", user.id);
        toast.success("Vous avez quitté le groupe");
      }
      onLeft();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="mx-4 mt-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          {isTeacher
            ? `Vous êtes le professeur. Supprimer la classe "${classroomName}" complètement ?`
            : `Quitter le groupe "${classroomName}" ?`}
        </p>
        <p className="text-xs text-muted-foreground">
          {isTeacher ? "Tous les membres seront retirés et les données supprimées." : "Vous pourrez rejoindre à nouveau avec le code."}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirm(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted font-medium">
            Non
          </button>
          <button onClick={handleLeave} disabled={loading} className="flex-1 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground font-semibold disabled:opacity-50">
            {loading ? "..." : "Oui, confirmer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6 flex justify-center">
      <button
        onClick={() => setConfirm(true)}
        className="text-[11px] text-muted-foreground hover:text-destructive/70 transition-colors underline underline-offset-2"
      >
        {isTeacher ? "Supprimer la classe" : "Quitter le groupe"}
      </button>
    </div>
  );
}

export default function ClassroomDetail() {
  const { classId: rawClassId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { classrooms, getMembersForClass, addMember, removeMember, shareClassroom } = useClassrooms();
  const { profiles, getChildMastery, getSessionsForChild, getLastActivity } = useChildProfiles();

  // Resolve classId: if it's not a UUID, look it up by join_code
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = rawClassId ? UUID_RE.test(rawClassId) : false;
  const [resolvedClassId, setResolvedClassId] = useState<string | null>(isUuid ? rawClassId! : null);

  useEffect(() => {
    if (isUuid || !rawClassId) return;
    // Try to find in local classrooms first
    const local = classrooms.find((c) => c.id === rawClassId || c.joinCode === rawClassId);
    if (local && UUID_RE.test(local.id)) {
      setResolvedClassId(local.id);
      return;
    }
    // Lookup by join_code in DB
    supabase
      .rpc("lookup_classroom_by_code", { _join_code: rawClassId.toUpperCase() })
      .then(({ data: rpcData }) => {
        const data = rpcData?.[0] || null;
        if (data) {
          setResolvedClassId(data.id);
          // Redirect to proper UUID URL
          navigate(`/classrooms/${data.id}`, { replace: true });
        }
      });
  }, [rawClassId, isUuid, classrooms, navigate]);

  const classId = resolvedClassId;

  const {
    challenge, results, myResult, loading: challengeLoading,
    createChallenge, submitResult, weekStart, pastChallenges,
  } = useWeeklyChallenge(classId ?? undefined);

  const { assignments: studentAssignments, markSeen } = useStudentAssignments(classId);

  const classroom = classrooms.find((c) => c.id === classId || c.id === rawClassId);
  const isTeacher = !!(user && classroom && classroom.teacherId === user.id);
  const [dbTeacherId, setDbTeacherId] = useState<string | null>(null);
  useEffect(() => {
    if (!classId) return;
    supabase.from("classrooms").select("teacher_id").eq("id", classId).maybeSingle()
      .then(({ data }) => { if (data) setDbTeacherId(data.teacher_id); });
  }, [classId]);
  const isTeacherFinal = isTeacher || (user && dbTeacherId === user.id);

  const memberIds = classId ? getMembersForClass(classId) : [];
  const memberProfiles = profiles.filter((p) => memberIds.includes(p.id));
  const nonMembers = profiles.filter((p) => !memberIds.includes(p.id));

  // DB member profiles for challenge card
  const [dbMembers, setDbMembers] = useState<Map<string, { name: string; emoji: string }>>(new Map());
  useEffect(() => {
    if (!classId) return;
    (async () => {
      const { data: mems } = await supabase
        .from("classroom_members").select("user_id").eq("classroom_id", classId);
      const uids = (mems || []).map((m: any) => m.user_id);
      if (dbTeacherId) uids.push(dbTeacherId);
      if (uids.length === 0) return;
      const { data: profs } = await supabase
        .from("profiles").select("user_id, display_name, avatar_emoji").in("user_id", uids);
      const map = new Map<string, { name: string; emoji: string }>();
      (profs || []).forEach((p: any) => map.set(p.user_id, { name: p.display_name, emoji: p.avatar_emoji }));
      setDbMembers(map);
    })();
  }, [classId, dbTeacherId]);

  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    if (!classId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("class_messages")
        .select("*")
        .eq("classroom_id", classId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as ChatMessage[]);
      // Mark chat as read
      localStorage.setItem(`chat_last_read_${classId}`, new Date().toISOString());
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`class-messages-${classId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "class_messages", filter: `classroom_id=eq.${classId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Share my progress in chat
  const handleShareProgress = async () => {
    if (!user || !classId) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_emoji, xp_total, sessions_count, mastery_score")
      .eq("user_id", user.id)
      .maybeSingle();
    const { data: progress } = await supabase
      .from("user_progress")
      .select("streak_days, xp_total")
      .eq("user_id", user.id)
      .maybeSingle();

    const name = profile?.display_name || "Élève";
    const emoji = profile?.avatar_emoji || "🌙";
    const xp = progress?.xp_total || profile?.xp_total || 0;
    const streak = progress?.streak_days || 0;
    const sessions = profile?.sessions_count || 0;
    const mastery = profile?.mastery_score || 0;

    const msg = `📊 ${emoji} ${name} partage sa progression !\n🔥 Série : ${streak} jours\n⭐ XP : ${xp}\n📖 Sessions : ${sessions}\n🎯 Maîtrise : ${Math.round(mastery)}%`;

    const authorName = user.user_metadata?.display_name || user.email || "Utilisateur";
    await supabase.from("class_messages").insert({
      classroom_id: classId,
      author_id: user.id,
      author_name: `📊 ${authorName}`,
      message: msg,
    });
    const { data } = await supabase
      .from("class_messages")
      .select("*")
      .eq("classroom_id", classId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as ChatMessage[]);
    toast.success("Progression partagée !");
  };

  // Auto-announce challenge creation
  const handleCreateChallengeWithAnnounce = async (sn: number, af: number, at: number, dx: boolean) => {
    const ch = await createChallenge(sn, af, at, dx);
    if (!ch || !user || !classId) return;

    const { surahs } = await import("@/data/surahs");
    const surah = surahs.find((s: any) => s.number === sn);
    const surahLabel = surah ? `${surah.nameArabic} (${surah.name})` : `Sourate ${sn}`;

    const authorName = user.user_metadata?.display_name || user.email || "Professeur";
    const msg = `🏆 Nouveau défi de la semaine !\n📖 ${surahLabel} — Ayahs ${af} à ${at}${dx ? "\n⚡ Double XP activé !" : ""}\n\n🎤 Commencez maintenant depuis l'onglet Défi !`;

    await supabase.from("class_messages").insert({
      classroom_id: classId,
      author_id: user.id,
      author_name: `🏆 ${authorName}`,
      message: msg,
    });
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !user || !classId || sending) return;
    setSending(true);
    setNewMessage("");
    try {
      const authorName = user.user_metadata?.display_name || user.email || "Utilisateur";
      const { error } = await supabase.from("class_messages").insert({
        classroom_id: classId,
        author_id: user.id,
        author_name: authorName,
        message: text.slice(0, 500),
      });
      if (error) throw error;
      const { data } = await supabase
        .from("class_messages")
        .select("*")
        .eq("classroom_id", classId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as ChatMessage[]);
    } catch (err) {
      console.error(err);
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  if (!classroom && !resolvedClassId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate("/classrooms")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{classroom.name}</h1>
          <p className="text-xs text-muted-foreground">{t("classrooms.code")}: {classroom.joinCode}</p>
        </div>
        <button onClick={() => setShowQR(true)} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <QrCode size={16} className="text-primary" />
        </button>
        <button onClick={() => shareClassroom(classroom)} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Share2 size={16} className="text-primary" />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && classroom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Invitation QR</h3>
              <button onClick={() => setShowQR(false)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
            <div className="bg-white rounded-xl p-4 inline-block mx-auto">
              <QRCodeSVG
                value={`https://iqraacoran.lovable.app/join/${classroom.joinCode}`}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="font-bold text-foreground">{classroom.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Code : <span className="font-mono font-bold text-primary">{classroom.joinCode}</span>
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Scannez ce QR code pour rejoindre la classe
            </p>
            <button
              onClick={() => shareClassroom(classroom)}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={14} /> Partager le lien
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Leave / Delete button */}
      <LeaveClassButton
        classId={classId!}
        isTeacher={!!isTeacherFinal}
        user={user}
        classroomName={classroom?.name || ""}
        onLeft={() => {
          // Remove from local storage
          const stored = JSON.parse(localStorage.getItem("quranEasyClassrooms") || "[]");
          localStorage.setItem("quranEasyClassrooms", JSON.stringify(stored.filter((c: any) => c.id !== classId)));
          navigate("/classrooms", { replace: true });
        }}
      />

      <Tabs defaultValue="challenge" className="px-4 py-3">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="challenge" className="text-xs gap-1">
            <Trophy size={14} /> Défi
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs gap-1">
            <UserPlus size={14} /> {t("classrooms.students")}
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs gap-1">
            <MessageSquare size={14} /> {t("classrooms.messages")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenge" className="mt-3 space-y-4">
          <WeeklyChallengeCard
            challenge={challenge}
            results={results}
            myResult={myResult}
            isTeacher={!!isTeacherFinal}
            loading={challengeLoading}
            onCreateChallenge={(sn, af, at, dx) => handleCreateChallengeWithAnnounce(sn, af, at, dx)}
            onStartChallenge={() => {
              if (challenge) {
                const surahNum = challenge.surah_number;
                navigate(`/recitation?surah=${surahNum}&from=${challenge.ayah_from}&to=${challenge.ayah_to}&challengeId=${challenge.id}&classId=${classId}`);
              }
            }}
            memberProfiles={dbMembers}
          />

          {/* Student assignments */}
          {!isTeacherFinal && studentAssignments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-primary" />
                  <p className="text-xs font-bold">{t("teacher.assignments" as any)}</p>
                </div>
                <button onClick={() => navigate("/assignments-tutorial")} className="text-[10px] text-primary font-medium hover:underline">
                  {t("tuto.pageTitle" as any)}
                </button>
              </div>
              {studentAssignments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => markSeen(a.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card border border-border text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.type} • 📅 {a.due_date}
                    </p>
                  </div>
                  {a.isNew && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Past challenges history */}
          {pastChallenges.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <History size={14} />
                <p className="text-xs font-semibold">Défis précédents</p>
              </div>
              {pastChallenges.map((pc) => {
                const s = surahs.find((s) => s.number === pc.surah_number);
                return (
                  <div key={pc.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">
                        {s ? `${s.nameArabic} (${s.name})` : `Sourate ${pc.surah_number}`}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Semaine du {new Date(pc.week_start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Ayahs {pc.ayah_from}–{pc.ayah_to} · {pc.results.length} participant{pc.results.length > 1 ? "s" : ""}
                    </p>
                    {pc.results.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {pc.results.slice(0, 5).map((r, i) => {
                          const prof = dbMembers.get(r.user_id);
                          return (
                            <span key={r.id} className="flex items-center gap-1 text-[10px] bg-muted rounded-full px-2 py-0.5">
                              <span className="font-bold text-primary">{i + 1}.</span>
                              {prof?.emoji || "👤"} {prof?.name || "Membre"} — {Math.round(r.score)}%
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Students tab — visible to all members */}
        <TabsContent value="students" className="space-y-4 mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t("classrooms.students")} ({dbMembers.size})</p>
            {isTeacherFinal && nonMembers.length > 0 && (
              <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                <UserPlus size={14} /> {t("classrooms.addStudent")}
              </button>
            )}
          </div>

          {isTeacherFinal && showAdd && nonMembers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
              {nonMembers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addMember(classroom.id, p.id)}
                  className="flex items-center gap-1.5 bg-muted border border-border rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  <span>{p.avatarEmoji}</span> {p.name}
                  <UserPlus size={12} className="text-primary" />
                </button>
              ))}
            </motion.div>
          )}

          {dbMembers.size === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t("classrooms.noStudents")}</p>
            </div>
          ) : (
            Array.from(dbMembers.entries()).map(([uid, prof]) => {
              const isCurrentUser = uid === user?.id;
              const isTeacherMember = uid === dbTeacherId;
              return (
                <motion.div
                  key={uid}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prof.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {prof.name}{isCurrentUser ? " (vous)" : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isTeacherMember ? "👨‍🏫 Professeur" : "📖 Élève"}
                      </p>
                    </div>
                    {isTeacherFinal && !isTeacherMember && (
                      <button
                        onClick={() => removeMember(classroom.id, uid)}
                        className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        {/* Messages tab */}
        <TabsContent value="messages" className="mt-3">
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={28} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">{t("classrooms.noMessages")}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.author_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {!isMe && <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.author_name}</p>}
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: LOCALES[lang] || LOCALES.fr })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input + share progress */}
            <div className="border-t border-border p-2 space-y-2">
              <button
                onClick={handleShareProgress}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-primary bg-primary/5 border border-primary/20 rounded-lg"
              >
                <Sparkles size={12} /> Partager ma progression
              </button>
              <div className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={t("classrooms.typeMessage")}
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <BottomNav />
    </div>
  );
}
