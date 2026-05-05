import { createHabitGroupWithMetrics } from "@/test/fixtures/habits";

import {
  getGroupDateRangeLabel,
  getGroupFrequencyLabel,
  getGroupHint,
  getGroupSessionWindowLabel,
} from "../groupView";

describe("groupView", () => {
  it("builds frequency labels for daily, weekly and custom groups", () => {
    const dailyGroup = createHabitGroupWithMetrics("daily", { frequency: "daily" });
    const weeklyGroup = createHabitGroupWithMetrics("weekly", {
      frequency: "weekly",
      weeklyWeekday: 3,
    });
    const customGroup = createHabitGroupWithMetrics("custom", {
      frequency: "custom",
      customWeekdays: [1, 3, 5],
    });
    const emptyCustomGroup = createHabitGroupWithMetrics("empty-custom", {
      frequency: "custom",
      customWeekdays: [],
    });

    expect(getGroupFrequencyLabel(dailyGroup)).toBe("Daily");
    expect(getGroupFrequencyLabel(weeklyGroup)).toBe("Weekly (Wed)");
    expect(getGroupFrequencyLabel(customGroup)).toBe("Custom (Mon, Wed, Fri)");
    expect(getGroupFrequencyLabel(emptyCustomGroup)).toBe("Custom");
  });

  it("builds session window and date range labels", () => {
    const group = createHabitGroupWithMetrics("g1", {
      reminderStartTime: "07:30",
      reminderEndTime: "21:15",
      startDate: "2026-06-10",
      endDate: "2026-07-01",
    });

    expect(getGroupSessionWindowLabel(group)).toBe("7:30 AM - 9:15 PM");
    expect(getGroupDateRangeLabel(group)).toBe("2026-06-10 - 2026-07-01");
  });

  it.each([
    [
      {
        isWithinDateRange: false,
        isScheduledToday: true,
        targetCount: 2,
        isCompletedToday: false,
        remainingCount: 2,
      },
      "Outside active date range",
    ],
    [
      {
        isWithinDateRange: true,
        isScheduledToday: false,
        targetCount: 2,
        isCompletedToday: false,
        remainingCount: 2,
      },
      "Not scheduled for today",
    ],
    [
      {
        isWithinDateRange: true,
        isScheduledToday: true,
        targetCount: 0,
        isCompletedToday: false,
        remainingCount: 0,
      },
      "No scheduled habits inside group today",
    ],
    [
      {
        isWithinDateRange: true,
        isScheduledToday: true,
        targetCount: 2,
        isCompletedToday: true,
        remainingCount: 0,
      },
      "Daily goal reached",
    ],
    [
      {
        isWithinDateRange: true,
        isScheduledToday: true,
        targetCount: 3,
        isCompletedToday: false,
        remainingCount: 2,
      },
      "2 to goal",
    ],
  ])("returns correct hint for metrics %j", (metricsOverrides, expectedHint) => {
    const group = createHabitGroupWithMetrics("hint-group", {
      metrics: {
        ...createHabitGroupWithMetrics("base").metrics,
        ...metricsOverrides,
      },
    });

    expect(getGroupHint(group)).toBe(expectedHint);
  });
});
