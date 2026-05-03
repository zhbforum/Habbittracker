import { DEFAULT_HABIT_FORM_VALUES } from "../model/constants";
import { getCompletionEntry } from "../model/completions";
import { normalizeHabitFormValues } from "../model/mappers";
import type { Habit, HabitFormValues } from "../model/types";

function resolveDefaultCompletionValue(habit: Habit): number {
  return habit.goal.metric === "value" ? habit.goal.target : 1;
}

function normalizeProgressValue(habit: Habit, value: number): number {
  if (habit.goal.metric === "checkins") {
    return Math.max(1, Math.round(value));
  }

  return Math.max(0, Math.round(value * 100) / 100);
}

export function buildHabitFromFormValues(args: {
  habitId: string;
  userId: string;
  values: HabitFormValues;
  createdAtIso: string;
}): Habit {
  const normalizedValues = normalizeHabitFormValues(args.values);

  return {
    id: args.habitId,
    userId: args.userId,
    name: normalizedValues.name,
    kind: normalizedValues.kind,
    frequency: normalizedValues.frequency,
    reminderTime: normalizedValues.reminderTime,
    iconId: normalizedValues.iconId,
    iconColorId: normalizedValues.iconColorId,
    createdAt: args.createdAtIso,
    updatedAt: args.createdAtIso,
    weeklyWeekday: normalizedValues.weeklyWeekday,
    customWeekdays:
      normalizedValues.customWeekdays.length > 0
        ? normalizedValues.customWeekdays
        : DEFAULT_HABIT_FORM_VALUES.customWeekdays,
    goal: {
      metric: normalizedValues.goalMetric,
      period: normalizedValues.goalPeriod,
      target: normalizedValues.goalTarget,
      unit: normalizedValues.goalUnit,
    },
    completions: {},
  };
}

export function applyHabitFormUpdate(habit: Habit, values: HabitFormValues): Habit {
  const normalizedValues = normalizeHabitFormValues(values);

  return {
    ...habit,
    name: normalizedValues.name,
    kind: normalizedValues.kind,
    frequency: normalizedValues.frequency,
    reminderTime: normalizedValues.reminderTime,
    iconId: normalizedValues.iconId,
    iconColorId: normalizedValues.iconColorId,
    weeklyWeekday: normalizedValues.weeklyWeekday,
    customWeekdays:
      normalizedValues.customWeekdays.length > 0
        ? normalizedValues.customWeekdays
        : DEFAULT_HABIT_FORM_VALUES.customWeekdays,
    goal: {
      metric: normalizedValues.goalMetric,
      period: normalizedValues.goalPeriod,
      target: normalizedValues.goalTarget,
      unit: normalizedValues.goalUnit,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function applyHabitCompletionToggle(habit: Habit, dateKey: string): Habit {
  const completions = { ...habit.completions };

  if (completions[dateKey]) {
    delete completions[dateKey];
  } else {
    completions[dateKey] = {
      completedAt: new Date().toISOString(),
      value: resolveDefaultCompletionValue(habit),
    };
  }

  return {
    ...habit,
    completions,
    updatedAt: new Date().toISOString(),
  };
}

export function applyHabitProgressUpdate(habit: Habit, dateKey: string, rawValue: number): Habit {
  const completions = { ...habit.completions };
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    if (getCompletionEntry(habit, dateKey)) {
      delete completions[dateKey];
    }
  } else {
    completions[dateKey] = {
      completedAt: new Date().toISOString(),
      value: normalizeProgressValue(habit, parsedValue),
    };
  }

  return {
    ...habit,
    completions,
    updatedAt: new Date().toISOString(),
  };
}
