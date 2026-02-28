import { ArrowLeft, HelpCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import BottomNav from "@/components/BottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_KEYS = [
  { q: "help.qWhatIsTaaloum", a: "help.aWhatIsTaaloum", section: "A" },
  { q: "help.qDataSaved", a: "help.aDataSaved", section: "A" },
  { q: "help.qHowClassesWork", a: "help.aHowClassesWork", section: "B" },
  { q: "help.qAssignments", a: "help.aAssignments", section: "B" },
  { q: "help.qTeacherSeesWhat", a: "help.aTeacherSeesWhat", section: "B" },
  { q: "help.qHabits", a: "help.aHabits", section: "C" },
  { q: "help.qHifzTracking", a: "help.aHifzTracking", section: "C" },
  { q: "help.qPrayersTracking", a: "help.aPrayersTracking", section: "C" },
  { q: "help.qWhoSeesStats", a: "help.aWhoSeesStats", section: "D" },
  { q: "help.qDataSharing", a: "help.aDataSharing", section: "D" },
];

const SECTION_LABELS: Record<string, string> = {
  A: "help.sectionGeneral",
  B: "help.sectionClasses",
  C: "help.sectionHabits",
  D: "help.sectionPrivacy",
};

const TERMS_KEYS = ["terms.purpose", "terms.account", "terms.data", "terms.liability", "terms.contact"];

export default function FaqAndTermsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const sections = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            {t("help.title" as any)}
          </h1>
          <p className="text-xs text-muted-foreground">{t("help.subtitle" as any)}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* FAQ Sections */}
        {sections.map((sec) => {
          const items = FAQ_KEYS.filter((f) => f.section === sec);
          return (
            <div key={sec} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {t(SECTION_LABELS[sec] as any)}
              </p>
              <Accordion type="multiple" className="bg-card border border-border rounded-xl overflow-hidden">
                {items.map((item, idx) => (
                  <AccordionItem key={item.q} value={item.q} className={idx < items.length - 1 ? "border-b border-border" : "border-0"}>
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium text-left hover:no-underline">
                      {t(item.q as any)}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">
                      {t(item.a as any)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}

        {/* Terms */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Shield size={12} />
            {t("terms.title" as any)}
          </p>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {TERMS_KEYS.map((key) => (
              <p key={key} className="text-xs text-muted-foreground leading-relaxed">
                {t(key as any)}
              </p>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
