import {
  HABIT_GOAL_TARGET_MAX,
  HABIT_GOAL_TARGET_MIN,
  HABIT_GOAL_UNIT_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
  DEFAULT_HABIT_FORM_VALUES,
} from "../constants";
import {
  sanitizeHabitName,
  validateHabitForm,
  validateHabitName,
  validateReminderTime,
} from "../validators";

describe("habit validators", () => {
  it("sanitizes name by trimming and collapsing spaces", () => {
    expect(sanitizeHabitName("  Read   more   books  ")).toBe("Read more books");
  });

  it("validates habit name with useful errors", () => {
    expect(validateHabitName("   ")).toBe("Habit name is required.");
    expect(validateHabitName("A")).toBe("Habit name should have at least 2 characters.");
    expect(validateHabitName("x".repeat(HABIT_NAME_MAX_LENGTH + 1))).toBe(
      `Habit name should be shorter than ${HABIT_NAME_MAX_LENGTH} characters.`,
    );
    expect(validateHabitName("Drink water")).toBeNull();
  });

  it("validates reminder time format", () => {
    expect(validateReminderTime("")).toBeNull();
    expect(validateReminderTime("25:00")).toBe(
      "Reminder time should be in HH:mm format, for example 20:30.",
    );
    expect(validateReminderTime("8:05")).toBeNull();
  });

  it("returns custom frequency error when weekdays are empty", () => {
    const error = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Daily walk",
      frequency: "custom",
      customWeekdays: [],
    });

    expect(error).toBe("Select at least one day for custom frequency.");
  });

  it("validates numeric goal target boundaries", () => {
    const notFinite = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Hydration",
      goalTarget: Number.NaN,
    });
    const tooSmall = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Hydration",
      goalTarget: HABIT_GOAL_TARGET_MIN - 1,
    });
    const tooLarge = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Hydration",
      goalTarget: HABIT_GOAL_TARGET_MAX + 1,
    });

    expect(notFinite).toBe("Goal target should be a valid number.");
    expect(tooSmall).toBe(
      `Goal target should be between ${HABIT_GOAL_TARGET_MIN} and ${HABIT_GOAL_TARGET_MAX}.`,
    );
    expect(tooLarge).toBe(
      `Goal target should be between ${HABIT_GOAL_TARGET_MIN} and ${HABIT_GOAL_TARGET_MAX}.`,
    );
  });

  it("requires unit for value goals", () => {
    const error = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Water",
      goalMetric: "value",
      goalUnit: "   ",
    });

    expect(error).toBe("Add a unit for numeric goal (for example ml, min, or steps).");
  });

  it("validates unit max length for value goals", () => {
    const error = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Water",
      goalMetric: "value",
      goalUnit: "x".repeat(HABIT_GOAL_UNIT_MAX_LENGTH + 1),
    });

    expect(error).toBe(`Goal unit should be shorter than ${HABIT_GOAL_UNIT_MAX_LENGTH} characters.`);
  });

  it("returns null for a valid form", () => {
    const error = validateHabitForm({
      ...DEFAULT_HABIT_FORM_VALUES,
      name: "Morning stretch",
      reminderTime: "07:30",
      frequency: "custom",
      customWeekdays: [1, 3, 5],
      goalMetric: "value",
      goalTarget: 30,
      goalUnit: "min",
    });

    expect(error).toBeNull();
  });
});
