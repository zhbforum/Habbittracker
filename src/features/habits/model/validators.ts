import { HABIT_NAME_MAX_LENGTH } from "./constants";
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

  return null;
}
