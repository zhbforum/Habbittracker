import AsyncStorage from "@react-native-async-storage/async-storage";

import { HABIT_STORAGE_KEY_PREFIX } from "../model/constants";
import { mapHabitToPersistenceDto } from "../model/mappers";
import type { Habit } from "../model/types";

function createStorageKey(userId: string): string {
  return `${HABIT_STORAGE_KEY_PREFIX}.${userId}`;
}

export function createHabitId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function persistHabits(userId: string, habits: Habit[]): Promise<void> {
  const payload = habits.map(mapHabitToPersistenceDto);
  await AsyncStorage.setItem(createStorageKey(userId), JSON.stringify(payload));
}

export async function readHabitStoragePayload(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(createStorageKey(userId));
}
