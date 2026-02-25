import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Share2, Trash2, BarChart3, Clock, Send, MessageSquare, Trophy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useWeeklyChallenge } from "@/hooks/useWeeklyChallenge";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import WeeklyChallengeCard from "@/components/WeeklyChallengeCard";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, nl, ar } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="px-4 mt-3">
      <button
        onClick={() => setConfirm(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20"
      >
        <LogOut size={16} />
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
      .from("classrooms")
      .select("id")
      .eq("join_code", rawClassId.toUpperCase())
      .maybeSingle()
      .then(({ data }) => {
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
    createChallenge, submitResult, weekStart,
  } = useWeeklyChallenge(classId ?? undefined);

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
      // Refetch messages to ensure they appear even if realtime is slow
      const { data } = await supabase
        .from("class_messages")
        .select("*")
        .eq("classroom_id", classId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data as ChatMessage[]);
    } catch (err) {
      console.error(err);
      setNewMessage(text); // Restore on error
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
        <button onClick={() => shareClassroom(classroom)} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Share2 size={16} className="text-primary" />
        </button>
      </div>

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

        {/* Challenge tab */}
        <TabsContent value="challenge" className="mt-3">
          <WeeklyChallengeCard
            challenge={challenge}
            results={results}
            myResult={myResult}
            isTeacher={!!isTeacherFinal}
            loading={challengeLoading}
            onCreateChallenge={(sn, af, at, dx) => createChallenge(sn, af, at, dx)}
            onStartChallenge={() => {
              if (challenge) {
                const surahNum = challenge.surah_number;
                navigate(`/recitation?surah=${surahNum}&from=${challenge.ayah_from}&to=${challenge.ayah_to}&challengeId=${challenge.id}&classId=${classId}`);
              }
            }}
            memberProfiles={dbMembers}
          />
        </TabsContent>

        {/* Students tab */}
        <TabsContent value="students" className="space-y-4 mt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t("classrooms.students")} ({memberProfiles.length})</p>
            {nonMembers.length > 0 && (
              <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                <UserPlus size={14} /> {t("classrooms.addStudent")}
              </button>
            )}
          </div>

          {showAdd && nonMembers.length > 0 && (
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

          {memberProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t("classrooms.noStudents")}</p>
            </div>
          ) : (
            memberProfiles.map((child) => {
              const mastery = getChildMastery(child.id);
              const sessionCount = getSessionsForChild(child.id).length;
              const lastDate = getLastActivity(child.id);
              const lastAgo = lastDate
                ? formatDistanceToNow(new Date(lastDate), { addSuffix: true, locale: LOCALES[lang] || LOCALES.fr })
                : null;

              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{child.avatarEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{child.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><BarChart3 size={10} /> {sessionCount} sessions</span>
                        {lastAgo && <span className="flex items-center gap-0.5"><Clock size={10} /> {lastAgo}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(classroom.id, child.id)}
                      className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 size={12} className="text-destructive" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-14">{t("classrooms.mastery")}</span>
                    <Progress value={mastery} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-bold text-primary w-8 text-right">{mastery}%</span>
                  </div>
                  <button
                    onClick={() => navigate(`/parent/child/${child.id}`)}
                    className="w-full py-1.5 text-[11px] font-semibold text-primary bg-primary/5 rounded-lg"
                  >
                    {t("classrooms.viewChild")}
                  </button>
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

            {/* Input */}
            <div className="border-t border-border p-2 flex gap-2">
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
        </TabsContent>
      </Tabs>
      <BottomNav />
    </div>
  );
}
