import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_HABIT_FORM_VALUES,
  HABIT_STORAGE_KEY_PREFIX,
} from "../model/constants";
import { withHabitMetrics } from "../model/analytics";
import {
  mapHabitStorageDtoToHabit,
  mapHabitToPersistenceDto,
  normalizeHabitFormValues,
} from "../model/mappers";
import type {
  Habit,
  HabitFormValues,
} from "../model/types";

function createStorageKey(userId: string): string {
  return `${HABIT_STORAGE_KEY_PREFIX}.${userId}`;
}

function createHabitId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persistHabits(userId: string, habits: Habit[]): Promise<void> {
  const payload = habits.map(mapHabitToPersistenceDto);
  await AsyncStorage.setItem(createStorageKey(userId), JSON.stringify(payload));
}

export async function fetchHabitsForUser(userId: string): Promise<Habit[]> {
  try {
    const payload = await AsyncStorage.getItem(createStorageKey(userId));

    if (!payload) {
      return [];
    }

    const parsed = JSON.parse(payload) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((habitDto) => mapHabitStorageDtoToHabit(habitDto, userId))
      .filter((habit): habit is Habit => habit !== null)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
}

export async function createHabitForUser(
  userId: string,
  values: HabitFormValues,
): Promise<Habit> {
  const nowIso = new Date().toISOString();
  const normalizedValues = normalizeHabitFormValues(values);
  const habits = await fetchHabitsForUser(userId);

  const nextHabit: Habit = {
    id: createHabitId(),
    userId,
    name: normalizedValues.name,
    kind: normalizedValues.kind,
    frequency: normalizedValues.frequency,
    reminderTime: normalizedValues.reminderTime,
    iconId: normalizedValues.iconId,
    iconColorId: normalizedValues.iconColorId,
    createdAt: nowIso,
    updatedAt: nowIso,
    weeklyWeekday: normalizedValues.weeklyWeekday,
    customWeekdays:
      normalizedValues.customWeekdays.length > 0
        ? normalizedValues.customWeekdays
        : DEFAULT_HABIT_FORM_VALUES.customWeekdays,
    completions: {},
  };

  await persistHabits(userId, [nextHabit, ...habits]);
  return nextHabit;
}

export async function updateHabitForUser(
  userId: string,
  habitId: string,
  values: HabitFormValues,
): Promise<Habit> {
  const normalizedValues = normalizeHabitFormValues(values);
  const habits = await fetchHabitsForUser(userId);
  let updatedHabit: Habit | null = null;

  const nextHabits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    updatedHabit = {
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
      updatedAt: new Date().toISOString(),
    };

    return updatedHabit;
  });

  if (!updatedHabit) {
    throw new Error("Habit was not found.");
  }

  await persistHabits(userId, nextHabits);
  return updatedHabit;
}

export async function deleteHabitForUser(userId: string, habitId: string): Promise<void> {
  const habits = await fetchHabitsForUser(userId);
  const nextHabits = habits.filter((habit) => habit.id !== habitId);
  await persistHabits(userId, nextHabits);
}

export async function toggleHabitCompletionForDate(
  userId: string,
  habitId: string,
  dateKey: string,
): Promise<Habit> {
  const habits = await fetchHabitsForUser(userId);
  let updatedHabit: Habit | null = null;

  const nextHabits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    const completions = { ...habit.completions };

    if (completions[dateKey]) {
      delete completions[dateKey];
    } else {
      completions[dateKey] = new Date().toISOString();
    }

    updatedHabit = {
      ...habit,
      completions,
      updatedAt: new Date().toISOString(),
    };

    return updatedHabit;
  });

  if (!updatedHabit) {
    throw new Error("Habit was not found.");
  }

  await persistHabits(userId, nextHabits);
  return updatedHabit;
}

export async function fetchLocalHabitStatsForUser(userId: string): Promise<{
  totalHabits: number;
  currentStreak: number;
}> {
  const habits = await fetchHabitsForUser(userId);
  const habitsWithMetrics = withHabitMetrics(habits);
  const currentStreak = habitsWithMetrics.reduce((maxStreak, habit) => {
    return Math.max(maxStreak, habit.metrics.currentStreak);
  }, 0);

  return {
    totalHabits: habits.length,
    currentStreak,
  };
}
