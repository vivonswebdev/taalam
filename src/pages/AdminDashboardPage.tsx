import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, BookOpen, Baby, Brain, RefreshCw, BarChart3, EyeOff, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Switch } from "@/components/ui/switch";

const KIDS_MODULES = ["noorani", "kids_prayer", "kids_hajj", "kids_mosque_map", "kids_space"];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading, stats, refresh } = useAdminStats();
  const { settings: adminSettings, update: updateSettings } = useAdminSettings();

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen"><span className="animate-spin text-2xl">⏳</span></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield size={48} className="text-muted-foreground" />
        <p className="text-lg font-semibold">{t("admin.loginRequired" as any)}</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
          {t("more.loginProfile" as any)}
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield size={48} className="text-destructive" />
        <p className="text-lg font-semibold">{t("admin.forbidden" as any)}</p>
        <p className="text-sm text-muted-foreground">{t("admin.forbiddenDesc" as any)}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-muted text-muted-foreground rounded-xl font-semibold">
          {t("detail.back" as any)}
        </button>
      </div>
    );
  }

  // Pie chart data: kids vs adult
  const kidsEvents = stats.moduleUsage.filter(m => KIDS_MODULES.includes(m.module)).reduce((s, m) => s + m.count, 0);
  const adultEvents = stats.totalEvents - kidsEvents;
  const pieData = [
    { name: "Kids", value: kidsEvents },
    { name: "Adultes", value: adultEvents },
  ];
  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            {t("admin.title" as any)}
          </h1>
          <p className="text-xs text-muted-foreground">{t("admin.subtitle" as any)}</p>
        </div>
        <button onClick={refresh} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Section 1: Overview */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("admin.overview" as any)}</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Users size={18} className="text-primary" />} value={String(stats.monthlyActiveUsers)} label={t("admin.mau" as any)} />
            <StatCard icon={<BookOpen size={18} className="text-emerald-500" />} value={String(stats.hifzPlansCreated)} label={t("admin.hifzPlans" as any)} />
            <StatCard icon={<Baby size={18} className="text-amber-500" />} value={String(stats.kidsProfiles)} label={t("admin.kidsProfiles" as any)} />
          </div>
        </div>

        {/* DAU Chart */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("admin.dau" as any)}</p>
          <div className="bg-card border border-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.dailyActiveUsers}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: Module Usage */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("admin.moduleUsage" as any)}</p>
          <div className="bg-card border border-border rounded-xl p-4">
            {stats.moduleUsage.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">{t("admin.noData" as any)}</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(120, stats.moduleUsage.length * 36)}>
                <BarChart data={stats.moduleUsage} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="module" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Section 3: Kids vs Adults */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("admin.kidsVsAdults" as any)}</p>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-semibold">Kids — {kidsEvents}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-xs font-semibold">Adultes — {adultEvents}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("admin.kidsSpaceOpens" as any)}: {stats.kidsSpaceOpens} · {t("admin.kidsModules" as any)}: {stats.kidsModulesUsage}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Hifz Funnel */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("admin.hifzFunnel" as any)}</p>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t("admin.plansCreated" as any)}</span>
              <span className="text-sm font-bold">{stats.hifzPlansCreated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t("admin.tasksCompleted" as any)}</span>
              <span className="text-sm font-bold">{stats.hifzTasksCompleted}</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">{t("admin.engagementRatio" as any)}</span>
                <span className="text-sm font-bold text-primary">{stats.hifzRatio}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(stats.hifzRatio, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Visibility Controls */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">🎛️ {t("admin.displayControl" as any)}</p>
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {adminSettings.hide_announcement ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-primary" />}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("admin.hideAnnouncement" as any)}</p>
                  <p className="text-[10px] text-muted-foreground">{t("admin.hideAnnouncementDesc" as any)}</p>
                </div>
              </div>
              <Switch
                checked={adminSettings.hide_announcement}
                onCheckedChange={(checked) => updateSettings({ hide_announcement: checked })}
              />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {adminSettings.hide_daily_challenge ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-primary" />}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("admin.hideChallenge" as any)}</p>
                  <p className="text-[10px] text-muted-foreground">{t("admin.hideChallengeDesc" as any)}</p>
                </div>
              </div>
              <Switch
                checked={adminSettings.hide_daily_challenge}
                onCheckedChange={(checked) => updateSettings({ hide_daily_challenge: checked })}
              />
            </div>

            {/* Preview */}
            {(adminSettings.hide_announcement || adminSettings.hide_daily_challenge) && (
              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">👁️ {t("admin.preview" as any)} :</p>
                <p className="text-[10px] text-muted-foreground">
                  {adminSettings.hide_announcement && `✅ ${t("admin.popupHidden" as any)}`}
                  {adminSettings.hide_announcement && adminSettings.hide_daily_challenge && " · "}
                  {adminSettings.hide_daily_challenge && `✅ ${t("admin.challengeHidden" as any)}`}
                  {" — "} {t("admin.cleanHomepage" as any)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Total events */}
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">
            {t("admin.totalEvents" as any)}: {stats.totalEvents} (30j)
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-3 text-center"
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  );
}
