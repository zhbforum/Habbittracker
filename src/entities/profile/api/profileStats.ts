import { fetchLocalHabitStatsForUser } from "@entities/habit/api/habitStorage";
import { getSupabaseClient } from "@/shared/api/supabase/client";

import { INITIAL_USER_STATS } from "../model/constants";
import type { UserStats } from "../model/types";
import { HABITS_TABLE } from "./profileDb";

async function resolveTotalHabits(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from(HABITS_TABLE)
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function resolveCurrentStreak(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const streakColumnCandidates = ["current_streak", "streak"] as const;

  for (const columnName of streakColumnCandidates) {
    const { data, error } = await supabase
      .from(HABITS_TABLE)
      .select(columnName)
      .eq("user_id", userId)
      .order(columnName, {
        ascending: false,
      })
      .limit(1)
      .maybeSingle<Record<typeof columnName, unknown>>();

    if (error || !data) {
      continue;
    }

    const streakValue = data[columnName];

    if (typeof streakValue === "number" && Number.isFinite(streakValue)) {
      return Math.max(0, Math.round(streakValue));
    }
  }

  return 0;
}

async function fetchRemoteUserStats(userId: string): Promise<UserStats> {
  const [totalHabits, currentStreak] = await Promise.all([
    resolveTotalHabits(userId),
    resolveCurrentStreak(userId),
  ]);

  return {
    totalHabits,
    currentStreak,
  };
}

export async function fetchCurrentUserStats(userId: string): Promise<UserStats> {
  const [remoteStats, localStats] = await Promise.all([
    fetchRemoteUserStats(userId).catch(() => INITIAL_USER_STATS),
    fetchLocalHabitStatsForUser(userId).catch(() => INITIAL_USER_STATS),
  ]);

  return {
    totalHabits: Math.max(remoteStats.totalHabits, localStats.totalHabits),
    currentStreak: Math.max(remoteStats.currentStreak, localStats.currentStreak),
  };
}

export async function fetchPublicUserStats(userId: string): Promise<UserStats> {
  return fetchRemoteUserStats(userId).catch(() => INITIAL_USER_STATS);
}
