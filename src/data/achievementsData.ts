export interface AchievementDef {
  id: string;
  icon: string;
  rarity: "bronze" | "silver" | "gold" | "legendary";
  pointsRequired?: number;
  /** i18n key suffix for name + description */
  i18nKey: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Hifz tiers
  { id: "hifz_bronze", icon: "🥉", rarity: "bronze", pointsRequired: 500, i18nKey: "hifzBronze" },
  { id: "hifz_silver", icon: "🥈", rarity: "silver", pointsRequired: 2000, i18nKey: "hifzSilver" },
  { id: "hifz_gold", icon: "🥇", rarity: "gold", pointsRequired: 5000, i18nKey: "hifzGold" },
  { id: "hifz_legend", icon: "💎", rarity: "legendary", pointsRequired: 10000, i18nKey: "hifzLegend" },
  // Quiz
  { id: "quiz_bronze", icon: "📝", rarity: "bronze", pointsRequired: 100, i18nKey: "quizBronze" },
  { id: "quiz_silver", icon: "🧠", rarity: "silver", pointsRequired: 500, i18nKey: "quizSilver" },
  { id: "quiz_master", icon: "👑", rarity: "gold", pointsRequired: 1000, i18nKey: "quizMaster" },
  // Streak
  { id: "streak_7", icon: "🔥", rarity: "bronze", pointsRequired: 50, i18nKey: "streak7" },
  { id: "streak_30", icon: "🔥", rarity: "gold", pointsRequired: 200, i18nKey: "streak30" },
  { id: "streak_100", icon: "🌟", rarity: "legendary", pointsRequired: 500, i18nKey: "streak100" },
  // Tarteel
  { id: "tarteel_start", icon: "🎤", rarity: "bronze", pointsRequired: 50, i18nKey: "tarteelStart" },
  { id: "tarteel_pro", icon: "🎤", rarity: "gold", pointsRequired: 500, i18nKey: "tarteelPro" },
  // Reading
  { id: "reading_start", icon: "📖", rarity: "bronze", pointsRequired: 100, i18nKey: "readingStart" },
  { id: "reading_marathon", icon: "📚", rarity: "silver", pointsRequired: 1000, i18nKey: "readingMarathon" },
  // Prayer
  { id: "prayer_week", icon: "🕌", rarity: "bronze", pointsRequired: 175, i18nKey: "prayerWeek" },
  { id: "prayer_month", icon: "🕋", rarity: "silver", pointsRequired: 750, i18nKey: "prayerMonth" },
  // Ramadan
  { id: "ramadan_10", icon: "🌙", rarity: "bronze", pointsRequired: 100, i18nKey: "ramadan10" },
  { id: "ramadan_30", icon: "✨", rarity: "legendary", pointsRequired: 300, i18nKey: "ramadan30" },
  // Social
  { id: "first_class", icon: "🏫", rarity: "bronze", pointsRequired: 0, i18nKey: "firstClass" },
  { id: "helper", icon: "🤝", rarity: "silver", pointsRequired: 0, i18nKey: "helper" },
];

export const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: "from-amber-700/20 to-amber-900/10", border: "border-amber-600/40", text: "text-amber-700" },
  silver: { bg: "from-slate-300/30 to-slate-400/10", border: "border-slate-400/50", text: "text-slate-600" },
  gold: { bg: "from-yellow-400/30 to-amber-500/10", border: "border-yellow-500/60", text: "text-yellow-600" },
  legendary: { bg: "from-purple-500/20 to-pink-500/10", border: "border-purple-400/50", text: "text-purple-600" },
  common: { bg: "from-muted/20 to-muted/5", border: "border-border", text: "text-muted-foreground" },
};
