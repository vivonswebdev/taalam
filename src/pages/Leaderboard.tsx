import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Globe, Flag, GraduationCap, Users, Share2, ChevronUp, Plus } from "lucide-react";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useClassLeaderboard } from "@/hooks/useClassLeaderboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LigueBadge, { getLigue, getNextLigue, LIGUES, type Ligue } from "@/components/LigueBadge";

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷", BE: "🇧🇪", MA: "🇲🇦", DZ: "🇩🇿", TN: "🇹🇳", NL: "🇳🇱",
  GB: "🇬🇧", US: "🇺🇸", DE: "🇩🇪", SA: "🇸🇦", AE: "🇦🇪", TR: "🇹🇷",
  EG: "🇪🇬", ID: "🇮🇩", MY: "🇲🇾", PK: "🇵🇰", BD: "🇧🇩", CA: "🇨🇦",
};

function LeaderboardRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.5) }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        isMe
          ? "bg-primary/10 border-2 border-primary ring-1 ring-primary/20"
          : rank <= 3
          ? "bg-primary/5 border border-primary/10"
          : "bg-card border border-border"
      }`}
    >
      <div className="w-8 text-center">
        {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm font-bold text-muted-foreground">#{rank}</span>}
      </div>
      <span className="text-2xl">{entry.avatar_emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {entry.display_name}
            {isMe && <span className="text-xs text-primary ml-1">← toi</span>}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{entry.xp_total} XP · {Number(entry.mastery_score).toFixed(0)}%</p>
      </div>
      <div className="flex items-center gap-1.5">
        {entry.country_code && (
          <span className="text-sm">{COUNTRY_FLAGS[entry.country_code] || "🌍"}</span>
        )}
        <LigueBadge ligue={entry.ligue} size="sm" />
      </div>
    </motion.div>
  );
}

function MyRankCard({ board, userId, ligue }: { board: LeaderboardEntry[]; userId: string | undefined; ligue: Ligue }) {
  const { t } = useLanguage();
  const myIndex = board.findIndex((e) => e.user_id === userId);
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const nextPlayer = myIndex > 0 ? board[myIndex - 1] : null;
  const me = myIndex >= 0 ? board[myIndex] : null;
  const pointsToNext = nextPlayer && me ? nextPlayer.xp_total - me.xp_total : null;

  const nextLigue = getNextLigue(ligue);
  const nextLigueConfig = nextLigue ? LIGUES[nextLigue] : null;
  const xpToNextLigue = nextLigueConfig && me ? nextLigueConfig.minXP - me.xp_total : null;

  if (!myRank) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4 mb-4"
    >
      <div className="flex items-center gap-3">
        <LigueBadge ligue={ligue} size="lg" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("lb.yourRank")}</p>
          <p className="text-2xl font-black text-foreground">#{myRank} <span className="text-sm font-medium text-muted-foreground">/ {board.length}</span></p>
          <p className="text-xs text-muted-foreground">{LIGUES[ligue].name} · {me?.xp_total} XP</p>
        </div>
      </div>
      {pointsToNext !== null && pointsToNext > 0 && (
        <div className="mt-3 flex items-center gap-2 bg-card/60 rounded-lg p-2">
          <ChevronUp size={14} className="text-primary" />
          <p className="text-xs text-foreground">
            <span className="font-bold text-primary">+{pointsToNext} XP</span> {t("lb.toOvertake")} #{myRank - 1}
          </p>
        </div>
      )}
      {xpToNextLigue !== null && xpToNextLigue > 0 && (
        <div className="mt-2 flex items-center gap-2 bg-card/60 rounded-lg p-2">
          <span className="text-sm">{nextLigueConfig!.emoji}</span>
          <p className="text-xs text-foreground">
            <span className="font-bold text-secondary">+{xpToNextLigue} XP</span> → {t("lb.nextLeague")} {nextLigueConfig!.name}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function ClassTabContent({
  userId,
  ligue,
}: {
  userId: string | undefined;
  ligue: Ligue;
}) {
  const { t } = useLanguage();
  const { myClassrooms, classBoard, selectedClassId, loading, setSelectedClassId, createClassroom, joinByCode } = useClassLeaderboard();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const handleCreate = async () => {
    if (!newClassName.trim()) return;
    await createClassroom(newClassName.trim());
    setNewClassName("");
    setShowCreate(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const result = await joinByCode(joinCode.trim());
    if (result.error === "not_found") setJoinError(t("lb.classNotFound"));
    else if (result.error === "already_member") setJoinError(t("lb.alreadyMember"));
    else if (result.error) setJoinError(result.error);
    else {
      setJoinCode("");
      setShowJoin(false);
      setJoinError("");
    }
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl text-xs"
          onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
        >
          <Plus size={14} /> {t("lb.createClass")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-xl text-xs"
          onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
        >
          <Users size={14} /> {t("lb.joinClass")}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-3 flex gap-2">
          <Input
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder={t("lb.classNamePlaceholder")}
            className="rounded-xl text-sm"
          />
          <Button size="sm" className="rounded-xl" onClick={handleCreate}>{t("lb.create")}</Button>
        </motion.div>
      )}

      {/* Join form */}
      {showJoin && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-3">
          <div className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
              placeholder={t("lb.joinCodePlaceholder")}
              className="rounded-xl text-sm uppercase tracking-widest"
              maxLength={6}
            />
            <Button size="sm" className="rounded-xl" onClick={handleJoin}>{t("lb.join")}</Button>
          </div>
          {joinError && <p className="text-xs text-destructive mt-1">{joinError}</p>}
        </motion.div>
      )}

      {/* Class selector */}
      {myClassrooms.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
          {myClassrooms.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedClassId === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              📚 {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected class info */}
      {selectedClassId && myClassrooms.length > 0 && (
        <div className="mb-3 bg-card/60 border border-border rounded-xl p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {myClassrooms.find((c) => c.id === selectedClassId)?.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("lb.code")}: <span className="font-mono font-bold text-foreground">{myClassrooms.find((c) => c.id === selectedClassId)?.join_code}</span>
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{classBoard.length} {t("lb.members")}</p>
        </div>
      )}

      {/* Rank card */}
      {classBoard.length > 0 && userId && (
        <MyRankCard board={classBoard} userId={userId} ligue={ligue} />
      )}

      {/* Board */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">{t("reading.loading")}</div>
      ) : myClassrooms.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-sm text-muted-foreground">{t("lb.noClasses")}</p>
        </div>
      ) : classBoard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm text-muted-foreground">{t("lb.emptyClass")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {classBoard.map((entry, i) => (
            <LeaderboardRow key={entry.id} entry={entry} rank={i + 1} isMe={!!userId && entry.user_id === userId} />
          ))}
        </div>
      )}
    </div>
  );
}

type Tab = "weekly" | "country" | "level" | "class";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { globalBoard, countryBoard, levelBoard, loading, selectedCountry, selectedLevel, fetchByCountry, fetchByLevel } = useLeaderboard();
  const [tab, setTab] = useState<Tab>("weekly");

  const myLigue = useMemo(() => getLigue(profile?.xp_total || 0), [profile]);

  const board = tab === "weekly" ? globalBoard : tab === "country" ? countryBoard : tab === "level" ? levelBoard : [];

  const filteredBoard = tab === "weekly"
    ? globalBoard.filter((e) => e.ligue === myLigue).slice(0, 50)
    : board;

  const handleShare = () => {
    const text = `🏆 Classement Iqraa – Rejoins-moi sur https://iqraacoran.lovable.app !`;
    if (navigator.share) {
      navigator.share({ title: "Classement Iqraa", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const tabs: { key: Tab; icon: typeof Trophy; label: string }[] = [
    { key: "weekly", icon: Trophy, label: t("lb.weekly") },
    { key: "country", icon: Flag, label: t("lb.country") },
    { key: "level", icon: GraduationCap, label: t("lb.level") },
    { key: "class", icon: Users, label: t("lb.class") },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy size={22} className="text-secondary" />
            {t("leaderboard.title")}
          </h1>
          <Button size="icon" variant="ghost" onClick={handleShare}>
            <Share2 size={18} />
          </Button>
        </div>

        {/* My Rank Card (non-class tabs) */}
        {user && profile && tab !== "class" && (
          <MyRankCard board={tab === "weekly" ? filteredBoard : board} userId={user.id} ligue={myLigue} />
        )}

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 mb-4">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                if (key === "country" && !selectedCountry) fetchByCountry(profile?.country_code || "FR");
                if (key === "level") fetchByLevel(selectedLevel);
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors ${
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Class tab */}
        {tab === "class" && (
          <ClassTabContent userId={user?.id} ligue={myLigue} />
        )}

        {/* Non-class tabs content */}
        {tab !== "class" && (
          <>
            {/* League selector for weekly */}
            {tab === "weekly" && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                {(Object.entries(LIGUES) as [Ligue, typeof LIGUES[Ligue]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {}}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 ${
                      myLigue === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {config.emoji} {config.name}
                  </button>
                ))}
              </div>
            )}

            {/* Country selector */}
            {tab === "country" && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                  <button
                    key={code}
                    onClick={() => fetchByCountry(code)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${selectedCountry === code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {flag} {code}
                  </button>
                ))}
              </div>
            )}

            {/* Level selector */}
            {tab === "level" && (
              <div className="flex gap-2 mb-3">
                {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => fetchByLevel(lvl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedLevel === lvl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lvl === "beginner" ? "🌱" : lvl === "intermediate" ? "📚" : "🏆"} {t(`lb.${lvl}` as any)}
                  </button>
                ))}
              </div>
            )}

            {/* Board */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">{t("reading.loading")}</div>
            ) : (tab === "weekly" ? filteredBoard : board).length === 0 ? (
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
                {(tab === "weekly" ? filteredBoard : board).map((entry, i) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    rank={i + 1}
                    isMe={!!user && entry.user_id === user.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
