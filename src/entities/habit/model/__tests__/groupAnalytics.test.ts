import type { HabitGroup, HabitWithMetrics } from "../types";
import { buildHabitGroupMetrics } from "../groupAnalytics";

type HabitWithMetricsOverrides = Omit<
  Partial<HabitWithMetrics>,
  "goal" | "completions" | "metrics"
> & {
  goal?: Partial<HabitWithMetrics["goal"]>;
  completions?: HabitWithMetrics["completions"];
  metrics?: Partial<HabitWithMetrics["metrics"]> & {
    goalProgress?: Partial<HabitWithMetrics["metrics"]["goalProgress"]>;
  };
};

function createHabitWithMetrics(overrides: HabitWithMetricsOverrides = {}): HabitWithMetrics {
  const base: HabitWithMetrics = {
    id: "habit-1",
    userId: "user-1",
    name: "Read 20 pages",
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "reading",
    iconColorId: "emerald",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "checkins",
      period: "day",
      target: 1,
      unit: "times",
    },
    completions: {},
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
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    metrics: {
      ...base.metrics,
      ...(overrides.metrics ?? {}),
      goalProgress: {
        ...base.metrics.goalProgress,
        ...(overrides.metrics?.goalProgress ?? {}),
      },
      weeklyPerformance:
        overrides.metrics?.weeklyPerformance ?? base.metrics.weeklyPerformance,
      heatmap: overrides.metrics?.heatmap ?? base.metrics.heatmap,
    },
  };
}

function createGroup(overrides: Partial<HabitGroup> = {}): HabitGroup {
  const base: HabitGroup = {
    id: "group-1",
    userId: "user-1",
    name: "Morning reset",
    description: "",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    reminderStartTime: "07:00",
    reminderEndTime: "21:00",
    dailyGoal: 2,
    habitIds: ["habit-1"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    habitIds: overrides.habitIds ?? base.habitIds,
  };
}

describe("habit group metrics", () => {
  it("calculates daily progress from scheduled member habits", () => {
    const today = new Date(2026, 4, 5, 9, 30);
    const group = createGroup({
      habitIds: ["habit-1", "habit-2"],
      dailyGoal: 3,
    });

    const habits: HabitWithMetrics[] = [
      createHabitWithMetrics({
        id: "habit-1",
        frequency: "daily",
        metrics: { completedToday: true },
      }),
      createHabitWithMetrics({
        id: "habit-2",
        frequency: "weekly",
        weeklyWeekday: 2,
        metrics: { completedToday: false },
      }),
      createHabitWithMetrics({
        id: "habit-3",
        frequency: "daily",
        metrics: { completedToday: true },
      }),
    ];

    const result = buildHabitGroupMetrics(group, habits, today);

    expect(result.totalHabitsCount).toBe(2);
    expect(result.scheduledHabitsCount).toBe(2);
    expect(result.completedHabitsCount).toBe(1);
    expect(result.targetCount).toBe(2);
    expect(result.remainingCount).toBe(1);
    expect(result.progressPercent).toBe(50);
    expect(result.isCompletedToday).toBe(false);
    expect(result.sessionPhase).toBe("active");
  });

  it("does not schedule group outside its date range", () => {
    const today = new Date(2026, 4, 5, 9, 0);
    const group = createGroup({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      reminderStartTime: "08:00",
      reminderEndTime: "10:00",
      habitIds: ["habit-1"],
    });
    const habits = [createHabitWithMetrics({ id: "habit-1", metrics: { completedToday: true } })];

    const result = buildHabitGroupMetrics(group, habits, today);

    expect(result.isWithinDateRange).toBe(false);
    expect(result.isScheduledToday).toBe(false);
    expect(result.scheduledHabitsCount).toBe(0);
    expect(result.completedHabitsCount).toBe(0);
    expect(result.targetCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });

  it("resolves session phase for normal and overnight windows", () => {
    const habits: HabitWithMetrics[] = [];
    const dayGroup = createGroup({
      reminderStartTime: "08:00",
      reminderEndTime: "10:00",
      habitIds: [],
    });
    const overnightGroup = createGroup({
      reminderStartTime: "22:00",
      reminderEndTime: "06:00",
      habitIds: [],
    });

    expect(buildHabitGroupMetrics(dayGroup, habits, new Date(2026, 4, 5, 11, 0)).sessionPhase).toBe(
      "after_end",
    );
    expect(
      buildHabitGroupMetrics(overnightGroup, habits, new Date(2026, 4, 5, 23, 15)).sessionPhase,
    ).toBe("active");
    expect(
      buildHabitGroupMetrics(overnightGroup, habits, new Date(2026, 4, 5, 12, 0)).sessionPhase,
    ).toBe("before_start");
  });

  it("treats invalid reminder times as active to avoid blocking UX", () => {
    const group = createGroup({
      reminderStartTime: "invalid",
      reminderEndTime: "still invalid",
      habitIds: [],
    });

    const result = buildHabitGroupMetrics(group, [], new Date(2026, 4, 5, 12, 0));
    expect(result.sessionPhase).toBe("active");
  });

  it("respects weekly group frequency", () => {
    const todayTuesday = new Date(2026, 4, 5, 9, 0);
    const group = createGroup({
      frequency: "weekly",
      weeklyWeekday: 1,
      habitIds: ["habit-1"],
    });
    const habits: HabitWithMetrics[] = [createHabitWithMetrics({ id: "habit-1" })];

    const result = buildHabitGroupMetrics(group, habits, todayTuesday);

    expect(result.isScheduledToday).toBe(false);
    expect(result.scheduledHabitsCount).toBe(0);
  });
});
