import { DEFAULT_HABIT_FORM_VALUES } from "../constants";
import type { Habit } from "../types";
import {
  mapHabitStorageDtoToHabit,
  mapHabitToPersistenceDto,
  normalizeHabitFormValues,
} from "../mappers";

describe("habit mappers", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("normalizes form values and falls back to defaults for invalid enum-like fields", () => {
    const normalized = normalizeHabitFormValues({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "  Read   books  ",
      kind: "unknown" as never,
      frequency: "other" as never,
      reminderTime: "invalid",
      iconId: "invalid" as never,
      iconColorId: "invalid" as never,
      weeklyWeekday: -1 as never,
      customWeekdays: [1, 8, -1, 1] as never,
      goalMetric: "value",
      goalPeriod: "month",
      goalTarget: 2.4,
      goalUnit: "  ml  ",
    });

    expect(normalized).toEqual({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Read books",
      kind: DEFAULT_HABIT_FORM_VALUES.kind,
      frequency: DEFAULT_HABIT_FORM_VALUES.frequency,
      reminderTime: DEFAULT_HABIT_FORM_VALUES.reminderTime,
      iconId: DEFAULT_HABIT_FORM_VALUES.iconId,
      iconColorId: DEFAULT_HABIT_FORM_VALUES.iconColorId,
      weeklyWeekday: 6,
      customWeekdays: [1, 6],
      goalMetric: "value",
      goalPeriod: "month",
      goalTarget: 2,
      goalUnit: "ml",
    });
  });

  it("returns null when storage dto is not an object or has no valid id", () => {
    expect(mapHabitStorageDtoToHabit(null, "fallback-user")).toBeNull();
    expect(mapHabitStorageDtoToHabit({}, "fallback-user")).toBeNull();
    expect(mapHabitStorageDtoToHabit({ id: "   " }, "fallback-user")).toBeNull();
  });

  it("maps storage dto into normalized habit with fallback user and parsed completions", () => {
    const habit = mapHabitStorageDtoToHabit(
      {
        id: "habit-1",
        userId: "   ",
        name: "  Drink   water ",
        kind: "positive",
        frequency: "custom",
        reminderTime: "08:05",
        iconId: "invalid",
        iconColorId: "invalid",
        weeklyWeekday: 8,
        customWeekdays: [3, 10, -1, 3, "oops"],
        createdAt: "",
        updatedAt: " ",
        goal: {
          metric: "value",
          period: "week",
          target: 2.2,
          unit: "  cups  ",
        },
        completions: {
          "2026-05-01": "2026-05-01T09:00:00.000Z",
          "2026-05-02": {
            completedAt: "2026-05-02T09:00:00.000Z",
            value: 3,
          },
          "2026-05-03": {
            completedAt: "",
            value: 1,
          },
          "2026-05-04": {
            completedAt: "2026-05-04T09:00:00.000Z",
            value: -2,
          },
        },
      },
      "fallback-user",
    );

    expect(habit).toEqual({
      id: "habit-1",
      userId: "fallback-user",
      name: "Drink water",
      kind: "positive",
      frequency: "custom",
      reminderTime: "08:05",
      iconId: DEFAULT_HABIT_FORM_VALUES.iconId,
      iconColorId: DEFAULT_HABIT_FORM_VALUES.iconColorId,
      createdAt: "2026-05-10T12:00:00.000Z",
      updatedAt: "2026-05-10T12:00:00.000Z",
      weeklyWeekday: 1,
      customWeekdays: [3, 6],
      goal: {
        metric: "value",
        period: "week",
        target: 2,
        unit: "cups",
      },
      completions: {
        "2026-05-01": {
          completedAt: "2026-05-01T09:00:00.000Z",
          value: null,
        },
        "2026-05-02": {
          completedAt: "2026-05-02T09:00:00.000Z",
          value: 3,
        },
        "2026-05-04": {
          completedAt: "2026-05-04T09:00:00.000Z",
          value: 0,
        },
      },
    });
  });

  it("parses goal from legacy dto fields when nested goal is absent", () => {
    const habit = mapHabitStorageDtoToHabit(
      {
        id: "habit-2",
        name: "Focus",
        goalMetric: "value",
        goalPeriod: "month",
        goalTarget: "4",
        goalUnit: "  min ",
        customWeekdays: [],
      },
      "fallback-user",
    );

    expect(habit?.goal).toEqual({
      metric: "value",
      period: "month",
      target: 4,
      unit: "min",
    });
    expect(habit?.customWeekdays).toEqual(DEFAULT_HABIT_FORM_VALUES.customWeekdays);
  });

  it("maps habit to persistence dto without altering data", () => {
    const habit: Habit = {
      id: "habit-1",
      userId: "user-1",
      name: "Read",
      kind: "positive",
      frequency: "daily",
      reminderTime: "08:00",
      iconId: "reading",
      iconColorId: "ocean",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
      weeklyWeekday: 1,
      customWeekdays: [1, 3, 5],
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
      completions: {
        "2026-05-01": {
          completedAt: "2026-05-01T09:00:00.000Z",
          value: null,
        },
      },
    };

    const dto = mapHabitToPersistenceDto(habit);

    expect(dto).toEqual(habit);
  });
});
