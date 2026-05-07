import {
  HABIT_GOAL_TARGET_MAX,
  HABIT_GOAL_TARGET_MIN,
  HABIT_GOAL_UNIT_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
} from "./constants";
import { normalizeTime } from "./date";
import type { HabitFormValues } from "./types";

export function sanitizeHabitName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateHabitName(value: string): string | null {
  const normalized = sanitizeHabitName(value);

  if (!normalized) {
    return "Habit name is required.";
  }

  if (normalized.length < 2) {
    return "Habit name should have at least 2 characters.";
  }

  if (normalized.length > HABIT_NAME_MAX_LENGTH) {
    return `Habit name should be shorter than ${HABIT_NAME_MAX_LENGTH} characters.`;
  }

  return null;
}

export function validateReminderTime(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  const normalized = normalizeTime(value);

  if (!normalized) {
    return "Reminder time should be in HH:mm format, for example 20:30.";
  }

  return null;
}

export function validateHabitForm(values: HabitFormValues): string | null {
  const nameError = validateHabitName(values.name);

  if (nameError) {
    return nameError;
  }

  const reminderError = validateReminderTime(values.reminderTime);

  if (reminderError) {
    return reminderError;
  }

  if (values.frequency === "custom" && values.customWeekdays.length === 0) {
    return "Select at least one day for custom frequency.";
  }

  if (!Number.isFinite(values.goalTarget)) {
    return "Goal target should be a valid number.";
  }

  if (values.goalTarget < HABIT_GOAL_TARGET_MIN || values.goalTarget > HABIT_GOAL_TARGET_MAX) {
    return `Goal target should be between ${HABIT_GOAL_TARGET_MIN} and ${HABIT_GOAL_TARGET_MAX}.`;
  }

  if (values.goalMetric === "value") {
    const normalizedUnit = values.goalUnit.trim();

    if (!normalizedUnit) {
      return "Add a unit for numeric goal (for example ml, min, or steps).";
    }

    if (normalizedUnit.length > HABIT_GOAL_UNIT_MAX_LENGTH) {
      return `Goal unit should be shorter than ${HABIT_GOAL_UNIT_MAX_LENGTH} characters.`;
    }
  }

  return null;
}
