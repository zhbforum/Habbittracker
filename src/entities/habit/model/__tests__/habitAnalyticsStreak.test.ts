import type { Habit } from "../types";

import { buildBestStreak, buildCurrentStreak } from "../habitAnalyticsStreak";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Read",
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "reading",
    iconColorId: "emerald",
    createdAt: "2026-05-01T00:00:00",
    updatedAt: "2026-05-01T00:00:00",
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
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
  };
}

describe("habit streak analytics", () => {
  it("skips incomplete today and continues streak from previous scheduled days", () => {
    const habit = createHabit({
      completions: {
        "2026-05-04": { completedAt: "2026-05-04T08:00:00.000Z", value: 1 },
        "2026-05-05": { completedAt: "2026-05-05T08:00:00.000Z", value: 1 },
      },
    });

    const currentStreak = buildCurrentStreak(habit, new Date(2026, 4, 6));
    expect(currentStreak).toBe(2);
  });

  it("computes best streak with resets on missed scheduled days", () => {
    const habit = createHabit({
      completions: {
        "2026-05-01": { completedAt: "2026-05-01T08:00:00.000Z", value: 1 },
        "2026-05-02": { completedAt: "2026-05-02T08:00:00.000Z", value: 1 },
        "2026-05-04": { completedAt: "2026-05-04T08:00:00.000Z", value: 1 },
        "2026-05-05": { completedAt: "2026-05-05T08:00:00.000Z", value: 1 },
        "2026-05-06": { completedAt: "2026-05-06T08:00:00.000Z", value: 1 },
      },
    });

    const bestStreak = buildBestStreak(habit, new Date(2026, 4, 6));
    expect(bestStreak).toBe(3);
  });

  it("does not break streak on unscheduled days for weekly habits", () => {
    const habit = createHabit({
      frequency: "weekly",
      weeklyWeekday: 1,
      createdAt: "2026-04-20T00:00:00",
      completions: {
        "2026-04-27": { completedAt: "2026-04-27T08:00:00.000Z", value: 1 },
        "2026-05-04": { completedAt: "2026-05-04T08:00:00.000Z", value: 1 },
      },
    });

    const bestStreak = buildBestStreak(habit, new Date(2026, 4, 11));
    expect(bestStreak).toBe(2);
  });
});
