import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  HABIT_GROUP_STORAGE_KEY_PREFIX,
} from "../model/constants";
import { normalizeHabitGroupFormValues } from "../model/groupValidators";
import type { HabitGroup, HabitGroupFormValues } from "../model/types";
import { mapRawToHabitGroup } from "./habitGroupStorageMapper";

function createStorageKey(userId: string): string {
  return `${HABIT_GROUP_STORAGE_KEY_PREFIX}.${userId}`;
}

function createGroupId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persistGroups(userId: string, groups: HabitGroup[]): Promise<void> {
  await AsyncStorage.setItem(createStorageKey(userId), JSON.stringify(groups));
}

export async function fetchHabitGroupsForUser(userId: string): Promise<HabitGroup[]> {
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
      .map((rawGroup) => mapRawToHabitGroup(rawGroup, userId))
      .filter((group): group is HabitGroup => group !== null);
  } catch {
    return [];
  }
}

export async function createHabitGroupForUser(
  userId: string,
  values: HabitGroupFormValues,
): Promise<HabitGroup> {
  const normalizedValues = normalizeHabitGroupFormValues(values);
  const groups = await fetchHabitGroupsForUser(userId);
  const nowIso = new Date().toISOString();

  const nextGroup: HabitGroup = {
    id: createGroupId(),
    userId,
    name: normalizedValues.name,
    description: normalizedValues.description,
    iconId: normalizedValues.iconId,
    frequency: normalizedValues.frequency,
    weeklyWeekday: normalizedValues.weeklyWeekday,
    customWeekdays: normalizedValues.customWeekdays,
    startDate: normalizedValues.startDate,
    endDate: normalizedValues.endDate,
    reminderStartTime: normalizedValues.reminderStartTime,
    reminderEndTime: normalizedValues.reminderEndTime,
    dailyGoal: normalizedValues.dailyGoal,
    habitIds: normalizedValues.habitIds,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await persistGroups(userId, [nextGroup, ...groups]);
  return nextGroup;
}

export async function updateHabitGroupForUser(
  userId: string,
  groupId: string,
  values: HabitGroupFormValues,
): Promise<HabitGroup> {
  const normalizedValues = normalizeHabitGroupFormValues(values);
  const groups = await fetchHabitGroupsForUser(userId);
  let updatedGroup: HabitGroup | null = null;

  const nextGroups = groups.map((group) => {
    if (group.id !== groupId) {
      return group;
    }

    updatedGroup = {
      ...group,
      name: normalizedValues.name,
      description: normalizedValues.description,
      iconId: normalizedValues.iconId,
      frequency: normalizedValues.frequency,
      weeklyWeekday: normalizedValues.weeklyWeekday,
      customWeekdays: normalizedValues.customWeekdays,
      startDate: normalizedValues.startDate,
      endDate: normalizedValues.endDate,
      reminderStartTime: normalizedValues.reminderStartTime,
      reminderEndTime: normalizedValues.reminderEndTime,
      dailyGoal: normalizedValues.dailyGoal,
      habitIds: normalizedValues.habitIds,
      updatedAt: new Date().toISOString(),
    };

    return updatedGroup;
  });

  if (!updatedGroup) {
    throw new Error("Group was not found.");
  }

  await persistGroups(userId, nextGroups);
  return updatedGroup;
}

export async function deleteHabitGroupForUser(userId: string, groupId: string): Promise<void> {
  const groups = await fetchHabitGroupsForUser(userId);
  const nextGroups = groups.filter((group) => group.id !== groupId);
  await persistGroups(userId, nextGroups);
}

export async function removeHabitFromGroupsForUser(
  userId: string,
  habitId: string,
): Promise<void> {
  const groups = await fetchHabitGroupsForUser(userId);

  const nextGroups = groups.map((group) => {
    if (!group.habitIds.includes(habitId)) {
      return group;
    }

    const nextHabitIds = group.habitIds.filter((candidateId) => candidateId !== habitId);

    return {
      ...group,
      habitIds: nextHabitIds,
      dailyGoal: Math.min(group.dailyGoal, Math.max(1, nextHabitIds.length)),
      updatedAt: new Date().toISOString(),
    };
  });

  await persistGroups(userId, nextGroups);
}
