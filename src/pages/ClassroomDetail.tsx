import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Share2, Trash2, BarChart3, Clock } from "lucide-react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, nl, ar } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

const LOCALES: Record<string, typeof fr> = { fr, en: enUS, nl, ar };

export default function ClassroomDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { classrooms, getMembersForClass, addMember, removeMember, shareClassroom } = useClassrooms();
  const { profiles, getChildMastery, getSessionsForChild, getLastActivity } = useChildProfiles();

  const classroom = classrooms.find((c) => c.id === classId);
  const memberIds = classId ? getMembersForClass(classId) : [];
  const memberProfiles = profiles.filter((p) => memberIds.includes(p.id));
  const nonMembers = profiles.filter((p) => !memberIds.includes(p.id));

  const [showAdd, setShowAdd] = useState(false);

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("classrooms.notFound")}</p>
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

      <div className="px-4 py-4 space-y-4">
        {/* Add member */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{t("classrooms.students")} ({memberProfiles.length})</p>
          {nonMembers.length > 0 && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-xs text-primary font-semibold">
              <UserPlus size={14} /> {t("classrooms.addStudent")}
            </button>
          )}
        </div>

        {/* Add member picker */}
        {showAdd && nonMembers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
            {nonMembers.map((p) => (
              <button
                key={p.id}
                onClick={() => { addMember(classroom.id, p.id); }}
                className="flex items-center gap-1.5 bg-muted border border-border rounded-full px-3 py-1.5 text-xs font-medium"
              >
                <span>{p.avatarEmoji}</span> {p.name}
                <UserPlus size={12} className="text-primary" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Members list with stats */}
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

                {/* Mastery bar */}
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
      </div>
      <BottomNav />
    </div>
  );
}
