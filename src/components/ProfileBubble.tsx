import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Baby, GraduationCap, Users, Moon, Sun, Globe, Wifi, WifiOff,
  Bell, Crown, BarChart3, Trophy, Heart, Lock, Download, LogOut, ChevronRight, X, Shield, Smartphone
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useLanguage, LANGUAGES, type Lang } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserMode, type UserMode } from "@/hooks/useUserMode";
import { useOfflineManager } from "@/hooks/useOfflineManager";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROFILE_XP_PREFIX = "profile_xp_";
function awardOnce(key: string, amount: number, addXP: (n: number) => void, label: string) {
  const fullKey = PROFILE_XP_PREFIX + key;
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(fullKey) === today) return;
  localStorage.setItem(fullKey, today);
  addXP(amount);
  toast.success(`+${amount} XP — ${label}`);
}

const ROLE_CONFIG: Record<UserMode, { emoji: string; color: string; bg: string; border: string }> = {
  solo: { emoji: "👤", color: "text-muted-foreground", bg: "bg-muted/60", border: "border-border" },
  child: { emoji: "👧", color: "text-yellow-500", bg: "bg-yellow-500/15", border: "border-yellow-400/30" },
  parent: { emoji: "👨", color: "text-blue-500", bg: "bg-blue-500/15", border: "border-blue-400/30" },
  teacher: { emoji: "👨‍🏫", color: "text-emerald-500", bg: "bg-emerald-500/15", border: "border-emerald-400/30" },
};

const PIN_CODE = "1234";

export default function ProfileBubble() {
  const { t, lang, setLang } = useLanguage();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useUserMode();
  const { classrooms } = useClassrooms();
  const xp = useQuranXp();
  const { addXP } = useXP();
  const { readySections } = useOfflineManager();
  const navigate = useNavigate();

  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pendingMode, setPendingMode] = useState<UserMode | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌙");
  const [isModerator, setIsModerator] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("quranEasyTheme");
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, avatar_emoji").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name);
      if (data?.avatar_emoji) setAvatarEmoji(data.avatar_emoji);
    });
    // Check moderator role
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "moderator").maybeSingle().then(({ data }) => {
      setIsModerator(!!data);
    });
  }, [user]);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("quranEasyTheme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, [theme]);

  const offlineReady = Object.values(readySections).filter(Boolean).length;
  const offlineTotal = Object.keys(readySections).length;

  const roleConfig = ROLE_CONFIG[mode];

  const handleRoleSwitch = (newMode: UserMode) => {
    if (newMode === mode) return;
    if (newMode === "parent" || newMode === "teacher") {
      setPendingMode(newMode);
      setShowPin(true);
      setPinInput("");
    } else {
      setMode(newMode);
      awardOnce("switch", 5, addXP, t("profile.roleSolo" as any));
    }
  };

  const confirmPin = () => {
    if (pinInput === PIN_CODE && pendingMode) {
      setMode(pendingMode);
      awardOnce("switch", 5, addXP, t(`profile.role${pendingMode.charAt(0).toUpperCase() + pendingMode.slice(1)}` as any));
      setShowPin(false);
      setPendingMode(null);
      setPinInput("");
    }
  };

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "?";

  const badgeLabel = (() => {
    switch (mode) {
      case "child": return t("profile.badgeKid" as any);
      case "parent": return t("profile.badgeParent" as any);
      case "teacher": return `${t("profile.badgeTeacher" as any)}${classrooms.length ? ` (${classrooms.length})` : ""}`;
      default: return `Lv.${xp.level}`;
    }
  })();

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`relative flex items-center gap-1.5 h-12 pl-1 pr-2.5 rounded-full ${roleConfig.bg} border ${roleConfig.border} backdrop-blur-md shadow-sm transition-all hover:shadow-md`}
          >
            {/* Avatar circle */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${roleConfig.bg} border-2 ${roleConfig.border}`}>
              {avatarEmoji !== "🌙" ? <span className="text-lg">{avatarEmoji}</span> : <span className="text-xs font-bold text-foreground">{initials}</span>}
            </div>
            {/* Badge */}
            <span className={`text-[10px] font-bold ${roleConfig.color} whitespace-nowrap`}>{badgeLabel}</span>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-2 backdrop-blur-xl shadow-2xl rounded-2xl border-border/50 bg-popover/95">
          {/* User info header */}
          {user && displayName && (
            <>
              <div className="flex items-center gap-3 px-2 py-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleConfig.bg} border ${roleConfig.border}`}>
                  <span className="text-lg">{avatarEmoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* SECTION 1: ROLES */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
            {t("profile.sectionAccount" as any)}
          </DropdownMenuLabel>
          {([
            { m: "solo" as UserMode, emoji: "👤", label: t("profile.roleSolo" as any) },
            { m: "child" as UserMode, emoji: "👧", label: t("profile.roleKid" as any) },
            { m: "parent" as UserMode, emoji: "👨", label: t("profile.roleParent" as any), pin: true },
            { m: "teacher" as UserMode, emoji: "👨‍🏫", label: t("profile.roleTeacher" as any), pin: true },
          ]).map(r => (
            <DropdownMenuItem
              key={r.m}
              onClick={() => handleRoleSwitch(r.m)}
              className={`flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer ${mode === r.m ? "bg-accent/50" : "hover:bg-accent/30"}`}
            >
              <span className="text-xl w-6 text-center">{r.emoji}</span>
              <span className="flex-1 text-sm font-medium">{r.label}</span>
              {mode === r.m && <span className="text-primary text-xs font-bold">✓</span>}
              {r.pin && mode !== r.m && <Lock className="w-3 h-3 text-muted-foreground" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* SECTION 2: SETTINGS */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
            {t("profile.sectionSettings" as any)}
          </DropdownMenuLabel>

          {/* Theme */}
          <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            {theme === "dark" ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <span className="flex-1 text-sm font-medium">{t("profile.theme" as any)}</span>
            <span className="text-xs text-muted-foreground">{theme === "dark" ? "🌙" : "☀️"}</span>
          </DropdownMenuItem>

          {/* Language */}
          <DropdownMenuItem onClick={() => setShowLangPicker(true)} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="flex-1 text-sm font-medium">{t("profile.language" as any)}</span>
            <span className="text-xs text-muted-foreground">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
          </DropdownMenuItem>

          {/* Offline */}
          <DropdownMenuItem onClick={() => navigate("/offline-settings")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            {offlineReady > 0 ? <WifiOff className="w-5 h-5 text-orange-400" /> : <Wifi className="w-5 h-5 text-emerald-400" />}
            <span className="flex-1 text-sm font-medium">{t("profile.offline" as any)}</span>
            <span className="text-xs text-muted-foreground">{offlineReady}/{offlineTotal}</span>
          </DropdownMenuItem>

          {/* Notifications */}
          <DropdownMenuItem onClick={() => navigate("/notification-settings")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            <Bell className="w-5 h-5 text-violet-400" />
            <span className="flex-1 text-sm font-medium">{t("profile.notifications" as any)}</span>
          </DropdownMenuItem>

          {/* Premium */}
          {mode !== "child" && (
            <DropdownMenuItem className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-sm font-medium">{t("profile.premium" as any)}</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t("profile.free" as any)}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* SECTION 3: STATS */}
          {mode !== "child" && (
            <>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
                {t("profile.sectionStats" as any)}
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={() => navigate("/progress")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="flex-1 text-sm font-medium">{t("profile.stats" as any)}</span>
                <span className="text-xs text-muted-foreground">{xp.xp} XP</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="flex-1 text-sm font-medium">{t("profile.badges" as any)}</span>
              </DropdownMenuItem>

              {mode === "parent" && (
                <DropdownMenuItem onClick={() => navigate("/family")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span className="flex-1 text-sm font-medium">{t("profile.family" as any)}</span>
                </DropdownMenuItem>
              )}

              {isModerator && (
                <DropdownMenuItem onClick={() => navigate("/coord")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="flex-1 text-sm font-medium">{t("profile.coordDashboard" as any)}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
            </>
          )}

          {/* SECTION 4: SECURITY */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2 py-1">
            {t("profile.sectionSecurity" as any)}
          </DropdownMenuLabel>

          <DropdownMenuItem onClick={() => navigate("/settings")} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            <Lock className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-sm font-medium">{t("profile.password" as any)}</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30">
            <Download className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-sm font-medium">{t("profile.export" as any)}</span>
          </DropdownMenuItem>

          {user && (
            <DropdownMenuItem onClick={signOut} className="flex items-center gap-3 py-2.5 px-2 rounded-xl cursor-pointer hover:bg-accent/30 text-destructive">
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-sm font-medium">{t("profile.logout" as any)}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowPin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("profile.pinTitle" as any)}
                </h3>
                <button onClick={() => setShowPin(false)} className="p-1 hover:bg-accent rounded-lg">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t("profile.pinDesc" as any)}</p>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={e => e.key === "Enter" && confirmPin()}
                placeholder="• • • •"
                className="w-full text-center text-2xl font-black tracking-[0.5em] bg-muted/50 border border-border rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              <button
                onClick={confirmPin}
                disabled={pinInput.length !== 4}
                className="w-full mt-4 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition-all active:scale-95"
              >
                {t("profile.pinConfirm" as any)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Picker Modal */}
      <AnimatePresence>
        {showLangPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLangPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-4 w-full max-w-xs shadow-2xl"
            >
              <h3 className="text-sm font-black text-foreground mb-3 px-2">{t("profile.chooseLang" as any)}</h3>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { if (l.code !== lang) awardOnce("lang", 3, addXP, l.label); setLang(l.code); setShowLangPicker(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${lang === l.code ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent/30"}`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className={`text-sm font-medium ${lang === l.code ? "text-primary font-bold" : "text-foreground"}`}>{l.label}</span>
                  {lang === l.code && <span className="ml-auto text-primary text-xs font-bold">✓</span>}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
