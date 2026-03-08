import { ArrowLeft, GraduationCap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

interface TeacherHeaderProps {
  cosmic?: boolean;
}

export default function TeacherHeader({ cosmic }: TeacherHeaderProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const containerCls = cosmic
    ? "relative overflow-hidden border-b border-white/10 bg-white/[0.05] backdrop-blur-md"
    : "relative overflow-hidden border-b border-border bg-card";

  const gradientCls = cosmic
    ? "absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5"
    : "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5";

  const backBtnCls = cosmic
    ? "w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white"
    : "w-9 h-9 rounded-full bg-muted/80 backdrop-blur flex items-center justify-center";

  const titleCls = cosmic ? "text-white" : "";
  const iconCls = cosmic ? "text-cyan-400" : "text-primary";
  const subtitleCls = cosmic ? "text-white/60" : "text-muted-foreground";

  return (
    <div className={`${containerCls} relative z-10`}>
      <div className={gradientCls} />
      <div className="relative flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className={backBtnCls}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className={`text-lg font-bold flex items-center gap-2 ${titleCls}`}>
            <GraduationCap size={20} className={iconCls} />
            {t("teacher.title" as any)}
          </h1>
          <p className={`text-xs ${subtitleCls}`}>{t("teacher.subtitle" as any)}</p>
        </div>
      </div>
    </div>
  );
}
