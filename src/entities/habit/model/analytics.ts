import {
  getCompletionValue,
  resolveGoalProgressRange,
  sumCompletionValuesInRange,
} from "./completions";
import { toDateKey } from "./date";
import { buildCurrentStreak, buildBestStreak } from "./habitAnalyticsStreak";
import { buildHeatmap, buildWeeklyPerformance } from "./habitAnalyticsVisuals";
import { isHabitCompletedForDate, isHabitScheduledOnDate } from "./schedule";
import type { Habit, HabitMetrics, HabitSummary, HabitWithMetrics } from "./types";

function buildGoalProgress(
  habit: Habit,
  today: Date,
): HabitMetrics["goalProgress"] {
  const { startDate, endDate, periodLabel } = resolveGoalProgressRange(habit.goal.period, today);

  const currentValue = sumCompletionValuesInRange({
    habit,
    startDate,
    endDate,
    onlyScheduled: (targetDate) => isHabitScheduledOnDate(habit, targetDate),
  });
  const target = habit.goal.target;
  const remainingValue = Math.max(target - currentValue, 0);
  const progressPercent =
    target <= 0 ? 0 : Math.min(100, Math.round((currentValue / target) * 100));

  return {
    period: habit.goal.period,
    target,
    currentValue,
    remainingValue,
    progressPercent,
    periodLabel,
  };
}

export { isHabitScheduledOnDate, isHabitCompletedForDate } from "./schedule";

export function buildHabitMetrics(habit: Habit, today: Date = new Date()): HabitMetrics {
  const todayKey = toDateKey(today);
  const weeklyPerformance = buildWeeklyPerformance(habit, today);
  const weeklyScheduledCount = weeklyPerformance.filter((day) => day.scheduled).length;
  const weeklyCompletedCount = weeklyPerformance.filter((day) => day.completed).length;

  return {
    completedToday: isHabitCompletedForDate(habit, today),
    todayLoggedValue: getCompletionValue(habit, todayKey),
    goalProgress: buildGoalProgress(habit, today),
    currentStreak: buildCurrentStreak(habit, today),
    bestStreak: buildBestStreak(habit, today),
    weeklyPerformance,
    weeklyCompletedCount,
    weeklyScheduledCount,
    heatmap: buildHeatmap(habit, today),
  };
}

export function withHabitMetrics(habits: Habit[], today: Date = new Date()): HabitWithMetrics[] {
  return habits.map((habit) => ({
    ...habit,
    metrics: buildHabitMetrics(habit, today),
  }));
}

export function buildHabitSummary(habits: HabitWithMetrics[]): HabitSummary {
  const positive = habits.filter((habit) => habit.kind === "positive").length;
  const negative = habits.filter((habit) => habit.kind === "negative").length;
  const completedToday = habits.filter((habit) => habit.metrics.completedToday).length;

  return {
    total: habits.length,
    positive,
    negative,
    completedToday,
  };
}
