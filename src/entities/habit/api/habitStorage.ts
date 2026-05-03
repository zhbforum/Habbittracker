import { withHabitMetrics } from "../model/analytics";
import { mapHabitStorageDtoToHabit } from "../model/mappers";
import type { Habit, HabitFormValues } from "../model/types";

import {
  applyHabitCompletionToggle,
  applyHabitFormUpdate,
  applyHabitProgressUpdate,
  buildHabitFromFormValues,
} from "./habitStorageMutations";
import {
  createHabitId,
  persistHabits,
  readHabitStoragePayload,
} from "./habitStoragePersistence";

export async function fetchHabitsForUser(userId: string): Promise<Habit[]> {
  try {
    const payload = await readHabitStoragePayload(userId);

    if (!payload) {
      return [];
    }

    const parsed = JSON.parse(payload) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((habitDto) => mapHabitStorageDtoToHabit(habitDto, userId))
      .filter((habit): habit is Habit => habit !== null);
  } catch {
    return [];
  }
}

export async function createHabitForUser(
  userId: string,
  values: HabitFormValues,
): Promise<Habit> {
  const nowIso = new Date().toISOString();
  const habits = await fetchHabitsForUser(userId);
  const nextHabit = buildHabitFromFormValues({
    habitId: createHabitId(),
    userId,
    values,
    createdAtIso: nowIso,
  });

  await persistHabits(userId, [nextHabit, ...habits]);
  return nextHabit;
}

export async function updateHabitForUser(
  userId: string,
  habitId: string,
  values: HabitFormValues,
): Promise<Habit> {
  const habits = await fetchHabitsForUser(userId);
  let updatedHabit: Habit | null = null;

  const nextHabits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    updatedHabit = applyHabitFormUpdate(habit, values);
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

    updatedHabit = applyHabitCompletionToggle(habit, dateKey);
    return updatedHabit;
  });

  if (!updatedHabit) {
    throw new Error("Habit was not found.");
  }

  await persistHabits(userId, nextHabits);
  return updatedHabit;
}

export async function setHabitProgressForDate(
  userId: string,
  habitId: string,
  dateKey: string,
  rawValue: number,
): Promise<Habit> {
  const habits = await fetchHabitsForUser(userId);
  let updatedHabit: Habit | null = null;

  const nextHabits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    updatedHabit = applyHabitProgressUpdate(habit, dateKey, rawValue);
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
