import {
  DEFAULT_HABIT_GROUP_FORM_VALUES,
  HABIT_GROUP_DESCRIPTION_MAX_LENGTH,
  HABIT_GROUP_NAME_MAX_LENGTH,
} from "./constants";
import { HABIT_ICON_ID_VALUES } from "./dto";
import { normalizeTime } from "./date";
import type { HabitGroupFormValues } from "./types";

export function sanitizeHabitGroupName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function sanitizeHabitGroupDescription(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isIsoDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateKey(value: string): Date | null {
  if (!isIsoDateKey(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== (month || 1) - 1 ||
    date.getDate() !== (day || 1)
  ) {
    return null;
  }

  return date;
}

export function clampGroupDailyGoal(goal: number, selectedHabitsCount: number): number {
  const safeGoal = Number.isFinite(goal) ? Math.round(goal) : 1;
  const maxGoal = Math.max(1, selectedHabitsCount);

  return Math.max(1, Math.min(maxGoal, safeGoal));
}

export function normalizeHabitGroupFormValues(
  values: HabitGroupFormValues,
): HabitGroupFormValues {
  const uniqueHabitIds = Array.from(
    new Set(values.habitIds.map((habitId) => habitId.trim()).filter(Boolean)),
  );

  const uniqueCustomWeekdays = Array.from(new Set(values.customWeekdays)).sort(
    (left, right) => left - right,
  );

  return {
    name: sanitizeHabitGroupName(values.name),
    description: sanitizeHabitGroupDescription(values.description),
    iconId: HABIT_ICON_ID_VALUES.includes(values.iconId)
      ? values.iconId
      : DEFAULT_HABIT_GROUP_FORM_VALUES.iconId,
    frequency: values.frequency,
    weeklyWeekday: values.weeklyWeekday,
    customWeekdays: uniqueCustomWeekdays,
    startDate: values.startDate.trim(),
    endDate: values.endDate.trim(),
    reminderStartTime: normalizeTime(values.reminderStartTime) || "07:00",
    reminderEndTime: normalizeTime(values.reminderEndTime) || "21:00",
    dailyGoal: clampGroupDailyGoal(values.dailyGoal, uniqueHabitIds.length),
    habitIds: uniqueHabitIds,
  };
}

export function validateHabitGroupForm(values: HabitGroupFormValues): string | null {
  const normalizedName = sanitizeHabitGroupName(values.name);

  if (!normalizedName) {
    return "Group name is required.";
  }

  if (normalizedName.length < 2) {
    return "Group name should have at least 2 characters.";
  }

  if (normalizedName.length > HABIT_GROUP_NAME_MAX_LENGTH) {
    return `Group name should be shorter than ${HABIT_GROUP_NAME_MAX_LENGTH} characters.`;
  }

  const normalizedDescription = sanitizeHabitGroupDescription(values.description);

  if (normalizedDescription.length > HABIT_GROUP_DESCRIPTION_MAX_LENGTH) {
    return `Description should be shorter than ${HABIT_GROUP_DESCRIPTION_MAX_LENGTH} characters.`;
  }

  if (!normalizeTime(values.reminderStartTime) || !normalizeTime(values.reminderEndTime)) {
    return "Start and end reminder times should be in HH:mm format.";
  }

  const parsedStartDate = parseDateKey(values.startDate);
  const parsedEndDate = parseDateKey(values.endDate);

  if (!parsedStartDate || !parsedEndDate) {
    return "Start and end dates should be in YYYY-MM-DD format.";
  }

  if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
    return "End date should be the same or later than start date.";
  }

  if (values.frequency === "custom" && values.customWeekdays.length === 0) {
    return "Select at least one day for custom frequency.";
  }

  if (values.habitIds.length === 0) {
    return "Select at least one habit for this group.";
  }

  if (values.dailyGoal < 1) {
    return "Daily goal should be at least 1.";
  }

  if (values.dailyGoal > values.habitIds.length) {
    return "Daily goal should not exceed selected habits count.";
  }

  return null;
}
