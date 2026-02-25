import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Megaphone, Plus, Check, Send } from "lucide-react";
import { useAnnouncements, Announcement } from "@/hooks/useAnnouncements";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Announcements() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { classrooms } = useClassrooms();
  const classCodes = classrooms.map((c) => c.joinCode);
  const { announcements, unreadCount, createAnnouncement, markAsRead } = useAnnouncements(classCodes);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedClass, setSelectedClass] = useState(classrooms[0]?.joinCode || "");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim() || !selectedClass) {
      toast.error(t("auth.errorFields"));
      return;
    }
    setSending(true);
    const err = await createAnnouncement(selectedClass, title.trim(), message.trim());
    setSending(false);
    if (!err) {
      toast.success(t("announcements.sent"));
      setShowCreate(false);
      setTitle("");
      setMessage("");
    }
  };

  const handleExpand = (a: Announcement) => {
    setExpandedId(expandedId === a.id ? null : a.id);
    if (!a.isRead) markAsRead(a.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-4xl mb-4">📢</p>
        <h2 className="text-xl font-bold text-foreground mb-2">{t("announcements.title")}</h2>
        <p className="text-muted-foreground text-sm mb-4">{t("announcements.loginRequired")}</p>
        <Button onClick={() => navigate("/auth")} className="rounded-xl">{t("auth.login")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back")}</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone size={24} className="text-primary" />
            {t("announcements.title")}
          </h1>
          {classrooms.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)} className="rounded-xl">
              <Plus size={16} />
            </Button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
            {classrooms.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {classrooms.map((c) => (
                  <button
                    key={c.joinCode}
                    onClick={() => setSelectedClass(c.joinCode)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${selectedClass === c.joinCode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("announcements.titlePlaceholder")} maxLength={100} />
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("announcements.messagePlaceholder")} maxLength={1000} rows={3} />
            <Button onClick={handleCreate} disabled={sending} className="w-full rounded-xl">
              <Send size={16} />
              {sending ? "..." : t("announcements.send")}
            </Button>
          </motion.div>
        )}

        {/* List */}
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-muted-foreground text-sm">{t("announcements.empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a, i) => {
              const isExpanded = expandedId === a.id;
              const classroom = classrooms.find((c) => c.joinCode === a.class_code);
              return (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleExpand(a)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    a.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!a.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {format(new Date(a.created_at), "dd/MM")}
                        </span>
                      </div>
                      {classroom && <p className="text-[10px] text-muted-foreground">{classroom.name}</p>}
                      <p className={`text-xs text-muted-foreground mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                        {a.message}
                      </p>
                      {a.isRead && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                          <Check size={10} /> {t("announcements.read")}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
