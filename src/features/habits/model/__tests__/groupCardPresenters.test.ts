import type { HabitGroupWithMetrics } from "../types";
import {
  getCompactGroupFrequencyLabel,
  getGroupSummaryProgressHint,
  getGroupSummarySessionPhaseLabel,
} from "../groupCardPresenters";

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

describe("habit group card presenters", () => {
  it("returns compact session phase labels with tone", () => {
    expect(getGroupSummarySessionPhaseLabel("active")).toEqual({
      label: "In window",
      tone: "success",
    });
    expect(getGroupSummarySessionPhaseLabel("before_start")).toEqual({
      label: "Upcoming",
      tone: "neutral",
    });
    expect(getGroupSummarySessionPhaseLabel("after_end")).toEqual({
      label: "Window ended",
      tone: "neutral",
    });
  });

  it("builds compact frequency labels", () => {
    expect(getCompactGroupFrequencyLabel(createGroup({ frequency: "daily" }))).toBe("Daily");
    expect(
      getCompactGroupFrequencyLabel(createGroup({ frequency: "weekly", weeklyWeekday: 4 })),
    ).toBe("Weekly (Thu)");
    expect(
      getCompactGroupFrequencyLabel(
        createGroup({ frequency: "custom", customWeekdays: [1, 3, 5] }),
      ),
    ).toBe("Custom (Mon, Wed, Fri)");
  });

  it("returns summary progress hints by completion state", () => {
    expect(getGroupSummaryProgressHint(createGroup({}, { isWithinDateRange: false }))).toBe(
      "Group is outside active date range.",
    );
    expect(getGroupSummaryProgressHint(createGroup({}, { isScheduledToday: false }))).toBe(
      "Group is not scheduled for today.",
    );
    expect(getGroupSummaryProgressHint(createGroup({}, { targetCount: 0 }))).toBe(
      "No scheduled habits in this group today.",
    );
    expect(getGroupSummaryProgressHint(createGroup({}, { isCompletedToday: true }))).toBe(
      "Daily goal reached for this group.",
    );
    expect(
      getGroupSummaryProgressHint(
        createGroup({}, { remainingCount: 2, isCompletedToday: false }),
      ),
    ).toBe("2 more to reach today's goal.");
  });
});
