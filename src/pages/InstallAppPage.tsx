import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-decimal list-inside space-y-2 mt-2">
      {steps.map((step, i) => (
        <li key={i} className="text-[12px] text-muted-foreground leading-relaxed">{step}</li>
      ))}
    </ol>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function InstallAppPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{t("install.title" as any)}</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">{t("install.subtitle" as any)}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* iPhone */}
        <Section icon="🍎" title={t("install.iosTitle" as any)}>
          <StepList steps={[
            t("install.iosStep1" as any),
            t("install.iosStep2" as any),
            t("install.iosStep3" as any),
            t("install.iosStep4" as any),
            t("install.iosStep5" as any),
            t("install.iosStep6" as any),
          ]} />
        </Section>

        {/* Android */}
        <Section icon="🤖" title={t("install.androidTitle" as any)}>
          <StepList steps={[
            t("install.androidStep1" as any),
            t("install.androidStep2" as any),
            t("install.androidStep3" as any),
            t("install.androidStep4" as any),
            t("install.androidStep5" as any),
            t("install.androidStep6" as any),
          ]} />
        </Section>

        {/* Desktop */}
        <Section icon="💻" title={t("install.desktopTitle" as any)}>
          <StepList steps={[
            t("install.desktopStep1" as any),
            t("install.desktopStep2" as any),
            t("install.desktopStep3" as any),
            t("install.desktopStep4" as any),
            t("install.desktopStep5" as any),
          ]} />
        </Section>
      </div>
    </div>
  );
}
