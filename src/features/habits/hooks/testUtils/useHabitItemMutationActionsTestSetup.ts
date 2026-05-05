import type { SetStateAction } from "react";

import {
  createHabitForUser,
  deleteHabitForUser,
  setHabitProgressForDate,
  toggleHabitCompletionForDate,
  updateHabitForUser,
} from "@entities/habit/api/habitStorage";
import type { Habit, HabitGroup } from "@entities/habit/model/types";
import { createHabitFormValues } from "@/test/fixtures/habits";
import { removeHabitFromGroupsForUser } from "@features/habits/services/habitGroupStorageService";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import { useHabitItemMutationActions } from "../useHabitItemMutationActions";

jest.mock("@entities/habit/api/habitStorage", () => ({
  createHabitForUser: jest.fn(),
  deleteHabitForUser: jest.fn(),
  setHabitProgressForDate: jest.fn(),
  toggleHabitCompletionForDate: jest.fn(),
  updateHabitForUser: jest.fn(),
}));

jest.mock("@features/habits/services/habitGroupStorageService", () => ({
  removeHabitFromGroupsForUser: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));

export const createHabitForUserMock =
  createHabitForUser as jest.MockedFunction<typeof createHabitForUser>;
export const updateHabitForUserMock =
  updateHabitForUser as jest.MockedFunction<typeof updateHabitForUser>;
export const deleteHabitForUserMock =
  deleteHabitForUser as jest.MockedFunction<typeof deleteHabitForUser>;
export const toggleHabitCompletionForDateMock =
  toggleHabitCompletionForDate as jest.MockedFunction<typeof toggleHabitCompletionForDate>;
export const setHabitProgressForDateMock =
  setHabitProgressForDate as jest.MockedFunction<typeof setHabitProgressForDate>;
export const removeHabitFromGroupsForUserMock =
  removeHabitFromGroupsForUser as jest.MockedFunction<typeof removeHabitFromGroupsForUser>;
export const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;
export const showSuccessToastMock = showSuccessToast as jest.MockedFunction<typeof showSuccessToast>;

export type UseHabitItemMutationActionsArgs = Parameters<typeof useHabitItemMutationActions>[0];

function createStateSetterMock<T>() {
  return jest.fn<void, [SetStateAction<T>]>();
}

export function createArgs(
  overrides: Partial<UseHabitItemMutationActionsArgs> = {},
): UseHabitItemMutationActionsArgs {
  const baseEditorState: UseHabitItemMutationActionsArgs["editorState"] = {
    formValues: createHabitFormValues({ name: "Habit form" }),
    editorMode: "create",
    editingHabitId: null,
    finalizeHabitSave: jest.fn(),
    clearHabitReferencesAfterDelete: jest.fn(),
  };

  return {
    userId: "user-1",
    syncAchievements: jest.fn(),
    setIsSaving: createStateSetterMock<boolean>(),
    setErrorMessage: createStateSetterMock<string | null>(),
    setHabits: createStateSetterMock<Habit[]>(),
    setGroups: createStateSetterMock<HabitGroup[]>(),
    editorState: {
      ...baseEditorState,
      ...(overrides.editorState ?? {}),
    },
    ...overrides,
  };
}

export function callHabitsUpdater(args: UseHabitItemMutationActionsArgs, current: Habit[]): Habit[] {
  const setHabitsMock = args.setHabits as jest.Mock<void, [SetStateAction<Habit[]>]>;
  const nextState = setHabitsMock.mock.calls[0]?.[0];

  if (!nextState) {
    throw new Error("setHabits updater was not called");
  }

  if (typeof nextState === "function") {
    return nextState(current);
  }

  return nextState;
}

export function callGroupsUpdater(
  args: UseHabitItemMutationActionsArgs,
  current: HabitGroup[],
): HabitGroup[] {
  const setGroupsMock = args.setGroups as jest.Mock<void, [SetStateAction<HabitGroup[]>]>;
  const nextState = setGroupsMock.mock.calls[0]?.[0];

  if (!nextState) {
    throw new Error("setGroups updater was not called");
  }

  if (typeof nextState === "function") {
    return nextState(current);
  }

  return nextState;
}

export { useHabitItemMutationActions };
