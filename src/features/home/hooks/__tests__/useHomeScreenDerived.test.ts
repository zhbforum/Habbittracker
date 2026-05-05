import { renderHook } from "@testing-library/react-native";

import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { toDateKey } from "@entities/habit/model/date";

import { useHomeScreenDerived } from "../useHomeScreenDerived";

function createProgressHabits(args: { total: number; completed: number; now: Date }) {
  const { total, completed, now } = args;
  const dateKey = toDateKey(now);

  return Array.from({ length: total }, (_, index) => {
    const id = `habit-${index + 1}`;

    return createHabit(id, {
      frequency: "daily",
      completions:
        index < completed
          ? {
              [dateKey]: {
                completedAt: "2026-06-01T10:00:00.000Z",
                value: 1,
              },
            }
          : {},
    });
  });
}

describe("useHomeScreenDerived", () => {
  it("builds today overview, progress and sorted groups without internal mocks", () => {
    const now = new Date(2026, 5, 1, 10, 30, 0, 0); // Monday
    const dateKey = toDateKey(now);
    const habits = [
      createHabit("h1", {
        frequency: "daily",
        completions: {
          [dateKey]: {
            completedAt: "2026-06-01T10:00:00.000Z",
            value: 1,
          },
        },
      }),
      createHabit("h2", {
        frequency: "weekly",
        weeklyWeekday: 1,
      }),
      createHabit("h3", {
        frequency: "custom",
        customWeekdays: [3],
      }),
    ];
    const groups = [
      createHabitGroup("g-active-incomplete", {
        frequency: "daily",
        habitIds: ["h1", "h2"],
        dailyGoal: 2,
        reminderStartTime: "07:00",
        reminderEndTime: "21:00",
        startDate: "2026-05-20",
        endDate: "2026-06-30",
      }),
      createHabitGroup("g-active-complete", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 1,
        reminderStartTime: "07:00",
        reminderEndTime: "21:00",
        startDate: "2026-05-20",
        endDate: "2026-06-30",
      }),
      createHabitGroup("g-before-start", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 1,
        reminderStartTime: "12:00",
        reminderEndTime: "21:00",
        startDate: "2026-05-20",
        endDate: "2026-06-30",
      }),
      createHabitGroup("g-after-end", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 1,
        reminderStartTime: "06:00",
        reminderEndTime: "09:00",
        startDate: "2026-05-20",
        endDate: "2026-06-30",
      }),
      createHabitGroup("g-unscheduled", {
        frequency: "weekly",
        weeklyWeekday: 2,
        habitIds: ["h1"],
        dailyGoal: 1,
        startDate: "2026-05-20",
        endDate: "2026-06-30",
      }),
      createHabitGroup("g-outside-range", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 1,
        startDate: "2026-07-10",
        endDate: "2026-08-10",
      }),
    ];

    const { result } = renderHook(() =>
      useHomeScreenDerived({
        habits,
        groups,
        now,
      }),
    );

    expect(result.current.todayHabits.map((habit) => habit.id)).toEqual(["h1", "h2"]);
    expect(result.current.progress).toEqual({
      completedCount: 1,
      totalCount: 2,
      percent: 50,
      message: "Great momentum. You're on track!",
    });
    expect(result.current.greeting).toBe("Good Morning");
    expect(result.current.dateLabel).toBe("Monday, Jun 1");
    expect(result.current.hasAnyGroups).toBe(true);
    expect(result.current.hasMoreGroups).toBe(true);
    expect(result.current.todayGroups.map((group) => group.id)).toEqual([
      "g-active-incomplete",
      "g-active-complete",
      "g-before-start",
    ]);
  });

  it.each([
    [0, 0, "No habits scheduled for today."],
    [3, 0, "Let's begin today's run."],
    [4, 1, "Nice start. Keep going!"],
    [4, 2, "Great momentum. You're on track!"],
    [5, 4, "Almost done. Keep the pace!"],
    [5, 5, "All done for today."],
  ])(
    "builds progress message for %i total and %i completed habits",
    (total, completed, expectedMessage) => {
      const now = new Date(2026, 5, 1, 10, 30, 0, 0);
      const habits = createProgressHabits({ total, completed, now });

      const { result } = renderHook(() =>
        useHomeScreenDerived({
          habits,
          groups: [],
          now,
        }),
      );

      expect(result.current.progress.totalCount).toBe(total);
      expect(result.current.progress.completedCount).toBe(completed);
      expect(result.current.progress.message).toBe(expectedMessage);
      expect(result.current.todayGroups).toEqual([]);
      expect(result.current.hasAnyGroups).toBe(false);
      expect(result.current.hasMoreGroups).toBe(false);
    },
  );
});
