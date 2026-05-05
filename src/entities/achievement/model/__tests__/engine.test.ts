import type { Habit, HabitCompletionEntry, HabitGroup } from "@entities/habit/model/types";

import { buildAchievementSignals } from "../engine";

function createCompletion(value: number | null): HabitCompletionEntry {
  return {
    completedAt: "2026-05-01T10:00:00.000Z",
    value,
  };
}

function createHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id,
    userId: "user-1",
    name: `Habit ${id}`,
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
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

function createGroup(id: string, overrides: Partial<HabitGroup> = {}): HabitGroup {
  const base: HabitGroup = {
    id,
    userId: "user-1",
    name: `Group ${id}`,
    description: "",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    reminderStartTime: "07:00",
    reminderEndTime: "21:00",
    dailyGoal: 1,
    habitIds: [],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    habitIds: overrides.habitIds ?? base.habitIds,
  };
}

describe("buildAchievementSignals", () => {
  it("counts total completions by goal semantics for checkins vs value habits", () => {
    const checkinsHabit = createHabit("h-check", {
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
      completions: {
        "2026-05-01": createCompletion(null),
        "2026-05-02": createCompletion(0),
        "2026-05-03": createCompletion(2),
      },
    });
    const valueHabit = createHabit("h-value", {
      goal: {
        metric: "value",
        period: "week",
        target: 5,
        unit: "km",
      },
      completions: {
        "2026-05-01": createCompletion(0.4),
        "2026-05-02": createCompletion(0),
        "2026-05-03": createCompletion(1.5),
      },
    });

    const signals = buildAchievementSignals(
      [checkinsHabit, valueHabit],
      [],
      new Date("2026-05-10T12:00:00.000Z"),
    );

    expect(signals.totalHabits).toBe(2);
    expect(signals.totalCompletions).toBe(4);
  });

  it("counts distinct non-empty completion keys as active days, including invalid date-like keys", () => {
    const firstHabit = createHabit("h1", {
      completions: {
        "2026-05-01": createCompletion(null),
        "  ": createCompletion(1),
      },
    });
    const secondHabit = createHabit("h2", {
      completions: {
        "2026-05-01": createCompletion(null),
        "": createCompletion(1),
        "not-a-date": createCompletion(1),
      },
    });

    const signals = buildAchievementSignals(
      [firstHabit, secondHabit],
      [],
      new Date("2026-05-10T12:00:00.000Z"),
    );

    expect(signals.activeDays).toBe(2);
  });

  it("calculates perfect days only when every scheduled habit is completed", () => {
    const habitOne = createHabit("h1", {
      completions: {
        "2026-05-01": createCompletion(null),
        "2026-05-02": createCompletion(null),
      },
    });
    const habitTwo = createHabit("h2", {
      completions: {
        "2026-05-01": createCompletion(null),
      },
    });

    const signals = buildAchievementSignals(
      [habitOne, habitTwo],
      [],
      new Date("2026-05-10T12:00:00.000Z"),
    );

    expect(signals.perfectDays).toBe(1);
  });

  it("calculates group goal hits and best streak from real habit and group data", () => {
    const groupHabit = createHabit("h-group", {
      completions: {
        "2026-05-01": createCompletion(null),
        "2026-05-02": createCompletion(null),
        "2026-05-03": createCompletion(null),
        "2026-05-04": createCompletion(null),
        "2026-05-05": createCompletion(null),
      },
    });
    const otherHabit = createHabit("h-other", {
      completions: {
        "2026-05-06": createCompletion(null),
      },
    });
    const group = createGroup("g1", {
      habitIds: ["h-group"],
      dailyGoal: 1,
    });

    const signals = buildAchievementSignals(
      [groupHabit, otherHabit],
      [group],
      new Date("2026-05-10T12:00:00.000Z"),
    );

    expect(signals.totalGroups).toBe(1);
    expect(signals.groupGoalHits).toBe(5);
    expect(signals.bestStreak).toBe(5);
  });
});
