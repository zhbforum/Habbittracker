import type { HabitGroupWithMetrics } from "../types";
import {
  getGroupFrequencyLabel,
  getGroupProgressHint,
  getGroupSessionPhaseTitle,
} from "../groupPresenters";

function createGroup(
  overrides: Partial<HabitGroupWithMetrics> = {},
  metricOverrides: Partial<HabitGroupWithMetrics["metrics"]> = {},
): HabitGroupWithMetrics {
  const base: HabitGroupWithMetrics = {
    id: "group-1",
    userId: "user-1",
    name: "Morning routine",
    description: "",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    reminderStartTime: "07:00",
    reminderEndTime: "21:00",
    dailyGoal: 2,
    habitIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metrics: {
      totalHabitsCount: 3,
      scheduledHabitsCount: 2,
      completedHabitsCount: 1,
      isScheduledToday: true,
      isWithinDateRange: true,
      targetCount: 2,
      remainingCount: 1,
      progressPercent: 50,
      isCompletedToday: false,
      sessionPhase: "active",
    },
  };

  return {
    ...base,
    ...overrides,
    metrics: {
      ...base.metrics,
      ...(overrides.metrics ?? {}),
      ...metricOverrides,
    },
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
  };
}

describe("habit group presenters", () => {
  it("returns session phase titles", () => {
    expect(getGroupSessionPhaseTitle("active")).toBe("In active window");
    expect(getGroupSessionPhaseTitle("before_start")).toBe("Upcoming session");
    expect(getGroupSessionPhaseTitle("after_end")).toBe("Window closed");
  });

  it("builds frequency labels", () => {
    expect(getGroupFrequencyLabel(createGroup({ frequency: "daily" }))).toBe("Daily");
    expect(
      getGroupFrequencyLabel(createGroup({ frequency: "weekly", weeklyWeekday: 4 })),
    ).toBe("Weekly on Thu");
    expect(
      getGroupFrequencyLabel(createGroup({ frequency: "custom", customWeekdays: [1, 3, 5] })),
    ).toBe("Custom: Mon, Wed, Fri");
  });

  it("returns progress hints based on group metrics state", () => {
    expect(getGroupProgressHint(createGroup({}, { isWithinDateRange: false }))).toBe(
      "Group is outside date range.",
    );
    expect(getGroupProgressHint(createGroup({}, { isScheduledToday: false }))).toBe(
      "Group is not scheduled for today's frequency.",
    );
    expect(getGroupProgressHint(createGroup({}, { targetCount: 0 }))).toBe(
      "No scheduled habits today.",
    );
    expect(getGroupProgressHint(createGroup({}, { isCompletedToday: true }))).toBe(
      "Goal achieved.",
    );
    expect(getGroupProgressHint(createGroup({}, { remainingCount: 2, isCompletedToday: false }))).toBe(
      "2 to go",
    );
  });
});
