import { createHabit, createHabitGroup } from "@/test/fixtures/habits";

import { buildPeriodSummary } from "../calendarSummary";

function createCompletion(value: number | null = null) {
  return {
    completedAt: "2026-05-01T10:00:00.000Z",
    value,
  };
}

describe("buildPeriodSummary integration", () => {
  it("aggregates period metrics using real day builders, schedule logic and group completion rules", () => {
    const habits = [
      createHabit("habit-daily", {
        createdAt: "2026-05-01T00:00:00.000Z",
        goal: {
          metric: "checkins",
          period: "day",
          target: 1,
          unit: "times",
        },
        completions: {
          "2026-05-04": createCompletion(),
          "2026-05-05": createCompletion(),
        },
      }),
      createHabit("habit-weekly", {
        createdAt: "2026-05-01T00:00:00.000Z",
        frequency: "weekly",
        weeklyWeekday: 3,
        goal: {
          metric: "checkins",
          period: "day",
          target: 1,
          unit: "times",
        },
        completions: {
          "2026-05-06": createCompletion(),
        },
      }),
    ];
    const groups = [
      createHabitGroup("group-1", {
        frequency: "daily",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        dailyGoal: 1,
        habitIds: ["habit-daily", "habit-weekly"],
      }),
    ];

    const summary = buildPeriodSummary({
      habits,
      groups,
      periodStartDate: new Date(2026, 4, 4),
      periodEndDate: new Date(2026, 4, 6),
    });

    expect(summary).toEqual({
      completionRatePercent: 75,
      activeDaysCount: 3,
      bestStreak: 2,
      groupWinsCount: 3,
      perfectDaysCount: 2,
      strongestWeekdayLabel: "Mon",
      strongestWeekdayRatePercent: 100,
      totalLoggedValue: 3,
      averageDailyLoggedValue: 1,
    });
  });
});
