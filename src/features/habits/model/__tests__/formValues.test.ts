import {
  createDefaultHabitFormValues,
  createDefaultHabitGroupEditorFormValues,
  toHabitFormValues,
  toHabitGroupFormValues,
} from "../formValues";
import type { Habit, HabitGroup } from "../types";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Drink water",
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

  return {
    ...base,
    ...overrides,
    goal: {
      ...base.goal,
      ...(overrides.goal ?? {}),
    },
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
  };
}

function createGroup(overrides: Partial<HabitGroup> = {}): HabitGroup {
  const base: HabitGroup = {
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
    habitIds: ["habit-1", "habit-2"],
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

describe("habit form values model", () => {
  it("maps habit to form values and copies weekday array", () => {
    const habit = createHabit({ customWeekdays: [1, 2, 3] });

    const formValues = toHabitFormValues(habit);

    expect(formValues).toEqual({
      name: habit.name,
      kind: habit.kind,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime,
      iconId: habit.iconId,
      iconColorId: habit.iconColorId,
      weeklyWeekday: habit.weeklyWeekday,
      customWeekdays: [1, 2, 3],
      goalMetric: habit.goal.metric,
      goalPeriod: habit.goal.period,
      goalTarget: habit.goal.target,
      goalUnit: habit.goal.unit,
    });

    formValues.customWeekdays.push(4);
    expect(habit.customWeekdays).toEqual([1, 2, 3]);
  });

  it("builds default habit form values based on today", () => {
    const formValues = createDefaultHabitFormValues(new Date(2026, 4, 6));

    expect(formValues.weeklyWeekday).toBe(3);
    expect(formValues.customWeekdays).toEqual([1, 3, 5]);
  });

  it("maps group to form values and copies mutable arrays", () => {
    const group = createGroup({
      customWeekdays: [2, 4, 6],
      habitIds: ["habit-1", "habit-3"],
    });

    const formValues = toHabitGroupFormValues(group);

    expect(formValues).toEqual({
      name: group.name,
      description: group.description,
      iconId: group.iconId,
      frequency: group.frequency,
      weeklyWeekday: group.weeklyWeekday,
      customWeekdays: [2, 4, 6],
      startDate: group.startDate,
      endDate: group.endDate,
      reminderStartTime: group.reminderStartTime,
      reminderEndTime: group.reminderEndTime,
      dailyGoal: group.dailyGoal,
      habitIds: ["habit-1", "habit-3"],
    });

    formValues.customWeekdays.push(0);
    formValues.habitIds.push("habit-4");
    expect(group.customWeekdays).toEqual([2, 4, 6]);
    expect(group.habitIds).toEqual(["habit-1", "habit-3"]);
  });

  it("creates default group editor values from today", () => {
    const values = createDefaultHabitGroupEditorFormValues(new Date(2026, 4, 6));

    expect(values.weeklyWeekday).toBe(3);
    expect(values.startDate).toBe("2026-05-06");
    expect(values.endDate).toBe("2026-06-05");
    expect(values.customWeekdays).toEqual([1, 3, 5]);
    expect(values.habitIds).toEqual([]);
  });
});
