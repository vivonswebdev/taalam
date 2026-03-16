import React, { useState, useMemo, useCallback } from "react";
import DemoLoginBanner from "@/components/DemoLoginBanner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, Eye, EyeOff, KeyRound, Check, Globe } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LANGUAGES } from "@/hooks/useLanguage";
import { useUserMode, type UserMode, type AgeGroup } from "@/hooks/useUserMode";
import IslamicAvatarPicker from "@/components/IslamicAvatarPicker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COUNTRIES = [
  { code: "MA", flag: "🇲🇦", label: "Maroc", search: "maroc morocco المغرب marokko" },
  { code: "DZ", flag: "🇩🇿", label: "Algérie", search: "algerie algeria الجزائر algerije" },
  { code: "TN", flag: "🇹🇳", label: "Tunisie", search: "tunisie tunisia تونس tunesie" },
  { code: "LY", flag: "🇱🇾", label: "ليبيا", search: "libye libya ليبيا libië" },
  { code: "MR", flag: "🇲🇷", label: "Mauritanie", search: "mauritanie mauritania موريتانيا" },
  { code: "SA", flag: "🇸🇦", label: "السعودية", search: "arabie saoudite saudi arabia السعودية saoedi" },
  { code: "AE", flag: "🇦🇪", label: "الإمارات", search: "emirats emirates الإمارات uae dubai" },
  { code: "QA", flag: "🇶🇦", label: "قطر", search: "qatar قطر" },
  { code: "KW", flag: "🇰🇼", label: "الكويت", search: "koweit kuwait الكويت koeweit" },
  { code: "BH", flag: "🇧🇭", label: "البحرين", search: "bahrein bahrain البحرين" },
  { code: "OM", flag: "🇴🇲", label: "عُمان", search: "oman عمان" },
  { code: "YE", flag: "🇾🇪", label: "اليمن", search: "yemen اليمن jemen" },
  { code: "JO", flag: "🇯🇴", label: "الأردن", search: "jordanie jordan الأردن jordanië" },
  { code: "PS", flag: "🇵🇸", label: "فلسطين", search: "palestine فلسطين palestina" },
  { code: "IQ", flag: "🇮🇶", label: "العراق", search: "irak iraq العراق" },
  { code: "SY", flag: "🇸🇾", label: "سوريا", search: "syrie syria سوريا syrië" },
  { code: "LB", flag: "🇱🇧", label: "لبنان", search: "liban lebanon لبنان libanon" },
  { code: "EG", flag: "🇪🇬", label: "مصر", search: "egypte egypt مصر" },
  { code: "SD", flag: "🇸🇩", label: "السودان", search: "soudan sudan السودان soedan" },
  { code: "SO", flag: "🇸🇴", label: "الصومال", search: "somalie somalia الصومال somalië" },
  { code: "DJ", flag: "🇩🇯", label: "Djibouti", search: "djibouti جيبوتي" },
  { code: "KM", flag: "🇰🇲", label: "Comores", search: "comores comoros جزر القمر" },
  { code: "TR", flag: "🇹🇷", label: "Türkiye", search: "turquie turkey türkiye turkije" },
  { code: "AZ", flag: "🇦🇿", label: "Azərbaycan", search: "azerbaidjan azerbaijan azərbaycan" },
  { code: "UZ", flag: "🇺🇿", label: "Oʻzbekiston", search: "ouzbekistan uzbekistan" },
  { code: "KZ", flag: "🇰🇿", label: "Қазақстан", search: "kazakhstan kazakstan" },
  { code: "TM", flag: "🇹🇲", label: "Türkmenistan", search: "turkmenistan" },
  { code: "KG", flag: "🇰🇬", label: "Кыргызстан", search: "kirghizistan kyrgyzstan" },
  { code: "TJ", flag: "🇹🇯", label: "Тоҷикистон", search: "tadjikistan tajikistan" },
  { code: "PK", flag: "🇵🇰", label: "Pakistan", search: "pakistan پاکستان" },
  { code: "BD", flag: "🇧🇩", label: "বাংলাদেশ", search: "bangladesh বাংলাদেশ" },
  { code: "AF", flag: "🇦🇫", label: "افغانستان", search: "afghanistan افغانستان" },
  { code: "MV", flag: "🇲🇻", label: "Maldives", search: "maldives" },
  { code: "ID", flag: "🇮🇩", label: "Indonesia", search: "indonesie indonesia" },
  { code: "MY", flag: "🇲🇾", label: "Malaysia", search: "malaisie malaysia" },
  { code: "BN", flag: "🇧🇳", label: "Brunei", search: "brunei" },
  { code: "SN", flag: "🇸🇳", label: "Sénégal", search: "senegal sénégal" },
  { code: "ML", flag: "🇲🇱", label: "Mali", search: "mali" },
  { code: "GN", flag: "🇬🇳", label: "Guinée", search: "guinee guinea" },
  { code: "CI", flag: "🇨🇮", label: "Côte d'Ivoire", search: "cote ivoire ivory coast" },
  { code: "NE", flag: "🇳🇪", label: "Niger", search: "niger" },
  { code: "BF", flag: "🇧🇫", label: "Burkina Faso", search: "burkina faso" },
  { code: "GM", flag: "🇬🇲", label: "Gambia", search: "gambie gambia" },
  { code: "SL", flag: "🇸🇱", label: "Sierra Leone", search: "sierra leone" },
  { code: "NG", flag: "🇳🇬", label: "Nigeria", search: "nigeria" },
  { code: "TD", flag: "🇹🇩", label: "Tchad", search: "tchad chad تشاد" },
  { code: "IR", flag: "🇮🇷", label: "ایران", search: "iran ایران" },
  { code: "FR", flag: "🇫🇷", label: "France", search: "france فرنسا frankrijk" },
  { code: "BE", flag: "🇧🇪", label: "Belgique", search: "belgique belgium belgië بلجيكا" },
  { code: "NL", flag: "🇳🇱", label: "Nederland", search: "pays bas netherlands nederland هولندا" },
  { code: "DE", flag: "🇩🇪", label: "Deutschland", search: "allemagne germany deutschland ألمانيا" },
  { code: "GB", flag: "🇬🇧", label: "UK", search: "royaume uni united kingdom uk بريطانيا england angleterre" },
  { code: "CH", flag: "🇨🇭", label: "Suisse", search: "suisse switzerland zwitserland سويسرا" },
  { code: "IT", flag: "🇮🇹", label: "Italia", search: "italie italy italia إيطاليا italië" },
  { code: "ES", flag: "🇪🇸", label: "España", search: "espagne spain españa إسبانيا spanje" },
  { code: "SE", flag: "🇸🇪", label: "Sverige", search: "suede sweden sverige السويد zweden" },
  { code: "AT", flag: "🇦🇹", label: "Österreich", search: "autriche austria österreich النمسا oostenrijk" },
  { code: "BA", flag: "🇧🇦", label: "Bosna", search: "bosnie bosnia bosna البوسنة" },
  { code: "XK", flag: "🇽🇰", label: "Kosovo", search: "kosovo كوسوفو" },
  { code: "AL", flag: "🇦🇱", label: "Shqipëri", search: "albanie albania shqipëri ألبانيا albanië" },
  { code: "US", flag: "🇺🇸", label: "USA", search: "etats unis united states usa أمريكا amerika" },
  { code: "CA", flag: "🇨🇦", label: "Canada", search: "canada كندا" },
  { code: "BR", flag: "🇧🇷", label: "Brasil", search: "bresil brazil brasil البرازيل brazilië" },
  { code: "SR", flag: "🇸🇷", label: "Suriname", search: "suriname سورينام" },
  { code: "AU", flag: "🇦🇺", label: "Australia", search: "australie australia أستراليا australië" },
];

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
  const { signUpWithEmail, user } = useAuth();
  const { setMode: setGlobalMode, setAgeGroup: setGlobalAgeGroup } = useUserMode();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

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
  const [countryCode, setCountryCode] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [isPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("taalam_remember_me") !== "false";
  });

  const filteredCountries = React.useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return COUNTRIES.filter(c =>
      c.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
    );
  }, [countrySearch]);

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
          country_code: countryCode || null,
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
      navigate("/settings");
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
    const cleanOtp = otp.trim();
    if (!cleanOtp || !newPassword.trim()) {
      toast.error(t("reset.fillFields" as any) || "Entrez le code et le nouveau mot de passe");
      return;
    }
    if (cleanOtp.length < 6) {
      toast.error(t("reset.otpTooShort" as any) || "Le code doit contenir 6 à 8 chiffres");
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("reset.passwordTooShort" as any) || "Le mot de passe doit contenir au moins 6 caractères");
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

      <div className="px-6 mt-6 space-y-6">
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
              <h1 className="text-2xl font-bold text-foreground">{t("reset.enterCode" as any) || "Entrez le code"}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t("reset.codeSentTo" as any) || "Un code a été envoyé à"} <strong>{email}</strong></p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("reset.otpLabel" as any) || "Code 6-8 chiffres"}</label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="12345678"
                maxLength={8}
                className="text-center text-lg font-mono tracking-widest"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("reset.newPassword" as any) || "Nouveau mot de passe"}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("reset.minChars" as any) || "Min. 6 caractères"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button onClick={handleResetPassword} disabled={loading} className="w-full h-12 text-base rounded-xl">
              <KeyRound size={18} />
              {loading ? "..." : (t("reset.submit" as any) || "Réinitialiser le mot de passe")}
            </Button>
            <button
              type="button"
              disabled={resendCooldown > 0 || loading}
              onClick={async () => {
                setResendCooldown(60);
                const interval = setInterval(() => {
                  setResendCooldown(prev => {
                    if (prev <= 1) { clearInterval(interval); return 0; }
                    return prev - 1;
                  });
                }, 1000);
                try {
                  await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth` });
                  toast.success(t("reset.resent" as any) || "Code renvoyé !");
                } catch { toast.error("Erreur"); }
              }}
              className="w-full text-center text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resendCooldown > 0
                ? `${t("reset.resendIn" as any) || "Renvoyer dans"} ${resendCooldown}s`
                : (t("reset.resend" as any) || "Renvoyer le code")}
            </button>
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
                      <p className="text-sm font-semibold text-foreground">{t("auth.ageQuestion" as any)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("auth.ageHint" as any)}</p>
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
                      <label className="text-sm font-medium text-foreground mb-2 block">{t("auth.country")}</label>
                      <Input
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={t("auth.countrySearch")}
                        className="mb-2"
                      />
                      {countryCode && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-lg">{COUNTRIES.find(c => c.code === countryCode)?.flag}</span>
                          <span>{COUNTRIES.find(c => c.code === countryCode)?.label}</span>
                          <button type="button" onClick={() => setCountryCode("")} className="ml-auto text-xs text-destructive hover:underline">✕</button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto rounded-lg">
                        {filteredCountries.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => { setCountryCode(c.code); setCountrySearch(""); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs transition-all ${
                              countryCode === c.code
                                ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                                : "border-border bg-card hover:border-muted-foreground/30"
                            }`}
                          >
                            <span className="text-base leading-none">{c.flag}</span>
                            <span>{c.label}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="text-xs text-muted-foreground py-2">{t("auth.noCountryFound")}</p>
                        )}
                      </div>
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
                <DemoLoginBanner />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
