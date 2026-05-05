import { createHabit } from "@/test/fixtures/habits";

import { buildHabitMetrics } from "../analytics";
import { addDays, toDateKey } from "../date";

function createCompletion(value: number | null = null) {
  return {
    completedAt: "2026-05-01T10:00:00.000Z",
    value,
  };
}

describe("buildHabitMetrics integration", () => {
  it("derives streaks, goal progress and weekly counters from real habit data", () => {
    const today = new Date(2026, 4, 6);
    const habit = createHabit("habit-integration", {
      createdAt: "2026-05-01T00:00:00.000",
      frequency: "custom",
      customWeekdays: [1, 3, 5],
      goal: {
        metric: "checkins",
        period: "week",
        target: 3,
        unit: "times",
      },
      completions: {
        "2026-05-01": createCompletion(),
        "2026-05-04": createCompletion(),
        "2026-05-06": createCompletion(),
      },
    });

    const metrics = buildHabitMetrics(habit, today);

    expect(metrics.completedToday).toBe(true);
    expect(metrics.todayLoggedValue).toBe(1);
    expect(metrics.goalProgress).toEqual({
      period: "week",
      target: 3,
      currentValue: 2,
      remainingValue: 1,
      progressPercent: 67,
      periodLabel: "This week",
    });
    expect(metrics.currentStreak).toBe(3);
    expect(metrics.bestStreak).toBe(3);
    expect(metrics.weeklyScheduledCount).toBe(3);
    expect(metrics.weeklyCompletedCount).toBe(3);
    expect(metrics.weeklyPerformance).toHaveLength(7);
    expect(metrics.weeklyPerformance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dateKey: toDateKey(today),
          scheduled: true,
          completed: true,
        }),
        expect.objectContaining({
          dateKey: toDateKey(addDays(today, -1)),
          scheduled: false,
          completed: false,
        }),
      ]),
    );
    expect(metrics.heatmap.length).toBeGreaterThan(0);
  });
});
