import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import IslamicAvatarPicker from "@/components/IslamicAvatarPicker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { t } = useLanguage();
  const { signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<"signup" | "login" | "forgot" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌙");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSignUp = async () => {
    if (!email.trim() || !displayName.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: { data: { display_name: displayName.trim(), avatar_emoji: avatarEmoji } },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          display_name: displayName.trim(),
          avatar_emoji: avatarEmoji,
          is_public: isPublic,
        });
        if (profileError) console.error("Profile creation error:", profileError);
      }

      toast.success("Compte créé avec succès !");
      navigate(redirectTo);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir email et mot de passe");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) throw error;
      toast.success("Connecté !");
      navigate(redirectTo);
    } catch (err: any) {
      toast.error(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Entrez votre email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Code envoyé ! Vérifiez votre email.");
      setMode("reset");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      toast.error("Entrez le code et le nouveau mot de passe");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "recovery",
      });
      if (error) throw error;

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (updateError) throw updateError;

      toast.success("Mot de passe mis à jour ! Vous êtes connecté.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6">
        <button onClick={() => {
          if (mode === "reset") setMode("forgot");
          else if (mode === "forgot") setMode("login");
          else navigate(-1);
        }} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back")}</span>
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* Forgot password flow */}
        {mode === "forgot" && (
          <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié ?</h1>
              <p className="text-muted-foreground text-sm mt-1">Entrez votre email pour recevoir un code de récupération</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <Button onClick={handleForgotPassword} disabled={loading} className="w-full h-12 text-base rounded-xl">
              <Mail size={18} />
              {loading ? "..." : "Envoyer le code"}
            </Button>
          </motion.div>
        )}

        {/* Reset password with OTP */}
        {mode === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-3">📧</motion.div>
              <h1 className="text-2xl font-bold text-foreground">Entrez le code</h1>
              <p className="text-muted-foreground text-sm mt-1">Un code a été envoyé à <strong>{email}</strong></p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Code de vérification</label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nouveau mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button onClick={handleResetPassword} disabled={loading} className="w-full h-12 text-base rounded-xl">
              <KeyRound size={18} />
              {loading ? "..." : "Réinitialiser le mot de passe"}
            </Button>
          </motion.div>
        )}

        {/* Signup / Login */}
        {(mode === "signup" || mode === "login") && (
          <>
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
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">{t("auth.chooseAvatar")}</label>
                  <IslamicAvatarPicker selected={avatarEmoji} onSelect={setAvatarEmoji} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("auth.displayName")}</label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ahmed, Fatima..." maxLength={50} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("auth.email")}</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
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
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button onClick={handleLogin} disabled={loading} className="w-full h-12 text-base rounded-xl">
                  <Mail size={18} />
                  {loading ? "..." : "Se connecter"}
                </Button>
                <button onClick={() => setMode("forgot")} className="w-full text-xs text-center text-primary font-medium">
                  Mot de passe oublié ?
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
