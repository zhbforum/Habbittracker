import type { ThemeMode } from "@/shared/theme";
import type { AchievementProgress, AchievementSummary } from "@entities/achievement/model/types";

export type UserProfile = {
  id: string;
  name: string;
  username: string | null;
  usernameUpdatedAt: string | null;
  bio: string | null;
  avatarUrl: string | null;
  themePreference: ThemeMode;
};

export type UserStats = {
  totalHabits: number;
  currentStreak: number;
};

export type ProfileBundle = {
  profile: UserProfile;
  stats: UserStats;
  achievements: AchievementProgress[];
  achievementSummary: AchievementSummary;
};

export type ProfileFormValues = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

export type PublicProfile = ProfileBundle;
