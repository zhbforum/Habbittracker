import { act, renderHook } from "@testing-library/react-native";

import { toDateKey } from "@entities/habit/model/date";
import { createHabit, createHabitFormValues } from "@/test/fixtures/habits";
import {
  callHabitsUpdater,
  createArgs,
  createHabitForUserMock,
  showErrorToastMock,
  showSuccessToastMock,
  toggleHabitCompletionForDateMock,
  updateHabitForUserMock,
  useHabitItemMutationActions,
} from "../testUtils/useHabitItemMutationActionsTestSetup";

describe("useHabitItemMutationActions (save and toggle)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns validation error for invalid habit form", async () => {
    const args = createArgs({
      editorState: {
        formValues: createHabitFormValues({ name: "" }),
        editorMode: "create",
        editingHabitId: null,
        finalizeHabitSave: jest.fn(),
        clearHabitReferencesAfterDelete: jest.fn(),
      },
    });

    const { result } = renderHook(() => useHabitItemMutationActions(args));

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.handleSaveHabit();
    });

    expect(isSuccess).toBe(false);
    const validationMessage = (args.setErrorMessage as jest.Mock).mock.calls[0]?.[0];
    expect(typeof validationMessage).toBe("string");
    expect(showErrorToastMock).toHaveBeenCalledWith("Check habit details", validationMessage);
    expect(args.setIsSaving).not.toHaveBeenCalled();
  });

  it("creates habit successfully", async () => {
    const createdHabit = createHabit("habit-new", { name: "Created" });
    createHabitForUserMock.mockResolvedValue(createdHabit);
    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.handleSaveHabit();
    });

    expect(isSuccess).toBe(true);
    expect(createHabitForUserMock).toHaveBeenCalledWith("user-1", args.editorState.formValues);
    expect(args.setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(args.setErrorMessage).toHaveBeenNthCalledWith(1, null);
    expect(args.editorState.finalizeHabitSave).toHaveBeenCalledTimes(1);
    expect(args.syncAchievements).toHaveBeenCalledTimes(1);
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Habit created",
      "Your new habit is ready to track.",
    );
    expect(callHabitsUpdater(args, [createHabit("existing")])).toEqual([
      createdHabit,
      createHabit("existing"),
    ]);
  });

  it("updates habit successfully in edit mode", async () => {
    const updatedHabit = createHabit("habit-1", { name: "Updated" });
    updateHabitForUserMock.mockResolvedValue(updatedHabit);
    const args = createArgs({
      editorState: {
        formValues: createHabitFormValues({ name: "Edit form" }),
        editorMode: "edit",
        editingHabitId: "habit-1",
        finalizeHabitSave: jest.fn(),
        clearHabitReferencesAfterDelete: jest.fn(),
      },
    });
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    await act(async () => {
      await result.current.handleSaveHabit();
    });

    expect(updateHabitForUserMock).toHaveBeenCalledWith(
      "user-1",
      "habit-1",
      args.editorState.formValues,
    );

    expect(
      callHabitsUpdater(args, [
        createHabit("habit-1", { name: "Old" }),
        createHabit("habit-2", { name: "Other" }),
      ]),
    ).toEqual([updatedHabit, createHabit("habit-2", { name: "Other" })]);
    expect(showSuccessToastMock).toHaveBeenCalledWith("Habit updated", "Changes have been saved.");
  });

  it("handles save failure and returns false", async () => {
    createHabitForUserMock.mockRejectedValue(new Error("save failed"));
    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    let isSuccess = true;
    await act(async () => {
      isSuccess = await result.current.handleSaveHabit();
    });

    expect(isSuccess).toBe(false);
    expect(args.setErrorMessage).toHaveBeenLastCalledWith("save failed");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to save habit", "save failed");
  });

  it("toggles today completion successfully", async () => {
    const updatedHabit = createHabit("habit-1", { name: "Updated completion" });
    toggleHabitCompletionForDateMock.mockResolvedValue(updatedHabit);
    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    await act(async () => {
      await result.current.toggleTodayCompletion("habit-1");
    });

    expect(toggleHabitCompletionForDateMock).toHaveBeenCalledWith(
      "user-1",
      "habit-1",
      toDateKey(new Date()),
    );

    expect(
      callHabitsUpdater(args, [
        createHabit("habit-1", { name: "Old" }),
        createHabit("habit-2", { name: "Other" }),
      ]),
    ).toEqual([updatedHabit, createHabit("habit-2", { name: "Other" })]);
    expect(args.syncAchievements).toHaveBeenCalledTimes(1);
  });
});
