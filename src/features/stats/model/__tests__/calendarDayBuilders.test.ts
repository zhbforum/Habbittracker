import type { Habit, HabitGroup } from "@entities/habit/model/types";

import {
  buildDayDetails,
  buildDayDetailsRange,
  resolveIntensityLevel,
} from "../calendarDayBuilders";

const mockBuildDayHabitItems = jest.fn();
const mockBuildDayGroupItems = jest.fn();

jest.mock("../calendarDayHabitItems", () => ({
  buildDayHabitItems: (...args: Parameters<typeof mockBuildDayHabitItems>) =>
    mockBuildDayHabitItems(...args),
}));

jest.mock("../calendarDayGroupItems", () => ({
  buildDayGroupItems: (...args: Parameters<typeof mockBuildDayGroupItems>) =>
    mockBuildDayGroupItems(...args),
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

function createGroup(id: string): HabitGroup {
  return {
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
    reminderStartTime: "08:00",
    reminderEndTime: "20:00",
    dailyGoal: 1,
    habitIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("calendarDayBuilders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds day details from habit and group builders", () => {
    const habit = createHabit("h1");
    const group = createGroup("g1");
    const date = new Date(2026, 4, 6);

    mockBuildDayHabitItems.mockReturnValue({
      items: [{ id: "h1" }],
      scheduledCount: 2,
      completedCount: 1,
      totalLoggedValue: 4.5,
    });
    mockBuildDayGroupItems.mockReturnValue({
      items: [{ id: "g1" }],
      scheduledCount: 1,
      completedCount: 1,
    });

    const details = buildDayDetails([habit], [group], date);

    expect(details).toEqual({
      dateKey: "2026-05-06",
      dateLabel: "May 6, 2026",
      habits: [{ id: "h1" }],
      groups: [{ id: "g1" }],
      scheduledHabitsCount: 2,
      completedHabitsCount: 1,
      scheduledGroupsCount: 1,
      completedGroupsCount: 1,
      totalLoggedValue: 4.5,
    });
    expect(mockBuildDayHabitItems).toHaveBeenCalledWith([habit], date, "2026-05-06");
    expect(mockBuildDayGroupItems).toHaveBeenCalledWith([habit], [group], date, "2026-05-06");
  });

  it("resolves intensity level using completion rates", () => {
    expect(
      resolveIntensityLevel({
        dateKey: "2026-05-06",
        dateLabel: "May 6, 2026",
        habits: [],
        groups: [],
        scheduledHabitsCount: 2,
        completedHabitsCount: 0,
        scheduledGroupsCount: 1,
        completedGroupsCount: 0,
        totalLoggedValue: 0,
      }),
    ).toBe(0);

    expect(
      resolveIntensityLevel({
        dateKey: "2026-05-06",
        dateLabel: "May 6, 2026",
        habits: [],
        groups: [],
        scheduledHabitsCount: 2,
        completedHabitsCount: 2,
        scheduledGroupsCount: 0,
        completedGroupsCount: 0,
        totalLoggedValue: 0,
      }),
    ).toBe(3);

    expect(
      resolveIntensityLevel({
        dateKey: "2026-05-06",
        dateLabel: "May 6, 2026",
        habits: [],
        groups: [],
        scheduledHabitsCount: 3,
        completedHabitsCount: 2,
        scheduledGroupsCount: 0,
        completedGroupsCount: 0,
        totalLoggedValue: 0,
      }),
    ).toBe(2);

    expect(
      resolveIntensityLevel({
        dateKey: "2026-05-06",
        dateLabel: "May 6, 2026",
        habits: [],
        groups: [],
        scheduledHabitsCount: 2,
        completedHabitsCount: 1,
        scheduledGroupsCount: 0,
        completedGroupsCount: 0,
        totalLoggedValue: 0,
      }),
    ).toBe(1);
  });

  it("builds day details for a full date range", () => {
    mockBuildDayHabitItems.mockImplementation((_, __, dateKey: string) => ({
      items: [{ id: dateKey }],
      scheduledCount: 0,
      completedCount: 0,
      totalLoggedValue: 0,
    }));
    mockBuildDayGroupItems.mockReturnValue({
      items: [],
      scheduledCount: 0,
      completedCount: 0,
    });

    const details = buildDayDetailsRange({
      habits: [],
      groups: [],
      startDate: new Date(2026, 0, 1),
      days: 3,
    });

    expect(details).toHaveLength(3);
    expect(details.map((item) => item.dateKey)).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
    ]);
    expect(mockBuildDayHabitItems).toHaveBeenCalledTimes(3);
    expect(mockBuildDayGroupItems).toHaveBeenCalledTimes(3);
  });
});
