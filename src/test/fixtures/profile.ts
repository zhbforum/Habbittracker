import type { AchievementProgress, AchievementSummary } from "@entities/achievement/model/types";
import type { ProfileBundle, UserProfile, UserStats } from "@entities/profile/model/types";

export function createUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    name: "Alex Doe",
    username: "alex",
    usernameUpdatedAt: "2026-06-01T10:00:00.000Z",
    bio: "Keep moving.",
    avatarUrl: "https://example.com/avatar.png",
    themePreference: "light",
    ...overrides,
  };
}

export function createUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    totalHabits: 4,
    currentStreak: 7,
    ...overrides,
  };
}

export function createAchievementProgress(
  overrides: Partial<AchievementProgress> = {},
): AchievementProgress {
  return {
    id: "first_habit",
    title: "First Habit",
    description: "Created your first habit.",
    tier: "starter",
    iconName: "sparkles",
    progress: 1,
    target: 1,
    unlockedAt: "2026-06-02T12:00:00.000Z",
    isUnlocked: true,
    ...overrides,
  };
}

export function createAchievementSummary(
  overrides: Partial<AchievementSummary> = {},
): AchievementSummary {
  return {
    total: 1,
    unlocked: 1,
    ...overrides,
  };
}

export function createProfileBundle(overrides: Partial<ProfileBundle> = {}): ProfileBundle {
  return {
    profile: createUserProfile(),
    stats: createUserStats(),
    achievements: [createAchievementProgress()],
    achievementSummary: createAchievementSummary(),
    ...overrides,
  };
}
