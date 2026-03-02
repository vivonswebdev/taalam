import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode, type UserMode } from "@/hooks/useUserMode";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/trackEvent";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ALL_MODES: { id: UserMode; icon: string; titleKey: string }[] = [
  { id: "solo", icon: "🕌", titleKey: "more.modeSolo.title" },
  { id: "child", icon: "🧒", titleKey: "more.modeChild.title" },
  { id: "teacher", icon: "👨‍🏫", titleKey: "more.modeTeacher.title" },
  { id: "parent", icon: "👨‍👩‍👧", titleKey: "more.modeParent.title" },
];

export function ModeSelector() {
  const { t } = useLanguage();
  const { mode, setMode } = useUserMode();
  const { user } = useAuth();

  const [showDialog, setShowDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [modePassword, setModePassword] = useState<string | null>(null);
  const [passwordLoaded, setPasswordLoaded] = useState(false);

  const handleModeClick = async (next: UserMode) => {
    if (next === mode) return;

    if (!user) {
      // No auth, just switch
      await setMode(next);
      trackEvent("mode_selected", "settings", { mode: next });
      return;
    }

    // Fetch current mode_password from profile
    const { data } = await supabase
      .from("profiles")
      .select("mode_password")
      .eq("user_id", user.id)
      .maybeSingle();

    const pwd = data?.mode_password ?? null;
    setModePassword(pwd);
    setPasswordLoaded(true);
    setSelectedMode(next);
    setPasswordInput("");

    if (!pwd) {
      // No password set yet → create one
      setIsCreating(true);
    } else {
      setIsCreating(false);
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedMode || !user) return;

    if (isCreating) {
      if (passwordInput.length < 4) {
        toast.error(t("modePassword.tooShort" as any) || "Minimum 4 caractères");
        return;
      }
      // Save new password and switch mode
      await supabase
        .from("profiles")
        .update({ mode_password: passwordInput })
        .eq("user_id", user.id);

      await setMode(selectedMode);
      trackEvent("mode_selected", "settings", { mode: selectedMode });
      toast.success(t("modePassword.created" as any) || "Mot de passe créé !");
      setShowDialog(false);
      setPasswordInput("");
    } else {
      // Verify password
      if (passwordInput === modePassword) {
        await setMode(selectedMode);
        trackEvent("mode_selected", "settings", { mode: selectedMode });
        toast.success(
          t("modePassword.modeChanged" as any) ||
            `Mode changé : ${t(ALL_MODES.find((m) => m.id === selectedMode)?.titleKey as any)}`
        );
        setShowDialog(false);
        setPasswordInput("");
      } else {
        toast.error(t("modePassword.incorrect" as any) || "Mot de passe incorrect");
        setPasswordInput("");
      }
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{t("more.chooseModeTitle" as any)}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 transition-all ${
                  active
                    ? "bg-primary/15 border border-primary ring-1 ring-primary/30"
                    : "bg-card border border-border hover:border-muted-foreground/30"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className={`text-[10px] font-semibold leading-tight text-center ${active ? "text-primary" : "text-card-foreground"}`}>
                  {t(m.titleKey as any)}
                </span>
                {active && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={18} className="text-primary" />
              {isCreating
                ? (t("modePassword.createTitle" as any) || "Créer un mot de passe")
                : (t("modePassword.enterTitle" as any) || "Mot de passe requis")}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? (t("modePassword.createDesc" as any) || "Créez un mot de passe pour sécuriser les changements de mode (min. 4 caractères)")
                : (t("modePassword.enterDesc" as any) || "Entrez votre mot de passe pour changer de mode")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              maxLength={20}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowDialog(false); setPasswordInput(""); }}
              >
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                {isCreating
                  ? (t("modePassword.create" as any) || "Créer")
                  : (t("common.confirm"))}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
