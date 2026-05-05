import type { Habit } from "@entities/habit/model/types";
import { toDateKey } from "@entities/habit/model/date";
import type { StatsDayDetails } from "../types";
import { buildPeriodSummary } from "../calendarSummary";

const mockBuildDayDetails = jest.fn();
const mockIsHabitScheduledOnDate = jest.fn();
const mockIsHabitCompletedForDate = jest.fn();

jest.mock("../calendarDayBuilders", () => ({
  buildDayDetails: (...args: Parameters<typeof mockBuildDayDetails>) =>
    mockBuildDayDetails(...args),
}));

jest.mock("@entities/habit/model/analytics", () => ({
  isHabitScheduledOnDate: (...args: Parameters<typeof mockIsHabitScheduledOnDate>) =>
    mockIsHabitScheduledOnDate(...args),
  isHabitCompletedForDate: (...args: Parameters<typeof mockIsHabitCompletedForDate>) =>
    mockIsHabitCompletedForDate(...args),
}));

function createHabit(id: string): Habit {
  return {
    id,
    userId: "user-1",
    name: `Habit ${id}`,
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
}

function createDayDetails(overrides: Partial<StatsDayDetails>): StatsDayDetails {
  return {
    dateKey: "2026-05-04",
    dateLabel: "May 4, 2026",
    habits: [],
    groups: [],
    scheduledHabitsCount: 0,
    completedHabitsCount: 0,
    scheduledGroupsCount: 0,
    completedGroupsCount: 0,
    totalLoggedValue: 0,
    ...overrides,
  };
}

describe("buildPeriodSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds aggregate metrics for a period with activity", () => {
    const periodStartDate = new Date(2026, 4, 4);
    const periodEndDate = new Date(2026, 4, 6);
    const habits = [createHabit("habit-1")];

    mockBuildDayDetails
      .mockReturnValueOnce(
        createDayDetails({
          dateKey: "2026-05-04",
          scheduledHabitsCount: 2,
          completedHabitsCount: 1,
          scheduledGroupsCount: 1,
          completedGroupsCount: 0,
          totalLoggedValue: 1.25,
        }),
      )
      .mockReturnValueOnce(
        createDayDetails({
          dateKey: "2026-05-05",
          scheduledHabitsCount: 1,
          completedHabitsCount: 1,
          scheduledGroupsCount: 1,
          completedGroupsCount: 1,
          totalLoggedValue: 0.75,
        }),
      )
      .mockReturnValueOnce(
        createDayDetails({
          dateKey: "2026-05-06",
          scheduledHabitsCount: 1,
          completedHabitsCount: 0,
          scheduledGroupsCount: 0,
          completedGroupsCount: 0,
          totalLoggedValue: 0,
        }),
      );

    mockIsHabitScheduledOnDate.mockImplementation((_, date: Date) => {
      const dateKey = toDateKey(date);
      return ["2026-05-04", "2026-05-05", "2026-05-06"].includes(dateKey);
    });
    mockIsHabitCompletedForDate.mockImplementation((_, date: Date) => {
      const dateKey = toDateKey(date);
      return ["2026-05-04", "2026-05-05"].includes(dateKey);
    });

    const summary = buildPeriodSummary({
      habits,
      groups: [],
      periodStartDate,
      periodEndDate,
    });

    expect(summary).toEqual({
      completionRatePercent: 50,
      activeDaysCount: 2,
      bestStreak: 2,
      groupWinsCount: 1,
      perfectDaysCount: 1,
      strongestWeekdayLabel: "Tue",
      strongestWeekdayRatePercent: 100,
      totalLoggedValue: 2,
      averageDailyLoggedValue: 0.67,
    });
  });

  it("returns safe defaults when there is no scheduled data", () => {
    const periodStartDate = new Date(2026, 4, 4);
    const periodEndDate = new Date(2026, 4, 4);

    mockBuildDayDetails.mockReturnValue(
      createDayDetails({
        dateKey: "2026-05-04",
      }),
    );

    const summary = buildPeriodSummary({
      habits: [],
      groups: [],
      periodStartDate,
      periodEndDate,
    });

    expect(summary).toEqual({
      completionRatePercent: 0,
      activeDaysCount: 0,
      bestStreak: 0,
      groupWinsCount: 0,
      perfectDaysCount: 0,
      strongestWeekdayLabel: "No data",
      strongestWeekdayRatePercent: 0,
      totalLoggedValue: 0,
      averageDailyLoggedValue: 0,
    });
  });
});
