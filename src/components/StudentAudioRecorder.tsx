import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  assignmentId: string;
  classId: string;
  onSubmitted?: () => void;
}

export default function StudentAudioRecorder({ assignmentId, classId, onSubmitted }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast({ title: "🎤 Microphone requis", variant: "destructive" });
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const submitAudio = useCallback(async () => {
    if (!audioBlob || !user) return;
    setSubmitting(true);
    try {
      const fileName = `${user.id}/${assignmentId}_${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("student-audio")
        .upload(fileName, audioBlob, { contentType: "audio/webm" });
      if (uploadError) throw uploadError;

      const { data: insertData, error: insertError } = await supabase
        .from("task_submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          class_id: classId,
          audio_url: fileName,
          status: "pending",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      toast({ title: "✅ " + t("halaqa.submitted" as any) });
      setAudioBlob(null);
      onSubmitted?.();

      // Trigger async Tajwid scoring via AI
      if (insertData?.id) {
        supabase.functions.invoke("score-tajwid", {
          body: { audio_path: fileName, submission_id: insertData.id },
        }).then(({ data: scoreData }) => {
          if (scoreData?.score != null) {
            toast({ title: `🎯 Tajwid: ${scoreData.score}%`, description: scoreData.details || "" });
            onSubmitted?.(); // refresh to show score
          }
        }).catch((e) => console.warn("Tajwid scoring failed:", e));
      }
    } catch (err: any) {
      toast({ title: t("common.error" as any), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }, [audioBlob, user, assignmentId, classId, t, onSubmitted]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-center gap-3">
        {!recording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            <Mic size={16} />
            {t("halaqa.uploadAudio" as any)}
          </button>
        )}

        {recording && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold animate-pulse"
          >
            <Square size={16} />
            {t("halaqa.recording" as any)}
          </button>
        )}

        {audioBlob && !submitting && (
          <div className="flex gap-2">
            <button
              onClick={() => setAudioBlob(null)}
              className="px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm"
            >
              🔄
            </button>
            <button
              onClick={submitAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
            >
              <Upload size={16} />
              {t("halaqa.uploadAudio" as any)}
            </button>
          </div>
        )}

        {submitting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            {t("halaqa.submitting" as any)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
