import { DEFAULT_HABIT_FORM_VALUES } from "../../model/constants";
import type { HabitFormValues } from "../../model/types";
import { createHabit } from "@/test/fixtures/habits";
import {
  applyHabitCompletionToggle,
  applyHabitFormUpdate,
  applyHabitProgressUpdate,
  buildHabitFromFormValues,
} from "../habitStorageMutations";

describe("habitStorageMutations", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-15T12:34:56.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("builds a habit from form values with normalized fields", () => {
    const values: HabitFormValues = {
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "  Drink   water  ",
      frequency: "custom",
      customWeekdays: [],
      goalMetric: "value",
      goalPeriod: "week",
      goalTarget: 2.4,
      goalUnit: "  cups ",
    };

    const created = buildHabitFromFormValues({
      habitId: "habit-2",
      userId: "user-2",
      values,
      createdAtIso: "2026-05-10T00:00:00.000Z",
    });

    expect(created).toEqual({
      id: "habit-2",
      userId: "user-2",
      name: "Drink water",
      kind: "positive",
      frequency: "custom",
      reminderTime: "20:00",
      iconId: "water",
      iconColorId: "emerald",
      createdAt: "2026-05-10T00:00:00.000Z",
      updatedAt: "2026-05-10T00:00:00.000Z",
      weeklyWeekday: 1,
      customWeekdays: DEFAULT_HABIT_FORM_VALUES.customWeekdays,
      goal: {
        metric: "value",
        period: "week",
        target: 2,
        unit: "cups",
      },
      completions: {},
    });
  });

  it("keeps normalized custom weekdays when form provides them", () => {
    const values: HabitFormValues = {
      ...DEFAULT_HABIT_FORM_VALUES,
      frequency: "custom",
      customWeekdays: [5, 1, 5, -1] as unknown as HabitFormValues["customWeekdays"],
    };
    const habit = createHabit("habit-1");

    const built = buildHabitFromFormValues({
      habitId: "habit-3",
      userId: "user-3",
      values,
      createdAtIso: "2026-05-10T00:00:00.000Z",
    });
    const updated = applyHabitFormUpdate(habit, values);

    expect(built.customWeekdays).toEqual([1, 5, 6]);
    expect(updated.customWeekdays).toEqual([1, 5, 6]);
  });

  it("applies form update and refreshes updatedAt", () => {
    const habit = createHabit("habit-1", {
      name: "Old name",
      customWeekdays: [2, 4],
    });
    const values: HabitFormValues = {
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "  New   name ",
      kind: "negative",
      frequency: "weekly",
      weeklyWeekday: 5,
      customWeekdays: [],
      reminderTime: "09:45",
      iconId: "walk",
      iconColorId: "red",
      goalMetric: "value",
      goalPeriod: "month",
      goalTarget: 4.8,
      goalUnit: "  km ",
    };

    const updated = applyHabitFormUpdate(habit, values);

    expect(updated).toEqual({
      ...habit,
      name: "New name",
      kind: "negative",
      frequency: "weekly",
      reminderTime: "09:45",
      iconId: "walk",
      iconColorId: "red",
      weeklyWeekday: 5,
      customWeekdays: DEFAULT_HABIT_FORM_VALUES.customWeekdays,
      goal: {
        metric: "value",
        period: "month",
        target: 5,
        unit: "km",
      },
      updatedAt: "2026-05-15T12:34:56.000Z",
    });
  });

  it("toggles completion on and off for checkin habits", () => {
    const habit = createHabit("habit-1");

    const toggledOn = applyHabitCompletionToggle(habit, "2026-05-15");
    expect(toggledOn.completions["2026-05-15"]).toEqual({
      completedAt: "2026-05-15T12:34:56.000Z",
      value: 1,
    });
    expect(toggledOn.updatedAt).toBe("2026-05-15T12:34:56.000Z");

    const toggledOff = applyHabitCompletionToggle(toggledOn, "2026-05-15");
    expect(toggledOff.completions["2026-05-15"]).toBeUndefined();
    expect(toggledOff.updatedAt).toBe("2026-05-15T12:34:56.000Z");
  });

  it("uses goal target as default completion value for value-based habits", () => {
    const habit = createHabit("habit-1", {
      goal: {
        metric: "value",
        period: "day",
        target: 3,
        unit: "liters",
      },
    });

    const toggled = applyHabitCompletionToggle(habit, "2026-05-15");

    expect(toggled.completions["2026-05-15"]).toEqual({
      completedAt: "2026-05-15T12:34:56.000Z",
      value: 3,
    });
  });

  it("normalizes progress value for checkins and value metrics", () => {
    const checkinsHabit = createHabit("habit-1", {
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
    });
    const updatedCheckins = applyHabitProgressUpdate(checkinsHabit, "2026-05-15", 2.6);
    expect(updatedCheckins.completions["2026-05-15"]?.value).toBe(3);

    const valueHabit = createHabit("habit-1", {
      goal: {
        metric: "value",
        period: "day",
        target: 10,
        unit: "ml",
      },
    });
    const updatedValue = applyHabitProgressUpdate(valueHabit, "2026-05-15", 2.345);
    expect(updatedValue.completions["2026-05-15"]?.value).toBe(2.35);
  });

  it("removes progress entry when value is non-positive or not finite", () => {
    const habit = createHabit("habit-1", {
      completions: {
        "2026-05-15": {
          completedAt: "2026-05-15T08:00:00.000Z",
          value: 3,
        },
      },
    });

    const removedByZero = applyHabitProgressUpdate(habit, "2026-05-15", 0);
    expect(removedByZero.completions["2026-05-15"]).toBeUndefined();

    const removedByNaN = applyHabitProgressUpdate(habit, "2026-05-15", Number.NaN);
    expect(removedByNaN.completions["2026-05-15"]).toBeUndefined();

    const untouchedWithoutEntry = applyHabitProgressUpdate(createHabit("habit-1"), "2026-05-15", -1);
    expect(untouchedWithoutEntry.completions).toEqual({});
  });
});
