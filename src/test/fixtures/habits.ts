import type {
  Habit,
  HabitGroup,
  HabitGroupFormValues,
  HabitGroupWithMetrics,
  HabitSummary,
  HabitWithMetrics,
} from "@features/habits/model/types";
import {
  createDefaultHabitGroupFormValues,
  DEFAULT_HABIT_FORM_VALUES,
} from "@features/habits/model/constants";

export function createHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id,
    userId: "user-1",
    name: `Habit ${id}`,
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "checkins",
      period: "day",
      target: 1,
      unit: "times",
    },
    completions: {},
  };

  return {
    ...base,
    ...overrides,
    goal: {
      ...base.goal,
      ...(overrides.goal ?? {}),
    },
    completions: {
      ...base.completions,
      ...(overrides.completions ?? {}),
    },
  };
}

export function createHabitWithMetrics(
  id: string,
  overrides: Partial<HabitWithMetrics> = {},
): HabitWithMetrics {
  const base: HabitWithMetrics = {
    ...createHabit(id),
    metrics: {
      completedToday: false,
      todayLoggedValue: 0,
      goalProgress: {
        period: "day",
        target: 1,
        currentValue: 0,
        remainingValue: 1,
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
  };

  return {
    ...base,
    ...overrides,
    goal: {
      ...base.goal,
      ...(overrides.goal ?? {}),
    },
    completions: {
      ...base.completions,
      ...(overrides.completions ?? {}),
    },
    metrics: {
      ...base.metrics,
      ...(overrides.metrics ?? {}),
      goalProgress: {
        ...base.metrics.goalProgress,
        ...(overrides.metrics?.goalProgress ?? {}),
      },
    },
  };
}

export function createHabitGroup(id: string, overrides: Partial<HabitGroup> = {}): HabitGroup {
  const base: HabitGroup = {
    id,
    userId: "user-1",
    name: `Group ${id}`,
    description: "",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    reminderStartTime: "07:00",
    reminderEndTime: "21:00",
    dailyGoal: 1,
    habitIds: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    habitIds: overrides.habitIds ?? base.habitIds,
  };
}

export function createHabitGroupWithMetrics(
  id: string,
  overrides: Partial<HabitGroupWithMetrics> = {},
): HabitGroupWithMetrics {
  const base: HabitGroupWithMetrics = {
    ...createHabitGroup(id),
    metrics: {
      totalHabitsCount: 0,
      scheduledHabitsCount: 0,
      completedHabitsCount: 0,
      isScheduledToday: false,
      isWithinDateRange: true,
      targetCount: 0,
      remainingCount: 0,
      progressPercent: 0,
      isCompletedToday: false,
      sessionPhase: "active",
    },
  };

  return {
    ...base,
    ...overrides,
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    habitIds: overrides.habitIds ?? base.habitIds,
    metrics: {
      ...base.metrics,
      ...(overrides.metrics ?? {}),
    },
  };
}

export function createHabitSummary(overrides: Partial<HabitSummary> = {}): HabitSummary {
  return {
    total: 0,
    positive: 0,
    negative: 0,
    completedToday: 0,
    ...overrides,
  };
}

export function createHabitFormValues(overrides: Partial<typeof DEFAULT_HABIT_FORM_VALUES> = {}) {
  return {
    ...DEFAULT_HABIT_FORM_VALUES,
    ...overrides,
  };
}

export function createHabitGroupFormValues(overrides: Partial<HabitGroupFormValues> = {}) {
  return {
    ...createDefaultHabitGroupFormValues(new Date("2026-06-01T10:00:00.000Z")),
    ...overrides,
  };
}
