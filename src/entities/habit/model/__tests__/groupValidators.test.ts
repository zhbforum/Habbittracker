import {
  HABIT_GROUP_DESCRIPTION_MAX_LENGTH,
  HABIT_GROUP_NAME_MAX_LENGTH,
} from "../constants";
import type { HabitGroupFormValues } from "../types";
import {
  clampGroupDailyGoal,
  normalizeHabitGroupFormValues,
  sanitizeHabitGroupDescription,
  sanitizeHabitGroupName,
  validateHabitGroupForm,
} from "../groupValidators";

function createValidValues(overrides: Partial<HabitGroupFormValues> = {}): HabitGroupFormValues {
  return {
    name: "Morning reset",
    description: "Start the day well",
    iconId: "focus",
    frequency: "daily",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    reminderStartTime: "07:30",
    reminderEndTime: "21:15",
    dailyGoal: 1,
    habitIds: ["habit-1"],
    ...overrides,
  };
}

describe("habit group validators", () => {
  it("sanitizes group name and description", () => {
    expect(sanitizeHabitGroupName("  Morning   reset  ")).toBe("Morning reset");
    expect(sanitizeHabitGroupDescription("  Keep   it   simple  ")).toBe("Keep it simple");
  });

  it("clamps daily goal by selected habits and minimum value", () => {
    expect(clampGroupDailyGoal(Number.NaN, 2)).toBe(1);
    expect(clampGroupDailyGoal(5.7, 3)).toBe(3);
    expect(clampGroupDailyGoal(0, 0)).toBe(1);
  });

  it("normalizes form values with deduplication and safe fallbacks", () => {
    const normalized = normalizeHabitGroupFormValues(
      createValidValues({
        name: "  Morning   reset ",
        description: "  Keep   it   simple ",
        iconId: "invalid-icon" as HabitGroupFormValues["iconId"],
        customWeekdays: [5, 1, 5, 3, 1],
        startDate: " 2026-05-01 ",
        endDate: " 2026-05-31 ",
        reminderStartTime: "bad",
        reminderEndTime: "9:05",
        dailyGoal: 10,
        habitIds: [" habit-1 ", "habit-2", "habit-1", ""],
      }),
    );

    expect(normalized.name).toBe("Morning reset");
    expect(normalized.description).toBe("Keep it simple");
    expect(normalized.iconId).toBe("focus");
    expect(normalized.customWeekdays).toEqual([1, 3, 5]);
    expect(normalized.startDate).toBe("2026-05-01");
    expect(normalized.endDate).toBe("2026-05-31");
    expect(normalized.reminderStartTime).toBe("07:00");
    expect(normalized.reminderEndTime).toBe("09:05");
    expect(normalized.habitIds).toEqual(["habit-1", "habit-2"]);
    expect(normalized.dailyGoal).toBe(2);
  });

  it("returns null for valid form", () => {
    expect(validateHabitGroupForm(createValidValues())).toBeNull();
  });

  it("validates required fields and boundaries", () => {
    expect(
      validateHabitGroupForm(
        createValidValues({
          name: "   ",
        }),
      ),
    ).toBe("Group name is required.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          name: "A",
        }),
      ),
    ).toBe("Group name should have at least 2 characters.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          name: "A".repeat(HABIT_GROUP_NAME_MAX_LENGTH + 1),
        }),
      ),
    ).toBe(`Group name should be shorter than ${HABIT_GROUP_NAME_MAX_LENGTH} characters.`);

    expect(
      validateHabitGroupForm(
        createValidValues({
          description: "A".repeat(HABIT_GROUP_DESCRIPTION_MAX_LENGTH + 1),
        }),
      ),
    ).toBe(`Description should be shorter than ${HABIT_GROUP_DESCRIPTION_MAX_LENGTH} characters.`);
  });

  it("validates time and date constraints", () => {
    expect(
      validateHabitGroupForm(
        createValidValues({
          reminderStartTime: "25:00",
        }),
      ),
    ).toBe("Start and end reminder times should be in HH:mm format.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          startDate: "2026/05/01",
          endDate: "2026-05-31",
        }),
      ),
    ).toBe("Start and end dates should be in YYYY-MM-DD format.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          startDate: "2026-05-31",
          endDate: "2026-05-01",
        }),
      ),
    ).toBe("End date should be the same or later than start date.");
  });

  it("validates frequency, selected habits, and daily goal", () => {
    expect(
      validateHabitGroupForm(
        createValidValues({
          frequency: "custom",
          customWeekdays: [],
        }),
      ),
    ).toBe("Select at least one day for custom frequency.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          habitIds: [],
        }),
      ),
    ).toBe("Select at least one habit for this group.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          dailyGoal: 0,
        }),
      ),
    ).toBe("Daily goal should be at least 1.");

    expect(
      validateHabitGroupForm(
        createValidValues({
          dailyGoal: 3,
          habitIds: ["habit-1", "habit-2"],
        }),
      ),
    ).toBe("Daily goal should not exceed selected habits count.");
  });
});
