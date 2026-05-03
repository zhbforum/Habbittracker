import {
  DEFAULT_HABIT_FORM_VALUES,
  HABIT_GOAL_TARGET_MAX,
  HABIT_GOAL_TARGET_MIN,
  HABIT_GOAL_UNIT_MAX_LENGTH,
} from "./constants";
import { HABIT_GOAL_METRIC_VALUES, HABIT_GOAL_PERIOD_VALUES } from "./dto";
import { addDays, startOfWeek, toDateKey } from "./date";
import type {
  Habit,
  HabitCompletionEntry,
  HabitGoal,
  HabitGoalMetric,
  HabitGoalPeriod,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGoalMetric(value: unknown): value is HabitGoalMetric {
  return HABIT_GOAL_METRIC_VALUES.includes(value as HabitGoalMetric);
}

function isGoalPeriod(value: unknown): value is HabitGoalPeriod {
  return HABIT_GOAL_PERIOD_VALUES.includes(value as HabitGoalPeriod);
}

function normalizeGoalTarget(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_HABIT_FORM_VALUES.goalTarget;
  }

  const rounded = Math.round(parsed);
  return Math.max(HABIT_GOAL_TARGET_MIN, Math.min(HABIT_GOAL_TARGET_MAX, rounded));
}

function sanitizeGoalUnit(unit: unknown): string {
  if (typeof unit !== "string") {
    return "";
  }

  return unit
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, HABIT_GOAL_UNIT_MAX_LENGTH);
}

function resolveDefaultGoalUnit(metric: HabitGoalMetric): string {
  return metric === "value" ? "units" : "times";
}

export function normalizeHabitGoal(rawGoal: unknown): HabitGoal {
  if (!isRecord(rawGoal)) {
    return {
      metric: DEFAULT_HABIT_FORM_VALUES.goalMetric,
      period: DEFAULT_HABIT_FORM_VALUES.goalPeriod,
      target: DEFAULT_HABIT_FORM_VALUES.goalTarget,
      unit: DEFAULT_HABIT_FORM_VALUES.goalUnit,
    };
  }

  const metric = isGoalMetric(rawGoal.metric)
    ? rawGoal.metric
    : DEFAULT_HABIT_FORM_VALUES.goalMetric;
  const period = isGoalPeriod(rawGoal.period)
    ? rawGoal.period
    : DEFAULT_HABIT_FORM_VALUES.goalPeriod;
  const target = normalizeGoalTarget(rawGoal.target);
  const unit = sanitizeGoalUnit(rawGoal.unit) || resolveDefaultGoalUnit(metric);

  return {
    metric,
    period,
    target,
    unit,
  };
}

export function normalizeCompletionEntry(rawValue: unknown): HabitCompletionEntry | null {
  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    return {
      completedAt: rawValue,
      value: null,
    };
  }

  if (!isRecord(rawValue)) {
    return null;
  }

  const completedAt =
    typeof rawValue.completedAt === "string" && rawValue.completedAt.trim().length > 0
      ? rawValue.completedAt
      : null;

  if (!completedAt) {
    return null;
  }

  const rawNumber = rawValue.value;
  const value =
    typeof rawNumber === "number" && Number.isFinite(rawNumber)
      ? Math.max(0, rawNumber)
      : null;

  return {
    completedAt,
    value,
  };
}

export function getCompletionEntry(habit: Habit, dateKey: string): HabitCompletionEntry | null {
  return habit.completions[dateKey] ?? null;
}

export function getCompletionValue(habit: Habit, dateKey: string): number {
  const entry = getCompletionEntry(habit, dateKey);

  if (!entry) {
    return 0;
  }

  if (typeof entry.value === "number" && Number.isFinite(entry.value)) {
    return Math.max(0, entry.value);
  }

  return 1;
}

export function hasCompletionEntry(habit: Habit, dateKey: string): boolean {
  return Boolean(getCompletionEntry(habit, dateKey));
}

export function hasLoggedValueOnDateKey(habit: Habit, dateKey: string): boolean {
  if (!hasCompletionEntry(habit, dateKey)) {
    return false;
  }

  return getCompletionValue(habit, dateKey) > 0;
}

export function isHabitCompletedOnDateKey(habit: Habit, dateKey: string): boolean {
  if (!hasCompletionEntry(habit, dateKey)) {
    return false;
  }

  if (habit.goal.metric === "checkins") {
    return getCompletionValue(habit, dateKey) >= 1;
  }

  return getCompletionValue(habit, dateKey) >= habit.goal.target;
}

export function resolveGoalProgressRange(
  period: HabitGoalPeriod,
  date: Date,
): {
  startDate: Date;
  endDate: Date;
  periodLabel: string;
} {
  if (period === "day") {
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return {
      startDate: dateStart,
      endDate: dateStart,
      periodLabel: "Today",
    };
  }

  if (period === "week") {
    const weekStart = startOfWeek(date);
    const weekEnd = addDays(weekStart, 6);

    return {
      startDate: weekStart,
      endDate: weekEnd,
      periodLabel: "This week",
    };
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: monthStart,
    endDate: monthEnd,
    periodLabel: "This month",
  };
}

export function sumCompletionValuesInRange(args: {
  habit: Habit;
  startDate: Date;
  endDate: Date;
  onlyScheduled?: (targetDate: Date) => boolean;
}): number {
  const { habit, startDate, endDate, onlyScheduled } = args;
  let cursor = new Date(startDate);
  let total = 0;

  while (cursor <= endDate) {
    if (!onlyScheduled || onlyScheduled(cursor)) {
      total += getCompletionValue(habit, toDateKey(cursor));
    }

    cursor = addDays(cursor, 1);
  }

  return total;
}
