import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Edit2, Check, X, Mail, Calendar, Trophy, BookOpen, Star } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useStreak } from "@/hooks/useStreak";
import IslamicAvatarPicker from "@/components/IslamicAvatarPicker";
import { supabase } from "@/integrations/supabase/client";

export default function MyProfilePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const xp = useQuranXp();
  const { currentStreak } = useStreak();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditName(profile?.display_name || "");
    setEditAvatar(profile?.avatar_emoji || "🌙");
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    await updateProfile({ display_name: editName.trim() || "User", avatar_emoji: editAvatar });
    setSaving(false);
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("profile.title" as any)}</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 mt-20 px-6">
          <span className="text-5xl">🔒</span>
          <p className="text-sm text-muted-foreground text-center">{t("profile.loginRequired" as any)}</p>
          <button onClick={() => navigate("/auth")} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
            {t("profile.login" as any)}
          </button>
        </div>
      </div>
    );
  }

  const avatar = profile?.avatar_emoji || "🌙";
  const name = profile?.display_name || user.user_metadata?.display_name || "User";
  const email = user.email || "";
  const joined = user.created_at ? new Date(user.created_at) : new Date();

  const stats = [
    { icon: Trophy, label: t("profile.totalXp" as any), value: `${xp.xp} XP`, color: "text-amber-500" },
    { icon: Star, label: t("profile.level" as any), value: `${xp.level}`, color: "text-primary" },
    { icon: BookOpen, label: t("profile.streak" as any), value: `${currentStreak} ${t("profile.days" as any)}`, color: "text-emerald-500" },
    { icon: Calendar, label: t("profile.sessions" as any), value: `${profile?.sessions_count || 0}`, color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1">{t("profile.title" as any)}</h1>
        {!editing && (
          <button onClick={startEdit} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
            <Edit2 className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>

      {/* Avatar & Name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mt-4 px-6">
        {editing ? (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border-4 border-primary/30 flex items-center justify-center text-5xl shadow-lg mb-3">
              {editAvatar}
            </div>
            <div className="w-full max-w-xs mb-4">
              <IslamicAvatarPicker selected={editAvatar} onSelect={setEditAvatar} />
            </div>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full max-w-xs text-center text-lg font-bold bg-card border-2 border-primary/30 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
              placeholder={t("profile.namePlaceholder" as any)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-muted-foreground">
                <X size={14} /> {t("profile.cancel" as any)}
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary rounded-xl text-sm font-bold text-primary-foreground disabled:opacity-50">
                <Check size={14} /> {t("profile.save" as any)}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border-4 border-primary/30 flex items-center justify-center text-5xl shadow-lg">
              {avatar}
            </div>
            <h2 className="text-xl font-bold text-foreground mt-3">{name}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Mail size={13} />
              <span className="text-xs">{email}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {t("profile.memberSince" as any)} {joined.toLocaleDateString()}
            </p>
          </>
        )}
      </motion.div>

      {/* Stats Grid */}
      {!editing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 px-5 mt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <stat.icon size={22} className={stat.color} />
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      {!editing && (
        <div className="px-5 mt-6 space-y-3">
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-2xl text-left hover:bg-accent/30 transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t("profile.settings" as any)}</p>
              <p className="text-[11px] text-muted-foreground">{t("profile.settingsDesc" as any)}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-card border border-destructive/30 rounded-2xl text-left hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">{t("profile.logout" as any)}</p>
          </button>
        </div>
      )}
    </div>
  );
}
