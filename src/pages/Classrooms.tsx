import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Share2, Trash2, GraduationCap, UserPlus, LogIn } from "lucide-react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

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

const cosmicBg = "bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]";
const glass = "bg-white/[0.07] backdrop-blur-md border border-white/15";

export default function Classrooms() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { classrooms, createClassroom, deleteClassroom, getMembersForClass, shareClassroom, getNewMemberCount, markClassSeen, totalNewMembers } = useClassrooms();
  const { profiles } = useChildProfiles();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: taught } = await supabase
          .from("classrooms")
          .select("id, name, join_code, teacher_id, created_at")
          .eq("teacher_id", user.id);

        const { data: memberships } = await supabase
          .from("classroom_members")
          .select("classroom_id")
          .eq("user_id", user.id);

        const joinedIds = (memberships || []).map((m) => m.classroom_id);
        let joinedClasses: any[] = [];
        if (joinedIds.length > 0) {
          const { data } = await supabase
            .from("classrooms")
            .select("id, name, join_code, teacher_id, created_at")
            .in("id", joinedIds);
          joinedClasses = data || [];
        }

        const allDb = [...(taught || []), ...joinedClasses];
        const existingIds = new Set(classrooms.map((c) => c.id));
        const newOnes = allDb.filter((c) => !existingIds.has(c.id));
        if (newOnes.length > 0) {
          const mapped = newOnes.map((c) => ({
            id: c.id,
            name: c.name,
            teacherName: "",
            teacherId: c.teacher_id,
            joinCode: c.join_code,
            createdAt: c.created_at,
          }));
          const updated = [...classrooms, ...mapped];
          localStorage.setItem("quranEasyClassrooms", JSON.stringify(updated));
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to sync classrooms from DB:", err);
      }
    })();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (totalNewMembers > 0) {
      toast({
        title: `🎉 ${totalNewMembers} ${totalNewMembers > 1 ? t("classrooms.newStudentsPlural") : t("classrooms.newStudentSingular")}`,
        description: t("classrooms.newStudentToast"),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (!user) {
      toast({ title: "Connectez-vous d'abord", variant: "destructive" });
      return;
    }
    try {
      const joinCodeVal = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
      const { data: dbClass, error } = await supabase
        .from("classrooms")
        .insert({ name: newName.trim(), join_code: joinCodeVal, teacher_id: user.id })
        .select()
        .single();

      if (error) throw error;

      const localClass = {
        id: dbClass.id,
        name: dbClass.name,
        teacherName: teacherName.trim(),
        teacherId: user.id,
        joinCode: dbClass.join_code,
        createdAt: dbClass.created_at,
      };
      const current = JSON.parse(localStorage.getItem("quranEasyClassrooms") || "[]");
      localStorage.setItem("quranEasyClassrooms", JSON.stringify([...current, localClass]));
      window.location.reload();
    } catch (err: any) {
      toast({ title: t("common.error" as any), description: err.message, variant: "destructive" });
    }
    setNewName("");
    setTeacherName("");
    setShowCreate(false);
  };

  const handleViewDetail = (classId: string) => {
    markClassSeen(classId);
    navigate(`/classrooms/${classId}`);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (!user) {
      toast({ title: "Connectez-vous d'abord", description: "Allez sur la page de connexion", variant: "destructive" });
      return;
    }
    setJoining(true);
    try {
      const { data: rpcData, error } = await supabase
        .rpc("lookup_classroom_by_code", { _join_code: code.toUpperCase() });
      const classroom = rpcData?.[0] || null;

      if (error) throw error;
      if (!classroom) {
        toast({ title: "❌ " + t("classrooms.joinInvalidCode"), variant: "destructive" });
        setJoining(false);
        return;
      }

      const { data: existing } = await supabase
        .from("classroom_members")
        .select("id")
        .eq("classroom_id", classroom.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        toast({ title: t("classrooms.joinAlreadyMember") });
        setJoining(false);
        setShowJoin(false);
        setJoinCode("");
        return;
      }

      const { error: joinError } = await supabase
        .from("classroom_members")
        .insert({ classroom_id: classroom.id, user_id: user.id });

      if (joinError) throw joinError;

      const localClass = {
        id: classroom.id,
        name: classroom.name,
        teacherName: "",
        joinCode: code,
        createdAt: new Date().toISOString(),
      };
      const current = JSON.parse(localStorage.getItem("quranEasyClassrooms") || "[]");
      if (!current.some((c: any) => c.id === classroom.id)) {
        localStorage.setItem("quranEasyClassrooms", JSON.stringify([...current, localClass]));
      }

      toast({ title: `✅ ${t("classrooms.joinSuccess")} "${classroom.name}"` });
      setShowJoin(false);
      setJoinCode("");
      window.location.reload();
    } catch (err: any) {
      toast({ title: t("common.error" as any), description: err.message, variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={`${cosmicBg} min-h-screen pb-24`}>
      <NeonGrid />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/[0.05] backdrop-blur-md relative z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2 text-white">
            <GraduationCap size={20} className="text-cyan-400" />
            {t("classrooms.title")}
            {totalNewMembers > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-pulse">
                +{totalNewMembers}
              </Badge>
            )}
          </h1>
          <p className="text-xs text-white/60">{t("classrooms.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 relative z-10">
        {/* Join class button */}
        <button
          onClick={() => setShowJoin(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-cyan-400 bg-cyan-500/10 rounded-xl border border-cyan-500/20"
        >
          <LogIn size={16} /> {t("classrooms.joinClass")}
        </button>

        {/* Join modal */}
        {showJoin && (
          <div className={`${glass} rounded-xl p-4 space-y-3 overflow-hidden`}>
            <p className="text-sm font-semibold text-white">{t("classrooms.joinClass")}</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t("classrooms.joinCodePlaceholder")}
              maxLength={10}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none font-mono tracking-widest text-center uppercase text-white placeholder:text-white/30"
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowJoin(false); setJoinCode(""); }} className="flex-1 py-2 text-sm rounded-lg bg-white/10 text-white/70 font-medium">
                {t("classrooms.cancel")}
              </button>
              <button onClick={handleJoin} disabled={!joinCode.trim() || joining} className="flex-1 py-2 text-sm rounded-lg bg-cyan-500 text-white font-semibold disabled:opacity-50">
                {joining ? "..." : t("classrooms.joinBtn")}
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className={`${glass} rounded-xl p-4 space-y-3`}>
            <p className="text-sm font-semibold text-white">{t("classrooms.create")}</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("classrooms.namePlaceholder")}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white placeholder:text-white/30"
            />
            <input
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder={t("classrooms.teacherPlaceholder")}
              className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white placeholder:text-white/30"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm rounded-lg bg-white/10 text-white/70 font-medium">
                {t("classrooms.cancel")}
              </button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-2 text-sm rounded-lg bg-cyan-500 text-white font-semibold disabled:opacity-50">
                {t("classrooms.createBtn")}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {classrooms.length === 0 && !showCreate ? (
          <div className="text-center py-12">
            <GraduationCap size={40} className="mx-auto text-white/30 mb-3" />
            <p className="text-sm text-white/50">{t("classrooms.empty")}</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-cyan-400 font-semibold">
              + {t("classrooms.create")}
            </button>
          </div>
        ) : (
          classrooms.map((c) => {
            const memberIds = getMembersForClass(c.id);
            const memberProfiles = profiles.filter((p) => memberIds.includes(p.id));
            const newCount = getNewMemberCount(c.id);
            return (
              <div
                key={c.id}
                className={`${glass} rounded-xl p-4 space-y-3 relative`}
              >
                {newCount > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 shadow-md">
                      <UserPlus size={10} className="mr-0.5" /> +{newCount}
                    </Badge>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    {c.teacherName && <p className="text-xs text-white/50">{c.teacherName}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => shareClassroom(c)} className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center">
                      <Share2 size={14} className="text-cyan-400" />
                    </button>
                    <button onClick={() => deleteClassroom(c.id)} className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">{t("classrooms.code")}</span>
                  <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest">{c.joinCode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={14} className="text-white/40" />
                  <span className="text-xs text-white/50">
                    {memberProfiles.length} {t("classrooms.students")}
                  </span>
                  <div className="flex -space-x-1">
                    {memberProfiles.slice(0, 5).map((p) => (
                      <span key={p.id} className="text-sm" title={p.name}>{p.avatarEmoji}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(c.id)}
                    className="flex-1 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 rounded-lg"
                  >
                    {t("classrooms.viewDetail")}
                    {newCount > 0 && <span className="ml-1 text-red-400">({newCount} {t("classrooms.new")})</span>}
                  </button>
                  {user && c.teacherId === user.id && (
                    <button
                      onClick={() => navigate("/teacher-dashboard")}
                      className="py-2 px-3 text-xs font-semibold text-white bg-cyan-500/30 rounded-lg flex items-center gap-1"
                    >
                      <GraduationCap size={14} /> Dashboard
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
