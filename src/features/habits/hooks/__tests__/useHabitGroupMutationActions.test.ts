import type { SetStateAction } from "react";
import { act, renderHook } from "@testing-library/react-native";

import {
  createHabitGroupForUser,
  deleteHabitGroupForUser,
  updateHabitGroupForUser,
} from "@entities/habit/api/habitGroupStorage";
import { normalizeHabitGroupFormValues } from "@entities/habit/model/groupValidators";
import type { HabitGroup } from "@features/habits/model/types";
import {
  createHabitGroup,
  createHabitGroupFormValues,
} from "@/test/fixtures/habits";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import { useHabitGroupMutationActions } from "../useHabitGroupMutationActions";

jest.mock("@entities/habit/api/habitGroupStorage", () => ({
  createHabitGroupForUser: jest.fn(),
  deleteHabitGroupForUser: jest.fn(),
  updateHabitGroupForUser: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));

const createHabitGroupForUserMock =
  createHabitGroupForUser as jest.MockedFunction<typeof createHabitGroupForUser>;
const updateHabitGroupForUserMock =
  updateHabitGroupForUser as jest.MockedFunction<typeof updateHabitGroupForUser>;
const deleteHabitGroupForUserMock =
  deleteHabitGroupForUser as jest.MockedFunction<typeof deleteHabitGroupForUser>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;
const showSuccessToastMock = showSuccessToast as jest.MockedFunction<typeof showSuccessToast>;

type UseHabitGroupMutationActionsArgs = Parameters<typeof useHabitGroupMutationActions>[0];

function createStateSetterMock<T>() {
  return jest.fn<void, [SetStateAction<T>]>();
}

function createArgs(
  overrides: Partial<UseHabitGroupMutationActionsArgs> = {},
): UseHabitGroupMutationActionsArgs {
  const baseEditorState: UseHabitGroupMutationActionsArgs["editorState"] = {
    groupFormValues: createHabitGroupFormValues({ name: "Group form", habitIds: ["habit-1"] }),
    groupEditorMode: "create",
    editingGroupId: null,
    finalizeGroupSave: jest.fn(),
    clearGroupReferencesAfterDelete: jest.fn(),
  };

  return {
    userId: "user-1",
    syncAchievements: jest.fn(),
    setIsSaving: createStateSetterMock<boolean>(),
    setErrorMessage: createStateSetterMock<string | null>(),
    setGroups: createStateSetterMock<HabitGroup[]>(),
    editorState: {
      ...baseEditorState,
      ...(overrides.editorState ?? {}),
    },
    ...overrides,
  };
}

function callGroupsUpdater(
  args: UseHabitGroupMutationActionsArgs,
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

describe("useHabitGroupMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns validation error for invalid group form", async () => {
    const args = createArgs({
      editorState: {
        groupFormValues: createHabitGroupFormValues({
          name: "",
          habitIds: [],
        }),
        groupEditorMode: "create",
        editingGroupId: null,
        finalizeGroupSave: jest.fn(),
        clearGroupReferencesAfterDelete: jest.fn(),
      },
    });

    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.handleSaveGroup();
    });

    expect(isSuccess).toBe(false);
    const validationMessage = (args.setErrorMessage as jest.Mock).mock.calls[0]?.[0];
    expect(typeof validationMessage).toBe("string");
    expect(showErrorToastMock).toHaveBeenCalledWith("Check group details", validationMessage);
    expect(args.setIsSaving).not.toHaveBeenCalled();
  });

  it("creates group successfully with normalized values", async () => {
    const createdGroup = createHabitGroup("group-new", { name: "Created group" });
    createHabitGroupForUserMock.mockResolvedValue(createdGroup);
    const args = createArgs();
    const normalizedValues = normalizeHabitGroupFormValues(args.editorState.groupFormValues);

    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.handleSaveGroup();
    });

    expect(isSuccess).toBe(true);
    expect(createHabitGroupForUserMock).toHaveBeenCalledWith("user-1", normalizedValues);
    expect(args.editorState.finalizeGroupSave).toHaveBeenCalledTimes(1);
    expect(args.syncAchievements).toHaveBeenCalledTimes(1);
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Group created",
      "Your group is ready to track.",
    );
    expect(callGroupsUpdater(args, [createHabitGroup("group-old")])).toEqual([
      createdGroup,
      createHabitGroup("group-old"),
    ]);
  });

  it("updates group in edit mode", async () => {
    const updatedGroup = createHabitGroup("group-1", { name: "Updated group" });
    updateHabitGroupForUserMock.mockResolvedValue(updatedGroup);
    const args = createArgs({
      editorState: {
        groupFormValues: createHabitGroupFormValues({
          name: " Edit group form ",
          habitIds: ["habit-1"],
        }),
        groupEditorMode: "edit",
        editingGroupId: "group-1",
        finalizeGroupSave: jest.fn(),
        clearGroupReferencesAfterDelete: jest.fn(),
      },
    });
    const normalizedValues = normalizeHabitGroupFormValues(args.editorState.groupFormValues);

    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    await act(async () => {
      await result.current.handleSaveGroup();
    });

    expect(updateHabitGroupForUserMock).toHaveBeenCalledWith("user-1", "group-1", normalizedValues);
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Group updated",
      "Group changes have been saved.",
    );
  });

  it("handles save failure", async () => {
    createHabitGroupForUserMock.mockRejectedValue(new Error("save group failed"));
    const args = createArgs();
    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    let isSuccess = true;
    await act(async () => {
      isSuccess = await result.current.handleSaveGroup();
    });

    expect(isSuccess).toBe(false);
    expect(args.setErrorMessage).toHaveBeenLastCalledWith("save group failed");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to save group", "save group failed");
  });

  it("deletes group successfully", async () => {
    deleteHabitGroupForUserMock.mockResolvedValue(undefined);
    const args = createArgs();
    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    await act(async () => {
      await result.current.handleDeleteGroup("group-1");
    });

    expect(deleteHabitGroupForUserMock).toHaveBeenCalledWith("user-1", "group-1");
    expect(callGroupsUpdater(args, [createHabitGroup("group-1"), createHabitGroup("group-2")])).toEqual([
      createHabitGroup("group-2"),
    ]);
    expect(args.editorState.clearGroupReferencesAfterDelete).toHaveBeenCalledWith("group-1");
    expect(args.syncAchievements).toHaveBeenCalledTimes(1);
    expect(showSuccessToastMock).toHaveBeenCalledWith("Group deleted", "Group removed successfully.");
  });

  it("handles delete failure", async () => {
    deleteHabitGroupForUserMock.mockRejectedValue(new Error("delete group failed"));
    const args = createArgs();
    const { result } = renderHook(() => useHabitGroupMutationActions(args));

    await act(async () => {
      await result.current.handleDeleteGroup("group-1");
    });

    expect(args.setErrorMessage).toHaveBeenLastCalledWith("delete group failed");
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Unable to delete group",
      "delete group failed",
    );
  });
});
