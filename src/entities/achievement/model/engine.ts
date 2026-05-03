import {
  isHabitCompletedForDate,
  isHabitScheduledOnDate,
  withHabitMetrics,
} from "@entities/habit/model/analytics";
import {
  getCompletionValue,
  isHabitCompletedOnDateKey,
} from "@entities/habit/model/completions";
import { fromDateKey } from "@entities/habit/model/date";
import { withHabitGroupMetrics } from "@entities/habit/model/groupAnalytics";
import type { Habit, HabitGroup, HabitWithMetrics } from "@entities/habit/model/types";

import type { AchievementSignals } from "./types";

function toActiveDateKeys(habits: Habit[]): string[] {
  const dateKeySet = new Set<string>();

  habits.forEach((habit) => {
    Object.keys(habit.completions).forEach((dateKey) => {
      if (dateKey.trim().length > 0) {
        dateKeySet.add(dateKey);
      }
    });
  });

  return Array.from(dateKeySet).sort((left, right) => left.localeCompare(right));
}

function toDateHabitSnapshot(habits: Habit[], dateKey: string): HabitWithMetrics[] {
  const date = fromDateKey(dateKey);

  return habits.map((habit) => ({
    ...habit,
    metrics: {
      completedToday: isHabitCompletedForDate(habit, date),
      todayLoggedValue: getCompletionValue(habit, dateKey),
      goalProgress: {
        period: habit.goal.period,
        target: habit.goal.target,
        currentValue: 0,
        remainingValue: 0,
        progressPercent: 0,
        periodLabel: "Today",
      },
      currentStreak: 0,
      bestStreak: 0,
      weeklyPerformance: [],
      weeklyCompletedCount: 0,
      weeklyScheduledCount: 0,
      heatmap: [],
    },
  }));
}

function resolvePerfectDays(habits: Habit[], activeDateKeys: string[]): number {
  let perfectDays = 0;

  activeDateKeys.forEach((dateKey) => {
    const date = fromDateKey(dateKey);
    const scheduledHabits = habits.filter((habit) => isHabitScheduledOnDate(habit, date));

    if (scheduledHabits.length === 0) {
      return;
    }

    const allDone = scheduledHabits.every((habit) => isHabitCompletedForDate(habit, date));

    if (allDone) {
      perfectDays += 1;
    }
  });

  return perfectDays;
}

function resolveGroupGoalHits(
  habits: Habit[],
  groups: HabitGroup[],
  activeDateKeys: string[],
): number {
  if (groups.length === 0 || activeDateKeys.length === 0) {
    return 0;
  }

  let groupGoalHits = 0;

  activeDateKeys.forEach((dateKey) => {
    const date = fromDateKey(dateKey);
    const habitSnapshot = toDateHabitSnapshot(habits, dateKey);
    const groupsWithMetrics = withHabitGroupMetrics(groups, habitSnapshot, date);

    groupGoalHits += groupsWithMetrics.filter((group) => group.metrics.isCompletedToday).length;
  });

  return groupGoalHits;
}

export function buildAchievementSignals(
  habits: Habit[],
  groups: HabitGroup[],
  today: Date = new Date(),
): AchievementSignals {
  const habitsWithMetricsToday = withHabitMetrics(habits, today);
  const bestStreak = habitsWithMetricsToday.reduce((maxStreak, habit) => {
    return Math.max(maxStreak, habit.metrics.bestStreak);
  }, 0);

  const totalCompletions = habits.reduce((count, habit) => {
    const habitCount = Object.keys(habit.completions).reduce((localCount, dateKey) => {
      if (habit.goal.period === "day") {
        return localCount + (isHabitCompletedOnDateKey(habit, dateKey) ? 1 : 0);
      }

      return localCount + (getCompletionValue(habit, dateKey) > 0 ? 1 : 0);
    }, 0);

    return count + habitCount;
  }, 0);

  const activeDateKeys = toActiveDateKeys(habits);
  const perfectDays = resolvePerfectDays(habits, activeDateKeys);
  const groupGoalHits = resolveGroupGoalHits(habits, groups, activeDateKeys);

  return {
    totalHabits: habits.length,
    totalGroups: groups.length,
    totalCompletions,
    activeDays: activeDateKeys.length,
    perfectDays,
    bestStreak,
    groupGoalHits,
  };
}

