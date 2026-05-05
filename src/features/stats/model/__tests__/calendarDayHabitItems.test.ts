import type { Habit } from "@entities/habit/model/types";

import { buildDayHabitItems } from "../calendarDayHabitItems";

const mockIsHabitScheduledOnDate = jest.fn();
const mockIsHabitCompletedForDate = jest.fn();
const mockGetCompletionValue = jest.fn();
const mockResolveGoalProgressRange = jest.fn();
const mockSumCompletionValuesInRange = jest.fn();

jest.mock("@entities/habit/model/analytics", () => ({
  isHabitScheduledOnDate: (...args: Parameters<typeof mockIsHabitScheduledOnDate>) =>
    mockIsHabitScheduledOnDate(...args),
  isHabitCompletedForDate: (...args: Parameters<typeof mockIsHabitCompletedForDate>) =>
    mockIsHabitCompletedForDate(...args),
}));

jest.mock("@entities/habit/model/completions", () => ({
  getCompletionValue: (...args: Parameters<typeof mockGetCompletionValue>) =>
    mockGetCompletionValue(...args),
  resolveGoalProgressRange: (...args: Parameters<typeof mockResolveGoalProgressRange>) =>
    mockResolveGoalProgressRange(...args),
  sumCompletionValuesInRange: (...args: Parameters<typeof mockSumCompletionValuesInRange>) =>
    mockSumCompletionValuesInRange(...args),
}));

function createHabit(id: string, name: string, overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id,
    userId: "user-1",
    name,
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
      metric: "value",
      period: "day",
      target: 2,
      unit: "cups",
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
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
    completions: {
      ...base.completions,
      ...(overrides.completions ?? {}),
    },
  };
}

describe("buildDayHabitItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds sorted items with counts, totals, and progress", () => {
    const date = new Date(2026, 4, 6);
    const dateKey = "2026-05-06";

    const habitDone = createHabit("h1", "Alpha", {
      goal: { metric: "value", period: "day", target: 2, unit: "cups" },
    });
    const habitUnscheduledLogged = createHabit("h2", "Charlie", {
      goal: { metric: "value", period: "day", target: 4, unit: "cups" },
    });
    const habitScheduledPending = createHabit("h3", "Bravo", {
      goal: { metric: "value", period: "week", target: 8, unit: "cups" },
    });
    const habitHidden = createHabit("h4", "Delta");

    const habits = [habitDone, habitUnscheduledLogged, habitScheduledPending, habitHidden];

    mockIsHabitScheduledOnDate.mockImplementation((habit: Habit) =>
      ["h1", "h3"].includes(habit.id),
    );
    mockIsHabitCompletedForDate.mockImplementation((habit: Habit) => habit.id === "h1");
    mockGetCompletionValue.mockImplementation((habit: Habit) => {
      if (habit.id === "h1") {
        return 10;
      }

      if (habit.id === "h2") {
        return 1;
      }

      if (habit.id === "h3") {
        return 3;
      }

      return 0;
    });
    mockResolveGoalProgressRange.mockReturnValue({
      startDate: new Date(2026, 4, 4),
      endDate: new Date(2026, 4, 10),
      periodLabel: "This week",
    });
    mockSumCompletionValuesInRange.mockReturnValue(6);

    const result = buildDayHabitItems(habits, date, dateKey);

    expect(result.scheduledCount).toBe(2);
    expect(result.completedCount).toBe(1);
    expect(result.totalLoggedValue).toBe(14);
    expect(result.items.map((item) => item.id)).toEqual(["h1", "h3", "h2"]);
    expect(result.items.map((item) => item.goalProgressPercent)).toEqual([100, 75, 25]);

    expect(mockResolveGoalProgressRange).toHaveBeenCalledWith("week", date);
    expect(mockSumCompletionValuesInRange).toHaveBeenCalledWith(
      expect.objectContaining({
        habit: habitScheduledPending,
        startDate: new Date(2026, 4, 4),
        endDate: date,
        onlyScheduled: expect.any(Function),
      }),
    );
  });

  it("returns zero progress when target is not positive", () => {
    const date = new Date(2026, 4, 6);
    const habit = createHabit("h1", "Zero target", {
      goal: { metric: "value", period: "day", target: 0, unit: "cups" },
    });

    mockIsHabitScheduledOnDate.mockReturnValue(true);
    mockIsHabitCompletedForDate.mockReturnValue(false);
    mockGetCompletionValue.mockReturnValue(5);

    const result = buildDayHabitItems([habit], date, "2026-05-06");

    expect(result.items[0]?.goalProgressPercent).toBe(0);
    expect(mockSumCompletionValuesInRange).not.toHaveBeenCalled();
  });
});
