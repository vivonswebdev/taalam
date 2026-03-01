import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, MessageSquare, Play, Pause, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { TaskSubmission } from "@/hooks/useTaskSubmissions";

interface Props {
  submissions: TaskSubmission[];
  onReview: (id: string, status: "approved" | "rejected", note?: string) => Promise<void>;
  onGetAudioUrl: (path: string) => Promise<string | null>;
}

function AudioCard({ submission, onGetAudioUrl }: { submission: TaskSubmission; onGetAudioUrl: Props["onGetAudioUrl"] }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => { audio?.pause(); };
  }, [audio]);

  const handlePlay = async () => {
    if (playing && audio) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (!audioUrl && submission.audio_url) {
      const url = await onGetAudioUrl(submission.audio_url);
      if (url) {
        setAudioUrl(url);
        const a = new Audio(url);
        a.onended = () => setPlaying(false);
        a.play();
        setAudio(a);
        setPlaying(true);
      }
    } else if (audioUrl) {
      const a = new Audio(audioUrl);
      a.onended = () => setPlaying(false);
      a.play();
      setAudio(a);
      setPlaying(true);
    }
  };

  if (!submission.audio_url) return null;

  return (
    <button
      onClick={handlePlay}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
    >
      {playing ? <Pause size={12} /> : <Play size={12} />}
      {playing ? "⏸" : "▶️"}
      {submission.score_tajwid != null && (
        <span className="ml-1 text-[10px] font-bold">{Math.round(submission.score_tajwid)}%</span>
      )}
    </button>
  );
}

function SubmissionCard({ submission, onReview, onGetAudioUrl }: {
  submission: TaskSubmission;
  onReview: Props["onReview"];
  onGetAudioUrl: Props["onGetAudioUrl"];
}) {
  const { t } = useLanguage();
  const [noteInput, setNoteInput] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const handleReview = async (status: "approved" | "rejected") => {
    setReviewing(true);
    try {
      await onReview(submission.id, status, noteInput || undefined);
      toast({ title: status === "approved" ? "✅ " + t("halaqa.approved" as any) : "❌ " + t("halaqa.rejected" as any) });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setReviewing(false);
      setShowNote(false);
      setNoteInput("");
    }
  };

  const statusColors = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded-xl p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{submission.student_emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{submission.student_name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{submission.assignment_title}</p>
        </div>
        <Badge variant="outline" className={`text-[9px] ${statusColors[submission.status]}`}>
          {submission.status === "pending" && <Clock size={8} className="mr-0.5" />}
          {submission.status === "approved" && <CheckCircle2 size={8} className="mr-0.5" />}
          {submission.status === "rejected" && <XCircle size={8} className="mr-0.5" />}
          {t(`halaqa.${submission.status}` as any)}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <AudioCard submission={submission} onGetAudioUrl={onGetAudioUrl} />
        <span className="text-[9px] text-muted-foreground">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {submission.teacher_note && (
        <p className="text-[10px] text-muted-foreground bg-muted rounded-lg px-2 py-1">
          💬 {submission.teacher_note}
        </p>
      )}

      {submission.status === "pending" && (
        <div className="space-y-2">
          {showNote && (
            <input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={t("halaqa.addNote" as any)}
              className="w-full bg-muted rounded-lg px-3 py-1.5 text-xs outline-none"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] hover:bg-muted/80"
            >
              <MessageSquare size={10} /> {t("halaqa.note" as any)}
            </button>
            <button
              onClick={() => handleReview("approved")}
              disabled={reviewing}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-semibold hover:bg-emerald-600 disabled:opacity-50"
            >
              <Check size={10} /> {t("halaqa.approve" as any)}
            </button>
            <button
              onClick={() => handleReview("rejected")}
              disabled={reviewing}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500 text-white text-[10px] font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              <X size={10} /> {t("halaqa.reject" as any)}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function TaskKanban({ submissions, onReview, onGetAudioUrl }: Props) {
  const { t } = useLanguage();

  const columns = [
    { key: "pending" as const, label: t("halaqa.pending" as any), icon: "⏳", color: "text-amber-500" },
    { key: "approved" as const, label: t("halaqa.approved" as any), icon: "✅", color: "text-emerald-500" },
    { key: "rejected" as const, label: t("halaqa.rejected" as any), icon: "❌", color: "text-red-500" },
  ];

  const grouped = {
    pending: submissions.filter(s => s.status === "pending"),
    approved: submissions.filter(s => s.status === "approved"),
    rejected: submissions.filter(s => s.status === "rejected"),
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground">{t("halaqa.noSubmissions" as any)}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-bold mb-3">{t("halaqa.submissions" as any)}</p>

      {/* Mobile: tabs-style */}
      <div className="space-y-4">
        {columns.map(col => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold ${col.color}`}>{col.icon} {col.label}</span>
              <Badge variant="secondary" className="text-[9px]">{grouped[col.key].length}</Badge>
            </div>
            <AnimatePresence mode="popLayout">
              {grouped[col.key].length > 0 ? (
                <div className="space-y-2">
                  {grouped[col.key].map(s => (
                    <SubmissionCard
                      key={s.id}
                      submission={s}
                      onReview={onReview}
                      onGetAudioUrl={onGetAudioUrl}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground text-center py-3 bg-muted/50 rounded-xl">—</p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
