import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Globe, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { generateFictiveUsers, getCountryLeaderboard } from "@/data/tarteel-seed-users";

export default function GlobalLeaderboard() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("global");

  const fictiveUsers = useMemo(() => generateFictiveUsers(), []);
  const countryRanking = useMemo(() => getCountryLeaderboard(fictiveUsers), [fictiveUsers]);

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="gap-1 text-xs">
            <Trophy size={14} />
            {t("tarteelLb.global" as any)}
          </TabsTrigger>
          <TabsTrigger value="country" className="gap-1 text-xs">
            <Globe size={14} />
            {t("tarteelLb.byCountry" as any)}
          </TabsTrigger>
        </TabsList>

        {/* Global tab */}
        <TabsContent value="global" className="space-y-2 mt-3">
          {fictiveUsers.slice(0, 50).map((user, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.6) }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  i < 3
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border/40"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {medal ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm bg-muted">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {user.versesCompleted} {t("tarteelLb.verses" as any)} · {user.averageAccuracy}%
                  </p>
                </div>

                {/* Score + streak */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-primary">
                    {user.totalScore.toLocaleString()}
                  </p>
                  {user.streak > 30 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      🔥 {user.streak}{t("tarteelLb.days" as any)}
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Country tab */}
        <TabsContent value="country" className="space-y-3 mt-3">
          {countryRanking.map((c, i) => (
            <motion.div
              key={c.countryCode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              className="rounded-xl border border-border/40 bg-card p-3 space-y-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-6 text-center">
                  #{i + 1}
                </span>
                <span className="text-xl">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{c.country}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users size={10} />
                    {c.totalUsers} {t("tarteelLb.users" as any)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">
                    {c.averageScore.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("tarteelLb.avgScore" as any)}
                  </p>
                </div>
              </div>

              {/* Top user */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5">
                <Trophy size={10} className="text-primary shrink-0" />
                <span className="font-medium">{t("tarteelLb.topPlayer" as any)}:</span>
                <span className="truncate font-bold text-foreground">{c.topUser.name}</span>
                <span className="ml-auto shrink-0">({c.topUser.versesCompleted} {t("tarteelLb.verses" as any)})</span>
              </div>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
