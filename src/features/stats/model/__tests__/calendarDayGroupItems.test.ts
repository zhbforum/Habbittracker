import type { Habit, HabitGroup } from "@entities/habit/model/types";

import { buildDayGroupItems } from "../calendarDayGroupItems";

const mockIsHabitScheduledOnDate = jest.fn();
const mockIsHabitCompletedForDate = jest.fn();
const mockIsDateKeyValid = jest.fn();

jest.mock("@entities/habit/model/analytics", () => ({
  isHabitScheduledOnDate: (...args: Parameters<typeof mockIsHabitScheduledOnDate>) =>
    mockIsHabitScheduledOnDate(...args),
  isHabitCompletedForDate: (...args: Parameters<typeof mockIsHabitCompletedForDate>) =>
    mockIsHabitCompletedForDate(...args),
}));

jest.mock("../calendarDate", () => ({
  isDateKeyValid: (...args: Parameters<typeof mockIsDateKeyValid>) =>
    mockIsDateKeyValid(...args),
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

function createGroup(id: string, name: string, overrides: Partial<HabitGroup> = {}): HabitGroup {
  const base: HabitGroup = {
    id,
    userId: "user-1",
    name,
    description: "",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    reminderStartTime: "07:00",
    reminderEndTime: "21:00",
    dailyGoal: 1,
    habitIds: ["h1"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    habitIds: overrides.habitIds ?? base.habitIds,
  };
}

describe("buildDayGroupItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDateKeyValid.mockImplementation((value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value),
    );
  });

  it("builds sorted groups with completion and goal counts", () => {
    const habits = [createHabit("h1"), createHabit("h2"), createHabit("h3")];
    const date = new Date(2026, 4, 6);
    const dateKey = "2026-05-06";

    const groups: HabitGroup[] = [
      createGroup("g1", "Bravo", {
        frequency: "daily",
        habitIds: ["h1", "h2"],
        dailyGoal: 2,
      }),
      createGroup("g2", "Zulu", {
        frequency: "weekly",
        weeklyWeekday: 1,
        habitIds: ["h1"],
      }),
      createGroup("g3", "Alpha", {
        frequency: "daily",
        startDate: "bad-date",
        endDate: "also-bad",
        habitIds: ["h1"],
        dailyGoal: 1,
      }),
      createGroup("g4", "Out of Range", {
        frequency: "daily",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
      }),
    ];

    mockIsHabitScheduledOnDate.mockImplementation((habit: Habit) => habit.id !== "h3");
    mockIsHabitCompletedForDate.mockImplementation((habit: Habit) => habit.id === "h1");

    const result = buildDayGroupItems(habits, groups, date, dateKey);

    expect(result.scheduledCount).toBe(2);
    expect(result.completedCount).toBe(1);
    expect(result.items.map((item) => item.id)).toEqual(["g3", "g1"]);
    expect(result.items).toEqual([
      {
        id: "g3",
        name: "Alpha",
        iconId: "focus",
        isScheduled: true,
        isCompleted: true,
        targetCount: 1,
        completedHabitsCount: 1,
      },
      {
        id: "g1",
        name: "Bravo",
        iconId: "focus",
        isScheduled: true,
        isCompleted: false,
        targetCount: 2,
        completedHabitsCount: 1,
      },
    ]);
  });

  it("handles groups with no scheduled member habits", () => {
    const habits = [createHabit("h1")];
    const groups = [
      createGroup("g1", "No scheduled members", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 3,
      }),
    ];

    mockIsHabitScheduledOnDate.mockReturnValue(false);
    mockIsHabitCompletedForDate.mockReturnValue(false);

    const result = buildDayGroupItems(habits, groups, new Date(2026, 4, 6), "2026-05-06");

    expect(result.scheduledCount).toBe(1);
    expect(result.completedCount).toBe(0);
    expect(result.items[0]?.targetCount).toBe(0);
    expect(result.items[0]?.isCompleted).toBe(false);
  });
});
