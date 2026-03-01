import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, Eye, EyeOff, KeyRound, Check, Globe } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LANGUAGES } from "@/hooks/useLanguage";
import { useUserMode, type UserMode, type AgeGroup } from "@/hooks/useUserMode";
import IslamicAvatarPicker from "@/components/IslamicAvatarPicker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const AGE_GROUPS: { id: AgeGroup; icon: string; label: string; desc: string }[] = [
  { id: "child", icon: "👧", label: "Enfant / ado", desc: "Moins de 16 ans" },
  { id: "adult", icon: "🧑", label: "Adulte", desc: "16–60 ans" },
  { id: "senior", icon: "👴", label: "Senior", desc: "60 ans et plus" },
];

function getModesForAge(ag: AgeGroup): { id: UserMode; icon: string; label: string; desc: string; recommended?: boolean }[] {
  if (ag === "child") {
    return [
      { id: "child", icon: "🧒", label: "Mode enfant", desc: "Interface simplifiée, contenus adaptés.", recommended: true },
      { id: "solo", icon: "🕌", label: "Mode solo", desc: "Apprentissage personnel du Coran." },
    ];
  }
  if (ag === "senior") {
    return [
      { id: "solo", icon: "🕌", label: "Mode solo", desc: "Lecture simple du Coran, interface épurée.", recommended: true },
      { id: "parent", icon: "👨‍👩‍👧", label: "Mode parent", desc: "Suivi des enfants, notifications." },
      { id: "teacher", icon: "👨‍🏫", label: "Mode professeur", desc: "Tableau de bord classe, devoirs et suivi." },
    ];
  }
  // adult
  return [
    { id: "solo", icon: "🕌", label: "Mode solo", desc: "Apprentissage personnel du Coran.", recommended: true },
    { id: "parent", icon: "👨‍👩‍👧", label: "Mode parent", desc: "Suivi des enfants, notifications." },
    { id: "teacher", icon: "👨‍🏫", label: "Mode professeur", desc: "Tableau de bord classe, devoirs et suivi." },
    { id: "child", icon: "🧒", label: "Créer un compte enfant", desc: "Pour inscrire mon enfant." },
  ];
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { t, lang } = useLanguage();
  const { signUpWithEmail } = useAuth();
  const { setMode: setGlobalMode, setAgeGroup: setGlobalAgeGroup } = useUserMode();

  const [mode, setMode] = useState<"signup" | "login" | "forgot" | "reset">("signup");
  // Signup steps: 0=age, 1=mode, 2=form
  const [signupStep, setSignupStep] = useState(0);
  const [selectedAge, setSelectedAge] = useState<AgeGroup>("adult");
  const [selectedUserMode, setSelectedUserMode] = useState<UserMode>("solo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌙");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("taalam_remember_me") !== "false";
  });

  const handleAgeNext = () => {
    // Pre-select recommended mode
    const modes = getModesForAge(selectedAge);
    const rec = modes.find(m => m.recommended);
    setSelectedUserMode(rec?.id || "solo");
    setSignupStep(1);
  };

  const handleModeNext = () => {
    setSignupStep(2);
  };

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
        options: { data: { display_name: displayName.trim(), avatar_emoji: avatarEmoji, language: lang } },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          display_name: displayName.trim(),
          avatar_emoji: avatarEmoji,
          is_public: isPublic,
          preferred_mode: selectedUserMode,
          age_group: selectedAge,
        } as any);
        if (profileError) console.error("Profile creation error:", profileError);
      }

      // Set global context
      await setGlobalMode(selectedUserMode);
      await setGlobalAgeGroup(selectedAge);

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
      localStorage.setItem("taalam_remember_me", rememberMe ? "true" : "false");
      if (!rememberMe) {
        sessionStorage.setItem("taalam_session_active", "true");
      }
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

  const handleBack = () => {
    if (mode === "signup" && signupStep > 0) {
      setSignupStep(signupStep - 1);
      return;
    }
    if (mode === "reset") { setMode("forgot"); return; }
    if (mode === "forgot") { setMode("login"); return; }
    navigate(-1);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6 flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back")}</span>
        </button>
        <LanguageSwitcher />
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
                onClick={() => { setMode("signup"); setSignupStep(0); }}
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
              <AnimatePresence mode="wait">
                {/* Step 0: Age group */}
                {signupStep === 0 && (
                  <motion.div key="step-age" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Quelle est votre tranche d'âge ?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Taaloum adaptera l'interface à vos besoins.</p>
                    </div>
                    <div className="space-y-2">
                      {AGE_GROUPS.map(ag => (
                        <button
                          key={ag.id}
                          onClick={() => setSelectedAge(ag.id)}
                          className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 border transition-all text-left ${
                            selectedAge === ag.id
                              ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="text-2xl">{ag.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-card-foreground">{ag.label}</p>
                            <p className="text-xs text-muted-foreground">{ag.desc}</p>
                          </div>
                          {selectedAge === ag.id && <Check size={18} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                    <Button onClick={handleAgeNext} className="w-full h-12 text-base rounded-xl">
                      Continuer →
                    </Button>
                  </motion.div>
                )}

                {/* Step 1: Mode selection */}
                {signupStep === 1 && (
                  <motion.div key="step-mode" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Choisissez votre mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Vous pourrez le changer à tout moment dans « Plus ».</p>
                    </div>
                    <div className="space-y-2">
                      {getModesForAge(selectedAge).map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedUserMode(m.id)}
                          className={`relative w-full flex items-center gap-3 rounded-2xl px-4 py-4 border transition-all text-left ${
                            selectedUserMode === m.id
                              ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-card-foreground">{m.label}</p>
                            <p className="text-xs text-muted-foreground">{m.desc}</p>
                          </div>
                          {m.recommended && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">Recommandé</Badge>
                          )}
                          {selectedUserMode === m.id && <Check size={18} className="text-primary shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <Button onClick={handleModeNext} className="w-full h-12 text-base rounded-xl">
                      Continuer →
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Form */}
                {signupStep === 2 && (
                  <motion.div key="step-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                    {/* Summary chip */}
                    <div className="flex items-center gap-2 justify-center">
                      <Badge variant="outline" className="text-xs">
                        {AGE_GROUPS.find(a => a.id === selectedAge)?.icon} {AGE_GROUPS.find(a => a.id === selectedAge)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getModesForAge(selectedAge).find(m => m.id === selectedUserMode)?.icon} {getModesForAge(selectedAge).find(m => m.id === selectedUserMode)?.label}
                      </Badge>
                    </div>
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
                )}
              </AnimatePresence>
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
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
                    Se souvenir de moi
                  </label>
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
