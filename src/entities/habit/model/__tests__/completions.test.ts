import type { Habit } from "../types";
import {
  getCompletionValue,
  isHabitCompletedOnDateKey,
  normalizeCompletionEntry,
  normalizeHabitGoal,
  resolveGoalProgressRange,
  sumCompletionValuesInRange,
} from "../completions";
import { toDateKey } from "../date";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Drink water",
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
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

describe("habit completions model", () => {
  it("normalizes goal with safe defaults and clamps target", () => {
    expect(normalizeHabitGoal(null)).toEqual({
      metric: "checkins",
      period: "day",
      target: 1,
      unit: "times",
    });

    expect(
      normalizeHabitGoal({
        metric: "value",
        period: "week",
        target: 100_000,
        unit: "   ",
      }),
    ).toEqual({
      metric: "value",
      period: "week",
      target: 10_000,
      unit: "units",
    });
  });

  it("normalizes completion entries from raw values", () => {
    expect(normalizeCompletionEntry("2026-05-04T08:00:00.000Z")).toEqual({
      completedAt: "2026-05-04T08:00:00.000Z",
      value: null,
    });

    expect(
      normalizeCompletionEntry({
        completedAt: "2026-05-04T08:00:00.000Z",
        value: -5,
      }),
    ).toEqual({
      completedAt: "2026-05-04T08:00:00.000Z",
      value: 0,
    });

    expect(normalizeCompletionEntry({ completedAt: "", value: 1 })).toBeNull();
  });

  it("uses value=1 as fallback when entry exists without numeric value", () => {
    const habit = createHabit({
      completions: {
        "2026-05-04": {
          completedAt: "2026-05-04T08:00:00.000Z",
          value: null,
        },
      },
    });

    expect(getCompletionValue(habit, "2026-05-04")).toBe(1);
    expect(getCompletionValue(habit, "2026-05-05")).toBe(0);
  });

  it("checks completion based on goal metric", () => {
    const dateKey = "2026-05-04";

    const checkinsHabit = createHabit({
      goal: { metric: "checkins", period: "day", target: 1, unit: "times" },
      completions: {
        [dateKey]: { completedAt: "2026-05-04T08:00:00.000Z", value: 1 },
      },
    });
    expect(isHabitCompletedOnDateKey(checkinsHabit, dateKey)).toBe(true);

    const valueHabit = createHabit({
      goal: { metric: "value", period: "day", target: 3, unit: "cups" },
      completions: {
        [dateKey]: { completedAt: "2026-05-04T08:00:00.000Z", value: 2 },
      },
    });
    expect(isHabitCompletedOnDateKey(valueHabit, dateKey)).toBe(false);
  });

  it("resolves weekly range boundaries from monday to sunday", () => {
    const result = resolveGoalProgressRange("week", new Date(2026, 4, 6));

    expect(result.periodLabel).toBe("This week");
    expect(toDateKey(result.startDate)).toBe("2026-05-04");
    expect(toDateKey(result.endDate)).toBe("2026-05-10");
  });

  it("sums completion values in date range and respects scheduling filter", () => {
    const habit = createHabit({
      completions: {
        "2026-05-04": { completedAt: "2026-05-04T08:00:00.000Z", value: 2 },
        "2026-05-05": { completedAt: "2026-05-05T08:00:00.000Z", value: 3 },
        "2026-05-06": { completedAt: "2026-05-06T08:00:00.000Z", value: 4 },
      },
    });

    const total = sumCompletionValuesInRange({
      habit,
      startDate: new Date(2026, 4, 4),
      endDate: new Date(2026, 4, 6),
      onlyScheduled: (targetDate) => targetDate.getDay() !== 2,
    });

    expect(total).toBe(6);
  });
});
