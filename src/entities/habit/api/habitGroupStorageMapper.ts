import {
  createDefaultHabitGroupFormValues,
  DEFAULT_HABIT_GROUP_FORM_VALUES,
} from "../model/constants";
import { HABIT_ICON_ID_VALUES } from "../model/dto";
import { addDays, normalizeTime, toDateKey } from "../model/date";
import type { HabitGroup, HabitWeekday } from "../model/types";

function toSafeString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toSafeHabitIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.map((habitId) => toSafeString(habitId)).filter(Boolean) as string[]),
  );
}

function toSafeDailyGoal(value: unknown, selectedHabitsCount: number): number {
  const parsed = typeof value === "number" ? Math.round(value) : Number.NaN;
  const resolved = Number.isFinite(parsed) ? parsed : DEFAULT_HABIT_GROUP_FORM_VALUES.dailyGoal;
  const maxValue = Math.max(1, selectedHabitsCount);

  return Math.max(1, Math.min(maxValue, resolved));
}

function toSafeWeekday(value: unknown): HabitWeekday {
  const parsed = typeof value === "number" ? Math.round(value) : Number.NaN;
  const normalized = Number.isFinite(parsed) ? parsed : DEFAULT_HABIT_GROUP_FORM_VALUES.weeklyWeekday;
  return (((normalized % 7) + 7) % 7) as HabitWeekday;
}

function toSafeCustomWeekdays(value: unknown): HabitWeekday[] {
  if (!Array.isArray(value)) {
    return DEFAULT_HABIT_GROUP_FORM_VALUES.customWeekdays;
  }

  const normalized = Array.from(
    new Set(
      value
        .map((day) => (typeof day === "number" ? Math.round(day) : Number.NaN))
        .filter((day) => Number.isFinite(day))
        .map((day) => (((day % 7) + 7) % 7) as HabitWeekday),
    ),
  ).sort((left, right) => left - right) as HabitWeekday[];

  return normalized.length > 0
    ? normalized
    : DEFAULT_HABIT_GROUP_FORM_VALUES.customWeekdays;
}

function toSafeFrequency(value: unknown): HabitGroup["frequency"] {
  return value === "daily" || value === "weekly" || value === "custom"
    ? value
    : DEFAULT_HABIT_GROUP_FORM_VALUES.frequency;
}

function toSafeDateKey(value: unknown, fallback: string): string {
  const raw = toSafeString(value);

  if (!raw) {
    return fallback;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

function toSafeIconId(value: unknown): HabitGroup["iconId"] {
  return HABIT_ICON_ID_VALUES.includes(value as HabitGroup["iconId"])
    ? (value as HabitGroup["iconId"])
    : DEFAULT_HABIT_GROUP_FORM_VALUES.iconId;
}

export function mapRawToHabitGroup(rawValue: unknown, userId: string): HabitGroup | null {
  if (typeof rawValue !== "object" || rawValue === null) {
    return null;
  }

  const raw = rawValue as Record<string, unknown>;
  const id = toSafeString(raw.id);

  if (!id) {
    return null;
  }

  const habitIds = toSafeHabitIds(raw.habitIds);
  const nowIso = new Date().toISOString();
  const createdAtValue = toSafeString(raw.createdAt) || nowIso;
  const createdAtDate = new Date(createdAtValue);
  const fallbackDateBase = Number.isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate;
  const dateDefaults = createDefaultHabitGroupFormValues(fallbackDateBase);
  const fallbackStartDate = toDateKey(fallbackDateBase);
  const fallbackEndDate = toDateKey(addDays(fallbackDateBase, 30));

  return {
    id,
    userId: toSafeString(raw.userId) || userId,
    name: toSafeString(raw.name) || "Untitled group",
    description: toSafeString(raw.description) || "",
    iconId: toSafeIconId(raw.iconId),
    frequency: toSafeFrequency(raw.frequency),
    weeklyWeekday: toSafeWeekday(raw.weeklyWeekday),
    customWeekdays: toSafeCustomWeekdays(raw.customWeekdays),
    startDate: toSafeDateKey(raw.startDate, dateDefaults.startDate || fallbackStartDate),
    endDate: toSafeDateKey(raw.endDate, dateDefaults.endDate || fallbackEndDate),
    reminderStartTime:
      normalizeTime(toSafeString(raw.reminderStartTime) || "") ||
      DEFAULT_HABIT_GROUP_FORM_VALUES.reminderStartTime,
    reminderEndTime:
      normalizeTime(toSafeString(raw.reminderEndTime) || "") ||
      DEFAULT_HABIT_GROUP_FORM_VALUES.reminderEndTime,
    dailyGoal: toSafeDailyGoal(raw.dailyGoal, habitIds.length),
    habitIds,
    createdAt: createdAtValue,
    updatedAt: toSafeString(raw.updatedAt) || nowIso,
  };
}
