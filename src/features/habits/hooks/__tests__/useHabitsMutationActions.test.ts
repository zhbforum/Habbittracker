import { renderHook } from "@testing-library/react-native";

import {
  createHabitFormValues,
  createHabitGroupFormValues,
} from "@/test/fixtures/habits";
import { useHabitGroupMutationActions } from "../useHabitGroupMutationActions";
import { useHabitItemMutationActions } from "../useHabitItemMutationActions";
import { useHabitsMutationActions } from "../useHabitsMutationActions";

jest.mock("../useHabitItemMutationActions", () => ({
  useHabitItemMutationActions: jest.fn(),
}));

jest.mock("../useHabitGroupMutationActions", () => ({
  useHabitGroupMutationActions: jest.fn(),
}));

const useHabitItemMutationActionsMock =
  useHabitItemMutationActions as jest.MockedFunction<typeof useHabitItemMutationActions>;
const useHabitGroupMutationActionsMock =
  useHabitGroupMutationActions as jest.MockedFunction<typeof useHabitGroupMutationActions>;

type UseHabitsMutationActionsArgs = Parameters<typeof useHabitsMutationActions>[0];
type HabitItemActions = ReturnType<typeof useHabitItemMutationActions>;
type HabitGroupActions = ReturnType<typeof useHabitGroupMutationActions>;

describe("useHabitsMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a combined mutation contract from item and group hooks", () => {
    const itemActions: HabitItemActions = {
      handleSaveHabit: jest.fn(),
      toggleTodayCompletion: jest.fn(),
      handleDeleteHabit: jest.fn(),
      setTodayProgressValue: jest.fn(),
    };
    const groupActions: HabitGroupActions = {
      handleSaveGroup: jest.fn(),
      handleDeleteGroup: jest.fn(),
    };
    useHabitItemMutationActionsMock.mockReturnValue(itemActions);
    useHabitGroupMutationActionsMock.mockReturnValue(groupActions);

    const args: UseHabitsMutationActionsArgs = {
      userId: "user-1",
      syncAchievements: jest.fn(),
      setIsSaving: jest.fn(),
      setErrorMessage: jest.fn(),
      setHabits: jest.fn(),
      setGroups: jest.fn(),
      editorState: {
        formValues: createHabitFormValues({ name: "habit-form" }),
        editorMode: "edit" as const,
        editingHabitId: "habit-1",
        groupFormValues: createHabitGroupFormValues({ name: "group-form" }),
        groupEditorMode: "create" as const,
        editingGroupId: "group-1",
        finalizeHabitSave: jest.fn(),
        finalizeGroupSave: jest.fn(),
        clearHabitReferencesAfterDelete: jest.fn(),
        clearGroupReferencesAfterDelete: jest.fn(),
      },
    };

    const { result } = renderHook(() => useHabitsMutationActions(args));

    expect(useHabitItemMutationActionsMock).toHaveBeenCalledTimes(1);
    expect(useHabitGroupMutationActionsMock).toHaveBeenCalledTimes(1);
    expect(result.current.handleSaveHabit).toBe(itemActions.handleSaveHabit);
    expect(result.current.toggleTodayCompletion).toBe(itemActions.toggleTodayCompletion);
    expect(result.current.handleDeleteHabit).toBe(itemActions.handleDeleteHabit);
    expect(result.current.setTodayProgressValue).toBe(itemActions.setTodayProgressValue);
    expect(result.current.handleSaveGroup).toBe(groupActions.handleSaveGroup);
    expect(result.current.handleDeleteGroup).toBe(groupActions.handleDeleteGroup);
  });
});
