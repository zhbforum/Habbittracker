import {
  createDefaultHabitGroupFormValues,
  DEFAULT_HABIT_GROUP_FORM_VALUES,
} from "../../model/constants";
import { addDays, toDateKey } from "../../model/date";
import { mapRawToHabitGroup } from "../habitGroupStorageMapper";

describe("habitGroupStorageMapper", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-01T09:30:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null for non-object values or missing id", () => {
    expect(mapRawToHabitGroup(null, "fallback-user")).toBeNull();
    expect(mapRawToHabitGroup({}, "fallback-user")).toBeNull();
    expect(mapRawToHabitGroup({ id: "   " }, "fallback-user")).toBeNull();
  });

  it("maps raw group with normalization and field fallbacks", () => {
    const result = mapRawToHabitGroup(
      {
        id: " group-1 ",
        userId: "   ",
        name: "  Morning   Focus ",
        description: "  Build  routine  ",
        iconId: "unknown",
        frequency: "invalid",
        weeklyWeekday: 8,
        customWeekdays: [5, -1, 5, "oops"],
        startDate: "invalid-date",
        endDate: "2026-05-11",
        reminderStartTime: "7:5",
        reminderEndTime: "23:30",
        dailyGoal: 10,
        habitIds: [" habit-1 ", "habit-2", "", "habit-1", 42],
        createdAt: "2026-05-10T12:00:00.000Z",
        updatedAt: "   ",
      },
      "fallback-user",
    );

    expect(result).toEqual({
      id: "group-1",
      userId: "fallback-user",
      name: "Morning   Focus",
      description: "Build  routine",
      iconId: DEFAULT_HABIT_GROUP_FORM_VALUES.iconId,
      frequency: DEFAULT_HABIT_GROUP_FORM_VALUES.frequency,
      weeklyWeekday: 1,
      customWeekdays: [5, 6],
      startDate: "2026-05-10",
      endDate: "2026-05-11",
      reminderStartTime: DEFAULT_HABIT_GROUP_FORM_VALUES.reminderStartTime,
      reminderEndTime: "23:30",
      dailyGoal: 2,
      habitIds: ["habit-1", "habit-2"],
      createdAt: "2026-05-10T12:00:00.000Z",
      updatedAt: "2026-06-01T09:30:00.000Z",
    });
  });

  it("falls back to current date defaults for invalid createdAt and empty optional fields", () => {
    const now = new Date("2026-06-01T09:30:00.000Z");
    const defaultDates = createDefaultHabitGroupFormValues(now);
    const expectedEndDate = toDateKey(addDays(now, 30));

    const result = mapRawToHabitGroup(
      {
        id: "group-2",
        customWeekdays: [],
        habitIds: "invalid-array",
        reminderStartTime: "",
        reminderEndTime: "",
        dailyGoal: "NaN",
        createdAt: "not-a-date",
      },
      "fallback-user",
    );

    expect(result).toEqual({
      id: "group-2",
      userId: "fallback-user",
      name: "Untitled group",
      description: "",
      iconId: DEFAULT_HABIT_GROUP_FORM_VALUES.iconId,
      frequency: DEFAULT_HABIT_GROUP_FORM_VALUES.frequency,
      weeklyWeekday: DEFAULT_HABIT_GROUP_FORM_VALUES.weeklyWeekday,
      customWeekdays: DEFAULT_HABIT_GROUP_FORM_VALUES.customWeekdays,
      startDate: defaultDates.startDate || toDateKey(now),
      endDate: defaultDates.endDate || expectedEndDate,
      reminderStartTime: DEFAULT_HABIT_GROUP_FORM_VALUES.reminderStartTime,
      reminderEndTime: DEFAULT_HABIT_GROUP_FORM_VALUES.reminderEndTime,
      dailyGoal: DEFAULT_HABIT_GROUP_FORM_VALUES.dailyGoal,
      habitIds: [],
      createdAt: "not-a-date",
      updatedAt: "2026-06-01T09:30:00.000Z",
    });
  });
});
