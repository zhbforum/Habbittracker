import type { Habit } from "../types";

import { buildHeatmap, buildWeeklyPerformance } from "../habitAnalyticsVisuals";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Hydration",
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    weeklyWeekday: 3,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "value",
      period: "day",
      target: 2,
      unit: "cups",
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
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
  };
}

describe("habit visuals analytics", () => {
  it("builds weekly performance with correct labels and schedule flags", () => {
    const habit = createHabit({
      frequency: "weekly",
      weeklyWeekday: 3,
      goal: { metric: "checkins", period: "day", target: 1, unit: "times" },
      completions: {
        "2026-05-06": { completedAt: "2026-05-06T08:00:00.000Z", value: 1 },
      },
    });
    const today = new Date(2026, 4, 6);

    const result = buildWeeklyPerformance(habit, today);

    expect(result).toHaveLength(7);
    expect(result[result.length - 1]).toEqual({
      dateKey: "2026-05-06",
      label: "W",
      dayOfMonthLabel: "6",
      scheduled: true,
      completed: true,
    });
    expect(result.some((day) => day.dateKey === "2026-05-05" && day.scheduled)).toBe(false);
  });

  it("builds heatmap with expected levels for completion and partial progress", () => {
    const habit = createHabit({
      goal: { metric: "value", period: "day", target: 2, unit: "cups" },
      completions: {
        "2026-05-04": { completedAt: "2026-05-04T08:00:00.000Z", value: 2 },
        "2026-05-05": { completedAt: "2026-05-05T08:00:00.000Z", value: 1 },
        "2026-05-06": { completedAt: "2026-05-06T08:00:00.000Z", value: 0.4 },
      },
    });
    const today = new Date(2026, 4, 6);

    const weeks = buildHeatmap(habit, today);
    const lastWeek = weeks[weeks.length - 1];

    expect(weeks).toHaveLength(53);
    expect(lastWeek.cells[0]).toEqual({
      dateKey: "2026-05-04",
      scheduled: true,
      completed: true,
      level: 3,
    });
    expect(lastWeek.cells[1]).toEqual({
      dateKey: "2026-05-05",
      scheduled: true,
      completed: false,
      level: 2,
    });
    expect(lastWeek.cells[2]).toEqual({
      dateKey: "2026-05-06",
      scheduled: true,
      completed: false,
      level: 1,
    });
    expect(lastWeek.cells[3]).toEqual({
      dateKey: "2026-05-07",
      scheduled: true,
      completed: false,
      level: 0,
    });
  });
});
