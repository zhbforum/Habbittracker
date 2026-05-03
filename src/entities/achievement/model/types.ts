export type AchievementTier = "starter" | "bronze" | "silver" | "gold" | "legend";

export type AchievementId =
  | "first_habit"
  | "first_check"
  | "first_group"
  | "first_group_win"
  | "perfect_day_1"
  | "streak_3"
  | "streak_7"
  | "streak_21"
  | "streak_50"
  | "streak_100"
  | "completions_25"
  | "completions_100"
  | "completions_300"
  | "completions_1000"
  | "active_days_7"
  | "active_days_30"
  | "active_days_90"
  | "active_days_180"
  | "perfect_day_5"
  | "perfect_day_15"
  | "perfect_day_50"
  | "group_master_10"
  | "group_master_30"
  | "group_master_100";

export type AchievementSignals = {
  totalHabits: number;
  totalGroups: number;
  totalCompletions: number;
  activeDays: number;
  perfectDays: number;
  bestStreak: number;
  groupGoalHits: number;
};

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  tier: AchievementTier;
  target: number;
  iconName: string;
  resolveProgress: (signals: AchievementSignals) => number;
};

export type AchievementLedgerEntry = {
  achievementId: AchievementId;
  progress: number;
  unlockedAt: string | null;
  updatedAt: string;
};

export type AchievementProgress = {
  id: AchievementId;
  title: string;
  description: string;
  tier: AchievementTier;
  iconName: string;
  progress: number;
  target: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
};

export type AchievementSummary = {
  total: number;
  unlocked: number;
};
