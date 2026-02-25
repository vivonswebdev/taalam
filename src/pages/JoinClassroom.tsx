import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, UserPlus, CheckCircle2, AlertCircle, LogIn, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DbClassroom {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
}

export default function JoinClassroom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [classroom, setClassroom] = useState<DbClassroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [teacherName, setTeacherName] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  // Fetch classroom from DB by join_code
  useEffect(() => {
    if (!code) { setNotFound(true); setLoading(false); return; }

    (async () => {
      const { data } = await supabase
        .from("classrooms")
        .select("id, name, join_code, teacher_id")
        .eq("join_code", code.toUpperCase())
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setClassroom(data as DbClassroom);

      // Fetch member count
      const { count } = await supabase
        .from("classroom_members")
        .select("id", { count: "exact", head: true })
        .eq("classroom_id", data.id);
      setMemberCount(count || 0);

      // Fetch teacher name
      const { data: teacherProfile } = await supabase
        .from("profiles")
        .select("display_name, avatar_emoji")
        .eq("user_id", data.teacher_id)
        .maybeSingle();
      if (teacherProfile) {
        setTeacherName(`${teacherProfile.avatar_emoji} ${teacherProfile.display_name}`);
      }

      // Check if current user is already a member
      if (user) {
        const { data: membership } = await supabase
          .from("classroom_members")
          .select("id")
          .eq("classroom_id", data.id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (membership || data.teacher_id === user.id) {
          setAlreadyMember(true);
        }
      }

      setLoading(false);
    })();
  }, [code, user]);

  const handleJoin = async () => {
    if (!user || !classroom) return;
    setJoining(true);

    // Also save to localStorage for local hook compatibility
    try {
      const stored = JSON.parse(localStorage.getItem("quranEasyClassrooms") || "[]");
      if (!stored.find((c: any) => c.id === classroom.id)) {
        stored.push({
          id: classroom.id,
          name: classroom.name,
          teacherName: teacherName,
          teacherId: classroom.teacher_id,
          joinCode: classroom.join_code,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("quranEasyClassrooms", JSON.stringify(stored));
      }
    } catch {}

    const { error } = await supabase
      .from("classroom_members")
      .insert({ classroom_id: classroom.id, user_id: user.id });

    if (error && error.code !== "23505") {
      console.error(error);
      setJoining(false);
      return;
    }

    setJoined(true);
    setJoining(false);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Not found
  if (notFound || !classroom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">{t("join.notFound")}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t("join.notFoundDesc")} <span className="font-mono font-bold text-foreground">{code}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            {t("join.backHome")}
          </button>
        </motion.div>
      </div>
    );
  }

  // Success
  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">{t("join.success")}</h2>
          <p className="text-sm text-muted-foreground mb-1">{t("join.successDesc")}</p>
          <p className="font-semibold text-primary mb-6">"{classroom.name}"</p>
          <button
            onClick={() => navigate(`/classrooms/${classroom.id}`)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            Voir la classe
          </button>
        </motion.div>
      </div>
    );
  }

  // Main view — show class info
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-5"
      >
        {/* Class info */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{classroom.name}</h1>
          {teacherName && (
            <p className="text-sm text-muted-foreground mt-1">
              Professeur : {teacherName}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {memberCount} membre{memberCount > 1 ? "s" : ""} · Code : <span className="font-mono font-bold">{classroom.join_code}</span>
          </p>
        </div>

        {/* Already member */}
        {alreadyMember && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
            <CheckCircle2 size={20} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-semibold text-primary">Vous êtes déjà membre</p>
            <button
              onClick={() => navigate(`/classrooms/${classroom.id}`)}
              className="mt-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
            >
              Voir la classe
            </button>
          </div>
        )}

        {/* Not logged in */}
        {!user && !alreadyMember && (
          <div className="space-y-3">
            <div className="bg-accent/50 border border-border rounded-xl p-3 text-center">
              <LogIn size={20} className="text-primary mx-auto mb-1" />
              <p className="text-sm font-medium text-foreground">
                Connectez-vous pour rejoindre cette classe
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Créez un compte gratuit ou connectez-vous
              </p>
            </div>
            <button
              onClick={() => navigate(`/auth?redirect=/join/${code}`)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <LogIn size={16} /> S'inscrire / Se connecter
            </button>
          </div>
        )}

        {/* Logged in, not a member */}
        {user && !alreadyMember && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {joining ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            Rejoindre la classe
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-2 text-sm text-muted-foreground font-medium"
        >
          ← Retour à l'accueil
        </button>
      </motion.div>
    </div>
  );
}
