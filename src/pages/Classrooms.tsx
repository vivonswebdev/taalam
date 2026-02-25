import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, Share2, Trash2, GraduationCap, UserPlus } from "lucide-react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";

export default function Classrooms() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { classrooms, createClassroom, deleteClassroom, getMembersForClass, shareClassroom, getNewMemberCount, markClassSeen, totalNewMembers } = useClassrooms();
  const { profiles } = useChildProfiles();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  // Show toast on mount if there are new members
  useEffect(() => {
    if (totalNewMembers > 0) {
      toast({
        title: `🎉 ${totalNewMembers} ${totalNewMembers > 1 ? t("classrooms.newStudentsPlural") : t("classrooms.newStudentSingular")}`,
        description: t("classrooms.newStudentToast"),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => {
    if (!newName.trim()) return;
    createClassroom(newName.trim(), teacherName.trim());
    setNewName("");
    setTeacherName("");
    setShowCreate(false);
  };

  const handleViewDetail = (classId: string) => {
    markClassSeen(classId);
    navigate(`/classrooms/${classId}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <GraduationCap size={20} className="text-primary" />
            {t("classrooms.title")}
            {totalNewMembers > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-pulse">
                +{totalNewMembers}
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">{t("classrooms.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Create form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <p className="text-sm font-semibold">{t("classrooms.create")}</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("classrooms.namePlaceholder")}
              className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder={t("classrooms.teacherPlaceholder")}
              className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm rounded-lg bg-muted text-muted-foreground font-medium">
                {t("classrooms.cancel")}
              </button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                {t("classrooms.createBtn")}
              </button>
            </div>
          </motion.div>
        )}

        {/* List */}
        {classrooms.length === 0 && !showCreate ? (
          <div className="text-center py-12">
            <GraduationCap size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t("classrooms.empty")}</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary font-semibold">
              + {t("classrooms.create")}
            </button>
          </div>
        ) : (
          classrooms.map((c) => {
            const memberIds = getMembersForClass(c.id);
            const memberProfiles = profiles.filter((p) => memberIds.includes(p.id));
            const newCount = getNewMemberCount(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 space-y-3 relative"
              >
                {/* New member badge */}
                {newCount > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-bounce shadow-md">
                      <UserPlus size={10} className="mr-0.5" /> +{newCount}
                    </Badge>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    {c.teacherName && <p className="text-xs text-muted-foreground">{c.teacherName}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => shareClassroom(c)}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <Share2 size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={() => deleteClassroom(c.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Join code */}
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t("classrooms.code")}</span>
                  <span className="text-sm font-mono font-bold text-primary tracking-widest">{c.joinCode}</span>
                </div>

                {/* Members preview */}
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {memberProfiles.length} {t("classrooms.students")}
                  </span>
                  <div className="flex -space-x-1">
                    {memberProfiles.slice(0, 5).map((p) => (
                      <span key={p.id} className="text-sm" title={p.name}>{p.avatarEmoji}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetail(c.id)}
                  className="w-full py-2 text-xs font-semibold text-primary bg-primary/5 rounded-lg"
                >
                  {t("classrooms.viewDetail")}
                  {newCount > 0 && <span className="ml-1 text-destructive">({newCount} {t("classrooms.new")})</span>}
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
