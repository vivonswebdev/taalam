import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

const cosmicBg = "bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]";
const glass = "bg-white/[0.07] backdrop-blur-md border border-white/15";

function NeonGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
      style={{
        backgroundImage:
          "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

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
  const { t } = useLanguage();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isTeacher) {
        await supabase.from("classroom_members").delete().eq("classroom_id", classId);
        await supabase.from("class_messages").delete().eq("classroom_id", classId);
        await supabase.from("class_weekly_challenges").delete().eq("class_id", classId);
        await supabase.from("classrooms").delete().eq("id", classId);
        toast.success("Classe supprimée");
      } else {
        await supabase.from("classroom_members").delete().eq("classroom_id", classId).eq("user_id", user.id);
        toast.success(t("common.leftGroup" as any));
      }
      onLeft();
    } catch (err: any) {
      toast.error(err.message || t("common.error" as any));
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="mx-4 mt-3 bg-red-500/10 border border-red-400/30 rounded-xl p-4 space-y-3 relative z-10">
        <p className="text-sm font-semibold text-red-400">
          {isTeacher
            ? `Vous êtes le professeur. Supprimer la classe "${classroomName}" complètement ?`
            : `Quitter le groupe "${classroomName}" ?`}
        </p>
        <p className="text-xs text-white/50">
          {isTeacher ? "Tous les membres seront retirés et les données supprimées." : "Vous pourrez rejoindre à nouveau avec le code."}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setConfirm(false)} className="flex-1 py-2 text-sm rounded-lg bg-white/10 text-white/70 font-medium">
            Non
          </button>
          <button onClick={handleLeave} disabled={loading} className="flex-1 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold disabled:opacity-50">
            {loading ? "..." : "Oui, confirmer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6 flex justify-center relative z-10">
      <button
        onClick={() => setConfirm(true)}
        className="text-[11px] text-white/40 hover:text-red-400/70 transition-colors underline underline-offset-2"
      >
        {isTeacher ? "Supprimer la classe" : "Quitter le groupe"}
      </button>
    </div>
  );
}

export default function ClassroomDetail() {
  const { classId: rawClassId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCoord = (location.state as any)?.from === "coord";
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { classrooms, getMembersForClass, addMember, removeMember, shareClassroom } = useClassrooms();
  const { profiles, getChildMastery, getSessionsForChild, getLastActivity } = useChildProfiles();

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = rawClassId ? UUID_RE.test(rawClassId) : false;
  const [resolvedClassId, setResolvedClassId] = useState<string | null>(isUuid ? rawClassId! : null);

  useEffect(() => {
    if (isUuid || !rawClassId) return;
    const local = classrooms.find((c) => c.id === rawClassId || c.joinCode === rawClassId);
    if (local && UUID_RE.test(local.id)) {
      setResolvedClassId(local.id);
      return;
    }
    supabase
      .rpc("lookup_classroom_by_code", { _join_code: rawClassId.toUpperCase() })
      .then(({ data: rpcData }) => {
        const data = rpcData?.[0] || null;
        if (data) {
          setResolvedClassId(data.id);
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      localStorage.setItem(`chat_last_read_${classId}`, new Date().toISOString());
    };
    loadMessages();

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const [dbClassroom, setDbClassroom] = useState<{ name: string; joinCode: string; teacherId: string } | null>(null);
  useEffect(() => {
    if (classroom || !classId) return;
    supabase.from("classrooms").select("name, join_code, teacher_id").eq("id", classId).maybeSingle()
      .then(({ data }) => {
        if (data) setDbClassroom({ name: data.name, joinCode: data.join_code, teacherId: data.teacher_id });
      });
  }, [classroom, classId]);

  const effectiveClassroom = classroom || (dbClassroom ? { ...dbClassroom, id: classId! } : null);

  if (!effectiveClassroom) {
    return (
      <div className={`${cosmicBg} min-h-screen flex items-center justify-center`}>
        <p className="text-white/50">Chargement...</p>
      </div>
    );
  }

  return (
    <div className={`${cosmicBg} min-h-screen pb-24`}>
      <NeonGrid />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/[0.05] backdrop-blur-md relative z-10">
        <button onClick={() => navigate(fromCoord ? "/coord" : "/classrooms")} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ArrowLeft size={18} />
        </button>
        {fromCoord && (
          <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">
            {t("coord.title" as any)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate text-white">{effectiveClassroom.name}</h1>
          <p className="text-xs text-white/50">{t("classrooms.code")}: {effectiveClassroom.joinCode}</p>
        </div>
        <button onClick={() => setShowQR(true)} className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <QrCode size={16} className="text-cyan-400" />
        </button>
        <button onClick={() => classroom && shareClassroom(classroom)} className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <Share2 size={16} className="text-cyan-400" />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && effectiveClassroom && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${glass} rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t("common.invitationQR" as any)}</h3>
              <button onClick={() => setShowQR(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                <X size={14} />
              </button>
            </div>
            <div className="bg-white rounded-xl p-4 inline-block mx-auto">
              <QRCodeSVG
                value={`https://iqraacoran.lovable.app/join/${effectiveClassroom.joinCode}`}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="font-bold text-white">{effectiveClassroom.name}</p>
              <p className="text-xs text-white/50 mt-0.5">
                Code : <span className="font-mono font-bold text-cyan-400">{effectiveClassroom.joinCode}</span>
              </p>
            </div>
            <p className="text-[10px] text-white/40">
              {t("common.scanQR" as any)}
            </p>
            <button
              onClick={() => classroom && shareClassroom(classroom)}
              className="w-full py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Share2 size={14} /> {t("common.shareLink" as any)}
            </button>
          </div>
        </div>
      )}

      {/* Leave / Delete button */}
      <LeaveClassButton
        classId={classId!}
        isTeacher={!!isTeacherFinal}
        user={user}
        classroomName={effectiveClassroom.name || ""}
        onLeft={() => {
          const stored = JSON.parse(localStorage.getItem("quranEasyClassrooms") || "[]");
          localStorage.setItem("quranEasyClassrooms", JSON.stringify(stored.filter((c: any) => c.id !== classId)));
          navigate("/classrooms", { replace: true });
        }}
      />

      <Tabs defaultValue="challenge" className="px-4 py-3 relative z-10">
        <TabsList className="w-full grid grid-cols-3 bg-white/[0.07] border border-white/10">
          <TabsTrigger value="challenge" className="text-xs gap-1 text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <Trophy size={14} /> Défi
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs gap-1 text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <UserPlus size={14} /> {t("classrooms.students")}
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs gap-1 text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
            <MessageSquare size={14} /> {t("classrooms.messages")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenge" className="mt-3 space-y-4">
          {/* Student Assignments */}
          {!isTeacherFinal && studentAssignments.length > 0 && (
            <div className={`${glass} rounded-xl p-4`}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-cyan-400" />
                {t("classrooms.myAssignments" as any) || "Mes devoirs"}
              </h3>
              <div className="space-y-2">
                {studentAssignments.map(a => (
                  <div key={a.id} className="flex items-start justify-between p-2.5 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                      <p className="text-[10px] text-white/50">
                        {t("classrooms.dueDate" as any)}: {new Date(a.due_date).toLocaleDateString(lang)}
                      </p>
                    </div>
                    {(a as any).seen === false && (
                      <button onClick={() => markSeen(a.id)} className="text-[9px] bg-cyan-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                        {t("classrooms.markSeen" as any) || "Vu"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <WeeklyChallengeCard
            challenge={challenge}
            results={results}
            myResult={myResult}
            loading={challengeLoading}
            isTeacher={!!isTeacherFinal}
            onCreateChallenge={handleCreateChallengeWithAnnounce}
            onSubmitResult={submitResult}
            weekStart={weekStart}
            pastChallenges={pastChallenges}
            dbMembers={dbMembers}
          />

          {!isTeacherFinal && classId && (
            <StudentTaskKanban classId={classId} />
          )}
        </TabsContent>

        <TabsContent value="students" className="mt-3 space-y-3">
          {/* DB members */}
          {dbMembers.size > 0 && (
            <div className={`${glass} rounded-xl p-4 space-y-2`}>
              <h3 className="text-sm font-bold text-white mb-2">
                {t("classrooms.students")} ({dbMembers.size})
              </h3>
              {[...dbMembers.entries()].map(([uid, info]) => (
                <div key={uid} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <span className="text-sm font-medium text-white">{info.name}</span>
                  </div>
                  {uid === dbTeacherId && (
                    <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-bold">Prof</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Local profiles */}
          {memberProfiles.length > 0 && (
            <div className={`${glass} rounded-xl p-4 space-y-2`}>
              <h3 className="text-sm font-bold text-white mb-2">
                {t("classrooms.localStudents" as any) || "Élèves locaux"} ({memberProfiles.length})
              </h3>
              {memberProfiles.map(p => {
                const mastery = getChildMastery(p.id);
                const sessions = getSessionsForChild(p.id);
                const last = getLastActivity(p.id);
                const dateLoc = LOCALES[lang] || fr;
                return (
                  <div key={p.id} className="p-2.5 rounded-xl bg-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{p.avatarEmoji} {p.name}</span>
                      <button onClick={() => removeMember(classId!, p.id)} className="text-red-400 p-1"><Trash2 size={12} /></button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/50">
                      <span>📖{sessions}s</span>
                      {last && <span>🕐{formatDistanceToNow(new Date(last), { locale: dateLoc, addSuffix: true })}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={mastery} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-bold text-cyan-400">{Math.round(mastery)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add member */}
          {nonMembers.length > 0 && (
            <div className="relative z-10">
              <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                <UserPlus size={14} /> {t("classrooms.addStudent")}
              </button>
              {showAdd && (
                <div className={`mt-2 ${glass} rounded-xl p-3 space-y-2`}>
                  {nonMembers.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { addMember(classId!, p.id); setShowAdd(false); }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <span>{p.avatarEmoji}</span>
                      <span className="text-sm text-white">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-3 space-y-3">
          <div className={`${glass} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={14} className="text-cyan-400" /> {t("classrooms.messages")}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleShareProgress} className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-1 rounded-lg font-semibold flex items-center gap-1">
                  <BarChart3 size={10} /> {t("classrooms.shareProgress" as any)}
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-3">
              {messages.length === 0 && (
                <p className="text-center text-white/40 text-xs py-4">{t("classrooms.noMessages" as any)}</p>
              )}
              {messages.map(msg => {
                const isMe = msg.author_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-2.5 rounded-xl text-xs ${
                      isMe ? "bg-cyan-500/20 text-white" : "bg-white/5 text-white/90"
                    }`}>
                      {!isMe && <p className="font-bold text-white/70 text-[10px] mb-0.5">{msg.author_name}</p>}
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-[9px] text-white/30 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={t("classrooms.messagePlaceholder" as any)}
                className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white placeholder:text-white/30"
                maxLength={500}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 rounded-lg bg-cyan-500 text-white flex items-center justify-center disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
