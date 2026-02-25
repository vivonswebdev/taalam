import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import IslamicAvatarPicker from "@/components/IslamicAvatarPicker";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signUpWithEmail, sendMagicLink } = useAuth();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌙");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !displayName.trim()) {
      toast.error(t("auth.errorFields"));
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), displayName.trim(), avatarEmoji, isPublic);
      toast.success(t("auth.signupSuccess"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      toast.error(t("auth.errorEmail"));
      return;
    }
    setLoading(true);
    try {
      await sendMagicLink(email.trim());
      setMagicLinkSent(true);
      toast.success(t("auth.magicLinkSent"));
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">📧</motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t("auth.checkEmail")}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t("auth.checkEmailDesc")}</p>
        <Button variant="outline" onClick={() => setMagicLinkSent(false)}>{t("join.back")}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back")}</span>
        </button>
      </div>

      <div className="px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signup" ? t("auth.signupTitle") : t("auth.loginTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === "signup" ? t("auth.signupDesc") : t("auth.loginDesc")}
          </p>
        </motion.div>

        {/* Toggle signup / login */}
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            {t("auth.signup")}
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            {t("auth.login")}
          </button>
        </div>

        {mode === "signup" ? (
          <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Avatar */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{t("auth.chooseAvatar")}</label>
              <IslamicAvatarPicker selected={avatarEmoji} onSelect={setAvatarEmoji} />
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("auth.displayName")}</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ahmed, Fatima..."
                maxLength={50}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("auth.email")}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{t("auth.publicProfile")}</p>
                <p className="text-xs text-muted-foreground">{t("auth.publicProfileDesc")}</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Button onClick={handleSignUp} disabled={loading} className="w-full h-12 text-base rounded-xl">
              <Sparkles size={18} />
              {loading ? "..." : t("auth.createAccount")}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("auth.email")}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <Button onClick={handleMagicLink} disabled={loading} className="w-full h-12 text-base rounded-xl">
              <Mail size={18} />
              {loading ? "..." : t("auth.sendMagicLink")}
            </Button>

            <p className="text-xs text-center text-muted-foreground">{t("auth.magicLinkInfo")}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
