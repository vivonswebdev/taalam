import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import ProfileBubble from "@/components/ProfileBubble";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { Flame } from "lucide-react";

// ═══ Bubble data ═══

interface BubbleItem {
  id: string;
  emoji: string;
  nameKey: string;
  path: string;
  size: "xl" | "lg" | "md" | "sm";
  gradient: string;
}

const BUBBLES: BubbleItem[] = [
  { id: "quran", emoji: "📖", nameKey: "dashboard.tarteel", path: "/quran", size: "xl", gradient: "from-blue-400/40 to-cyan-500/40" },
  { id: "tarteel", emoji: "🎤", nameKey: "dashboard.tarteel", path: "/tarteel", size: "xl", gradient: "from-purple-400/40 to-pink-500/40" },
  { id: "hifz", emoji: "🎯", nameKey: "dashboard.hifzPlan", path: "/hifz-plan", size: "lg", gradient: "from-rose-400/40 to-pink-500/40" },
  { id: "mushaf", emoji: "📗", nameKey: "dashboard.mushaf", path: "/mushaf", size: "lg", gradient: "from-teal-400/40 to-emerald-500/40" },
  { id: "quiz", emoji: "🧠", nameKey: "dashboard.quiz", path: "/quiz", size: "lg", gradient: "from-violet-400/40 to-purple-500/40" },
  { id: "moods", emoji: "💎", nameKey: "dashboard.moods", path: "/moods", size: "md", gradient: "from-pink-400/40 to-rose-500/40" },
  { id: "listening", emoji: "🎧", nameKey: "dashboard.listening", path: "/listening", size: "md", gradient: "from-amber-400/40 to-orange-500/40" },
  { id: "habits", emoji: "✅", nameKey: "dashboard.habits", path: "/habits", size: "md", gradient: "from-emerald-400/40 to-teal-500/40" },
  { id: "kids", emoji: "🚀", nameKey: "dashboard.kids", path: "/kids", size: "md", gradient: "from-yellow-400/40 to-orange-500/40" },
  { id: "leaderboard", emoji: "🏆", nameKey: "dashboard.leaderboard", path: "/leaderboard", size: "sm", gradient: "from-yellow-300/40 to-amber-400/40" },
  { id: "community", emoji: "🌍", nameKey: "dashboard.community", path: "/community", size: "sm", gradient: "from-green-400/40 to-emerald-500/40" },
  { id: "progress", emoji: "📊", nameKey: "dashboard.progress", path: "/progress", size: "sm", gradient: "from-cyan-400/40 to-blue-500/40" },
  { id: "athkar", emoji: "🤲", nameKey: "home.cat.athkar", path: "/athkar/morning", size: "sm", gradient: "from-amber-300/40 to-orange-400/40" },
  { id: "noorani", emoji: "📚", nameKey: "dashboard.noorani", path: "/noorani", size: "sm", gradient: "from-indigo-400/40 to-blue-500/40" },
  { id: "settings", emoji: "⚙️", nameKey: "home.cat.parametres", path: "/settings", size: "sm", gradient: "from-slate-400/40 to-gray-500/40" },
  { id: "games", emoji: "🎮", nameKey: "dashboard.games", path: "/jeux", size: "sm", gradient: "from-fuchsia-400/40 to-pink-500/40" },
];

const SIZE_MAP = {
  xl: "w-[88px] h-[88px] text-3xl",
  lg: "w-[76px] h-[76px] text-2xl",
  md: "w-[64px] h-[64px] text-xl",
  sm: "w-[56px] h-[56px] text-lg",
};

// ═══ Single Bubble ═══

function Bubble({ item, index, t }: { item: BubbleItem; index: number; t: (k: any) => string }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 22 }}
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => navigate(item.path)}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={`
          ${SIZE_MAP[item.size]} rounded-full
          bg-gradient-to-br ${item.gradient}
          backdrop-blur-xl border border-white/20
          flex items-center justify-center
          shadow-[0_4px_20px_rgba(0,0,0,0.15)]
          hover:shadow-[0_8px_30px_rgba(120,120,255,0.2)]
          transition-shadow duration-300
          relative overflow-hidden
        `}
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        <span className="relative z-10">{item.emoji}</span>
      </div>
      <span className="text-[10px] font-medium text-foreground/90 text-center leading-tight w-16 line-clamp-2">
        {t(item.nameKey as any)}
      </span>
    </motion.button>
  );
}

// ═══ Floating Particles ═══

function BubbleParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: `${(i * 31 + 7) % 100}%`,
    size: 4 + (i % 3) * 3,
    duration: 12 + (i % 5) * 4,
    delay: (i * 1.1) % 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ left: p.x, width: p.size, height: p.size, bottom: -10 }}
          animate={{ y: [0, -700], opacity: [0, 0.4, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ═══ Main ═══

export function FuturisticBubbleHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const xp = useQuranXp();

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[hsl(260,50%,10%)] via-[hsl(240,40%,14%)] to-[hsl(220,35%,8%)] relative overflow-hidden">
      {/* Neon grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <BubbleParticles />

      {/* Gradient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-purple-500/[0.06] blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-cyan-500/[0.05] blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={taaloumLogo} alt="Taaloum" className="w-9 h-9 rounded-full shadow-md ring-2 ring-white/10" />
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">Ta'alam</h1>
                <p className="text-[11px] text-white/50">
                  {t("home.level.label" as any)} {xp.level} · {xp.xp} XP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
                <Flame size={13} className="text-orange-400" />
                <span className="text-[11px] font-semibold text-white/80">0j</span>
              </div>
              <ProfileBubble />
            </div>
          </div>
        </div>

        {/* Basmala */}
        <p className="font-arabic text-xl text-purple-300/80 text-center mb-4 px-5">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* Signup banner for guests */}
        {!user && (
          <div className="px-5 mb-4">
            <Link
              to="/auth"
              className="flex items-center gap-3 rounded-2xl p-4 bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.1] active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">✨</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{t("home.signupTitle" as any)}</p>
                <p className="text-[10px] text-white/50">{t("home.signupDesc" as any)}</p>
              </div>
              <span className="text-xs font-bold text-purple-300 shrink-0">{t("home.signupBtn" as any)} →</span>
            </Link>
          </div>
        )}

        {/* Bubble Grid */}
        <div className="px-5">
          {/* Primary row */}
          <div className="flex justify-center gap-5 mb-5">
            {BUBBLES.filter((b) => b.size === "xl").map((b, i) => (
              <Bubble key={b.id} item={b} index={i} t={t} />
            ))}
          </div>

          {/* Secondary row */}
          <div className="flex justify-center gap-4 mb-5">
            {BUBBLES.filter((b) => b.size === "lg").map((b, i) => (
              <Bubble key={b.id} item={b} index={i + 2} t={t} />
            ))}
          </div>

          {/* Tertiary row */}
          <div className="flex flex-wrap justify-center gap-4 mb-5">
            {BUBBLES.filter((b) => b.size === "md").map((b, i) => (
              <Bubble key={b.id} item={b} index={i + 5} t={t} />
            ))}
          </div>

          {/* Quick links row */}
          <div className="flex flex-wrap justify-center gap-3">
            {BUBBLES.filter((b) => b.size === "sm").map((b, i) => (
              <Bubble key={b.id} item={b} index={i + 9} t={t} />
            ))}
          </div>
        </div>

        {/* Footer message */}
        <p className="mt-8 mb-4 text-[10px] text-white/30 text-center leading-relaxed max-w-[280px] mx-auto">
          {t("home.freeMessage" as any)}{" "}
          <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-purple-300/50 font-medium underline underline-offset-2">
            taalam.eu
          </a>
        </p>
      </div>
    </div>
  );
}
