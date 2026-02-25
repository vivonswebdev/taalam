import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Globe, Flag, Share2 } from "lucide-react";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷", BE: "🇧🇪", MA: "🇲🇦", DZ: "🇩🇿", TN: "🇹🇳", NL: "🇳🇱",
  GB: "🇬🇧", US: "🇺🇸", DE: "🇩🇪", SA: "🇸🇦", AE: "🇦🇪", TR: "🇹🇷",
  EG: "🇪🇬", ID: "🇮🇩", MY: "🇲🇾", PK: "🇵🇰", BD: "🇧🇩", CA: "🇨🇦",
};

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className={`flex items-center gap-3 p-3 rounded-xl ${rank <= 3 ? "bg-primary/5 border border-primary/10" : "bg-card border border-border"}`}
    >
      <div className="w-8 text-center">
        {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm font-bold text-muted-foreground">#{rank}</span>}
      </div>
      <span className="text-2xl">{entry.avatar_emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{entry.display_name}</p>
        <p className="text-xs text-muted-foreground">{entry.xp_total} XP · {Number(entry.mastery_score).toFixed(0)}%</p>
      </div>
      {entry.country_code && (
        <span className="text-lg">{COUNTRY_FLAGS[entry.country_code] || "🌍"}</span>
      )}
    </motion.div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { globalBoard, countryBoard, loading, selectedCountry, fetchByCountry } = useLeaderboard();
  const [tab, setTab] = useState<"global" | "country">("global");

  const board = tab === "global" ? globalBoard : countryBoard;

  const handleShare = () => {
    const text = `🏆 Classement Iqraa – Rejoins-moi sur https://iqraacoran.lovable.app !`;
    if (navigator.share) {
      navigator.share({ title: "Classement Iqraa", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">{t("join.back")}</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy size={24} className="text-secondary" />
            {t("leaderboard.title")}
          </h1>
          <Button size="icon" variant="ghost" onClick={handleShare}>
            <Share2 size={18} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-4">
          <button
            onClick={() => setTab("global")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "global" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Globe size={14} /> {t("leaderboard.global")}
          </button>
          <button
            onClick={() => {
              setTab("country");
              // Try to detect user country, default to FR
              if (!selectedCountry) fetchByCountry("FR");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "country" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Flag size={14} /> {t("leaderboard.country")}
          </button>
        </div>

        {/* Country selector */}
        {tab === "country" && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
            {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
              <button
                key={code}
                onClick={() => fetchByCountry(code)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${selectedCountry === code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {flag} {code}
              </button>
            ))}
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">{t("reading.loading")}</div>
        ) : board.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-muted-foreground text-sm">{t("leaderboard.empty")}</p>
            {!user && (
              <Button onClick={() => navigate("/auth")} className="mt-4 rounded-xl">
                {t("auth.signup")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {board.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
