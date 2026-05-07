import { DEFAULT_HABIT_FORM_VALUES } from "./constants";
import {
  normalizeCompletionEntry,
  normalizeHabitGoal,
} from "./completions";
import { normalizeTime } from "./date";
import {
  HABIT_FREQUENCY_VALUES,
  HABIT_ICON_COLOR_VALUES,
  HABIT_ICON_ID_VALUES,
  HABIT_KIND_VALUES,
  type HabitPersistenceDto,
  type HabitStorageDto,
} from "./dto";
import type {
  Habit,
  HabitCompletionEntry,
  HabitFormValues,
  HabitFrequency,
  HabitIconColorId,
  HabitIconId,
  HabitKind,
  HabitWeekday,
} from "./types";
import { sanitizeHabitName } from "./validators";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHabitKind(value: unknown): value is HabitKind {
  return HABIT_KIND_VALUES.includes(value as HabitKind);
}

function isHabitFrequency(value: unknown): value is HabitFrequency {
  return HABIT_FREQUENCY_VALUES.includes(value as HabitFrequency);
}

function isHabitIconId(value: unknown): value is HabitIconId {
  return HABIT_ICON_ID_VALUES.includes(value as HabitIconId);
}

function isHabitIconColorId(value: unknown): value is HabitIconColorId {
  return HABIT_ICON_COLOR_VALUES.includes(value as HabitIconColorId);
}

function toSafeString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeWeekdayList(weekdays: HabitWeekday[]): HabitWeekday[] {
  const normalizedValues = weekdays.map((value) => (((value % 7) + 7) % 7) as HabitWeekday);
  return Array.from(new Set(normalizedValues))
    .sort((left, right) => left - right);
}

function parseWeekdayList(value: unknown): HabitWeekday[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const weekdays = value
    .map((day) => (typeof day === "number" ? day : Number.NaN))
    .filter((day) => Number.isFinite(day))
    .map((day) => day as HabitWeekday);

  return normalizeWeekdayList(weekdays);
}

function parseCompletions(value: unknown): Record<string, HabitCompletionEntry> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, HabitCompletionEntry>>(
    (accumulator, [key, raw]) => {
      const entry = normalizeCompletionEntry(raw);

      if (entry) {
        accumulator[key] = entry;
      }

      return accumulator;
    },
    {},
  );
}

function parseWeekday(value: unknown): HabitWeekday {
  const source = typeof value === "number" && Number.isFinite(value) ? value : 1;
  return (((source % 7) + 7) % 7) as HabitWeekday;
}

export function normalizeHabitFormValues(values: HabitFormValues): HabitFormValues {
  const normalizedGoal = normalizeHabitGoal({
    metric: values.goalMetric,
    period: values.goalPeriod,
    target: values.goalTarget,
    unit: values.goalUnit,
  });
  const normalizedReminderInput = values.reminderTime.trim();
  const normalizedReminderTime =
    normalizedReminderInput.length === 0
      ? ""
      : normalizeTime(normalizedReminderInput) || DEFAULT_HABIT_FORM_VALUES.reminderTime;

  return {
    ...values,
    name: sanitizeHabitName(values.name),
    kind: isHabitKind(values.kind) ? values.kind : DEFAULT_HABIT_FORM_VALUES.kind,
    frequency: isHabitFrequency(values.frequency)
      ? values.frequency
      : DEFAULT_HABIT_FORM_VALUES.frequency,
    reminderTime: normalizedReminderTime,
    iconId: isHabitIconId(values.iconId) ? values.iconId : DEFAULT_HABIT_FORM_VALUES.iconId,
    iconColorId: isHabitIconColorId(values.iconColorId)
      ? values.iconColorId
      : DEFAULT_HABIT_FORM_VALUES.iconColorId,
    customWeekdays: normalizeWeekdayList(values.customWeekdays),
    weeklyWeekday: parseWeekday(values.weeklyWeekday),
    goalMetric: normalizedGoal.metric,
    goalPeriod: normalizedGoal.period,
    goalTarget: normalizedGoal.target,
    goalUnit: normalizedGoal.unit,
  };
}

function parseGoalFromDto(raw: HabitStorageDto): Habit["goal"] {
  if (isRecord(raw.goal)) {
    return normalizeHabitGoal(raw.goal);
  }

  return normalizeHabitGoal({
    metric: (raw as Record<string, unknown>).goalMetric,
    period: (raw as Record<string, unknown>).goalPeriod,
    target: (raw as Record<string, unknown>).goalTarget,
    unit: (raw as Record<string, unknown>).goalUnit,
  });
}

export function mapHabitStorageDtoToHabit(
  rawValue: unknown,
  fallbackUserId: string,
): Habit | null {
  if (!isRecord(rawValue)) {
    return null;
  }

  const raw = rawValue as HabitStorageDto;
  const id = toSafeString(raw.id);

  if (!id) {
    return null;
  }

  const normalizedCustomWeekdays = parseWeekdayList(raw.customWeekdays);
  const rawReminderTime = typeof raw.reminderTime === "string" ? raw.reminderTime.trim() : "";
  const normalizedReminderTime =
    rawReminderTime.length === 0
      ? ""
      : normalizeTime(rawReminderTime) || DEFAULT_HABIT_FORM_VALUES.reminderTime;
  const nowIso = new Date().toISOString();

  return {
    id,
    userId: toSafeString(raw.userId) ?? fallbackUserId,
    name: sanitizeHabitName(toSafeString(raw.name) ?? ""),
    kind: isHabitKind(raw.kind) ? raw.kind : DEFAULT_HABIT_FORM_VALUES.kind,
    frequency: isHabitFrequency(raw.frequency)
      ? raw.frequency
      : DEFAULT_HABIT_FORM_VALUES.frequency,
    reminderTime: normalizedReminderTime,
    iconId: isHabitIconId(raw.iconId) ? raw.iconId : DEFAULT_HABIT_FORM_VALUES.iconId,
    iconColorId: isHabitIconColorId(raw.iconColorId)
      ? raw.iconColorId
      : DEFAULT_HABIT_FORM_VALUES.iconColorId,
    createdAt: toSafeString(raw.createdAt) ?? nowIso,
    updatedAt: toSafeString(raw.updatedAt) ?? nowIso,
    weeklyWeekday: parseWeekday(raw.weeklyWeekday),
    customWeekdays:
      normalizedCustomWeekdays.length > 0
        ? normalizedCustomWeekdays
        : DEFAULT_HABIT_FORM_VALUES.customWeekdays,
    goal: parseGoalFromDto(raw),
    completions: parseCompletions(raw.completions),
  };
}

export function mapHabitToPersistenceDto(habit: Habit): HabitPersistenceDto {
  return {
    ...habit,
    customWeekdays: habit.customWeekdays,
    completions: habit.completions,
  };
}
