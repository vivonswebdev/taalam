import { ArrowLeft, BookOpen, ClipboardList, Eye, BarChart3, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";

const sections = [
  {
    icon: <ClipboardList size={18} className="text-primary" />,
    titleKey: "tuto.section1Title",
    lines: ["tuto.section1Line1", "tuto.section1Line2", "tuto.section1Line3", "tuto.section1Line4"],
  },
  {
    icon: <Eye size={18} className="text-primary" />,
    titleKey: "tuto.section2Title",
    lines: ["tuto.section2Line1", "tuto.section2Line2", "tuto.section2Line3"],
  },
  {
    icon: <BarChart3 size={18} className="text-primary" />,
    titleKey: "tuto.section3Title",
    lines: ["tuto.section3Line1", "tuto.section3Line2", "tuto.section3Line3"],
  },
  {
    icon: <Lightbulb size={18} className="text-primary" />,
    titleKey: "tuto.section4Title",
    lines: ["tuto.section4Line1", "tuto.section4Line2", "tuto.section4Line3", "tuto.section4Line4"],
  },
];

export default function AssignmentsTutorial() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-24">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            {t("tuto.pageTitle" as any)}
          </h1>
          <p className="text-xs text-muted-foreground">{t("tuto.pageSubtitle" as any)}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              {sec.icon}
              <h2 className="text-sm font-bold">{t(sec.titleKey as any)}</h2>
            </div>
            <ul className="space-y-1.5 ml-1">
              {sec.lines.map((key) => (
                <li key={key} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t(key as any)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
