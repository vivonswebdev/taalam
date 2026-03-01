import { ArrowLeft, GraduationCap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

export default function TeacherHeader() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden border-b border-border bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="relative flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/80 backdrop-blur flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <GraduationCap size={20} className="text-primary" />
            {t("teacher.title" as any)}
          </h1>
          <p className="text-xs text-muted-foreground">{t("teacher.subtitle" as any)}</p>
        </div>
      </div>
    </div>
  );
}
