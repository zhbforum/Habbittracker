import type { ThemeMode } from "@/shared/theme";

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
};

export type ProfileFormValues = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

export type PublicProfile = ProfileBundle;
