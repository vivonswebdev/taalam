import { useState, useCallback } from "react";
import { Lock, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User;
}

export function ParentalCodeCard({ user }: Props) {
  const { t } = useLanguage();
  const [hasCode, setHasCode] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch once on mount
  const fetchCode = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("mode_password")
      .eq("user_id", user.id)
      .maybeSingle();
    setHasCode(!!data?.mode_password);
  }, [user.id]);

  // Lazy load
  if (hasCode === null) {
    fetchCode();
  }

  const handleSave = async () => {
    if (codeInput.length !== 4 || !/^\d{4}$/.test(codeInput)) {
      toast.error(t("modePassword.tooShort" as any) || "Le code doit contenir exactement 4 chiffres");
      return;
    }
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ mode_password: codeInput })
      .eq("user_id", user.id);
    setHasCode(true);
    setEditing(false);
    setCodeInput("");
    setLoading(false);
    toast.success(t("modePassword.created" as any) || "Code parental enregistré !");
  };

  const handleRemove = async () => {
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ mode_password: null })
      .eq("user_id", user.id);
    setHasCode(false);
    setEditing(false);
    setCodeInput("");
    setLoading(false);
    toast.success(t("modePassword.removed" as any) || "Code parental supprimé");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.055 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-1">
          <Lock size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-card-foreground">
              {t("settings.parentalCode" as any) || "Code parental"}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("settings.parentalCodeDesc" as any) || "Protège la sortie du mode enfant avec un code à 4 chiffres"}
            </p>
          </div>
          {hasCode && !editing && (
            <ShieldCheck size={18} className="text-primary" />
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-3">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="1234"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              className="text-center text-lg tracking-[0.5em]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => { setEditing(false); setCodeInput(""); }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSave}
                disabled={loading || codeInput.length !== 4}
              >
                {t("common.save" as any) || "Enregistrer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => { setEditing(true); setCodeInput(""); }}
            >
              {hasCode
                ? (t("settings.pinChange" as any) || "Changer le code")
                : (t("settings.parentalCodeCreate" as any) || "Créer un code")}
            </Button>
            {hasCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={loading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
