import { createHabit } from "@/test/fixtures/habits";
import { isHabitCompletedForDate, isHabitScheduledOnDate } from "../schedule";

const mockHasLoggedValueOnDateKey = jest.fn();
const mockIsHabitCompletedOnDateKey = jest.fn();

jest.mock("../completions", () => ({
  hasLoggedValueOnDateKey: (...args: Parameters<typeof mockHasLoggedValueOnDateKey>) =>
    mockHasLoggedValueOnDateKey(...args),
  isHabitCompletedOnDateKey: (...args: Parameters<typeof mockIsHabitCompletedOnDateKey>) =>
    mockIsHabitCompletedOnDateKey(...args),
}));

describe("habit schedule model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks daily habits as scheduled for any date", () => {
    const habit = createHabit("habit-1", { frequency: "daily" });
    expect(isHabitScheduledOnDate(habit, new Date(2026, 4, 6))).toBe(true);
  });

  it("schedules weekly habits only on selected weekday", () => {
    const mondayHabit = createHabit("habit-1", { frequency: "weekly", weeklyWeekday: 1 });

    expect(isHabitScheduledOnDate(mondayHabit, new Date(2026, 4, 4))).toBe(true);
    expect(isHabitScheduledOnDate(mondayHabit, new Date(2026, 4, 5))).toBe(false);
  });

  it("normalizes custom weekdays and checks schedule membership", () => {
    const customHabit = createHabit("habit-1", {
      frequency: "custom",
      customWeekdays: [5, 1, 5, 3],
    });

    expect(isHabitScheduledOnDate(customHabit, new Date(2026, 4, 4))).toBe(true);
    expect(isHabitScheduledOnDate(customHabit, new Date(2026, 4, 7))).toBe(false);
  });

  it("uses strict completion check for day goals", () => {
    const habit = createHabit("habit-1", {
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
    });
    mockIsHabitCompletedOnDateKey.mockReturnValue(true);

    const result = isHabitCompletedForDate(habit, new Date(2026, 4, 6));

    expect(result).toBe(true);
    expect(mockIsHabitCompletedOnDateKey).toHaveBeenCalledWith(habit, "2026-05-06");
    expect(mockHasLoggedValueOnDateKey).not.toHaveBeenCalled();
  });

  it("uses logged value presence for week/month goals", () => {
    const habit = createHabit("habit-1", {
      goal: {
        metric: "value",
        period: "week",
        target: 3,
        unit: "cups",
      },
    });
    mockHasLoggedValueOnDateKey.mockReturnValue(false);

    const result = isHabitCompletedForDate(habit, new Date(2026, 4, 6));

    expect(result).toBe(false);
    expect(mockHasLoggedValueOnDateKey).toHaveBeenCalledWith(habit, "2026-05-06");
    expect(mockIsHabitCompletedOnDateKey).not.toHaveBeenCalled();
  });
});
