import AsyncStorage from "@react-native-async-storage/async-storage";

import { createHabitGroup } from "@/test/fixtures/habits";
import {
  DEFAULT_HABIT_GROUP_FORM_VALUES,
  HABIT_GROUP_STORAGE_KEY_PREFIX,
} from "../../model/constants";
import { normalizeHabitGroupFormValues } from "../../model/groupValidators";
import type { HabitGroup, HabitGroupFormValues } from "../../model/types";
import { mapRawToHabitGroup } from "../habitGroupStorageMapper";
import {
  createHabitGroupForUser,
  deleteHabitGroupForUser,
  fetchHabitGroupsForUser,
  removeHabitFromGroupsForUser,
  updateHabitGroupForUser,
} from "../habitGroupStorage";

jest.mock("../habitGroupStorageMapper", () => ({
  mapRawToHabitGroup: jest.fn(),
}));

jest.mock("../../model/groupValidators", () => ({
  normalizeHabitGroupFormValues: jest.fn(),
}));

export const mapRawToHabitGroupMock = mapRawToHabitGroup as jest.MockedFunction<
  typeof mapRawToHabitGroup
>;
export const normalizeHabitGroupFormValuesMock =
  normalizeHabitGroupFormValues as jest.MockedFunction<typeof normalizeHabitGroupFormValues>;

export const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
export const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

export function createCreateGroupValues(): {
  rawValues: HabitGroupFormValues;
  normalizedValues: HabitGroupFormValues;
} {
  const rawValues: HabitGroupFormValues = {
    ...DEFAULT_HABIT_GROUP_FORM_VALUES,
    name: "Focus Sprint",
  };

  const normalizedValues: HabitGroupFormValues = {
    ...DEFAULT_HABIT_GROUP_FORM_VALUES,
    name: "Focus Sprint",
    description: "Morning deep work",
    frequency: "custom",
    customWeekdays: [1, 3, 5],
    startDate: "2026-06-02",
    endDate: "2026-06-20",
    reminderStartTime: "08:00",
    reminderEndTime: "20:00",
    dailyGoal: 2,
    habitIds: ["habit-1", "habit-2"],
  };

  return { rawValues, normalizedValues };
}

export function createUpdateGroupValues(): {
  rawValues: HabitGroupFormValues;
  normalizedValues: HabitGroupFormValues;
} {
  const rawValues: HabitGroupFormValues = {
    ...DEFAULT_HABIT_GROUP_FORM_VALUES,
    name: "Updated",
  };

  const normalizedValues: HabitGroupFormValues = {
    ...DEFAULT_HABIT_GROUP_FORM_VALUES,
    name: "Updated",
    description: "Updated description",
    frequency: "weekly",
    weeklyWeekday: 4,
    customWeekdays: [2, 4],
    startDate: "2026-06-05",
    endDate: "2026-06-25",
    reminderStartTime: "09:00",
    reminderEndTime: "19:00",
    dailyGoal: 1,
    habitIds: ["habit-2"],
  };

  return { rawValues, normalizedValues };
}

export function parsePersistedGroups(): HabitGroup[] {
  return JSON.parse(String(setItemMock.mock.calls[0]?.[1])) as HabitGroup[];
}

export {
  createHabitGroup,
  createHabitGroupForUser,
  deleteHabitGroupForUser,
  fetchHabitGroupsForUser,
  removeHabitFromGroupsForUser,
  updateHabitGroupForUser,
  HABIT_GROUP_STORAGE_KEY_PREFIX,
  DEFAULT_HABIT_GROUP_FORM_VALUES,
};
