import { act, renderHook } from "@testing-library/react-native";

import {
  createDefaultHabitGroupEditorFormValues,
  toHabitGroupFormValues,
} from "@features/habits/model/formValues";
import { createHabitGroup } from "@/test/fixtures/habits";

import { useHabitGroupEditorState } from "../useHabitGroupEditorState";

describe("useHabitGroupEditorState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-11T09:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes with default group form values", () => {
    const group = createHabitGroup("group-1", { name: "Raw group" });
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitGroupEditorState({
        groups: [group],
        isSaving: false,
        setErrorMessage,
      }),
    );

    expect(result.current.isGroupEditorOpen).toBe(false);
    expect(result.current.isGroupDetailsOpen).toBe(false);
    expect(result.current.groupEditorMode).toBe("create");
    expect(result.current.editingGroupId).toBeNull();
    expect(result.current.selectedGroupId).toBeNull();
    expect(result.current.groupFormValues).toEqual(createDefaultHabitGroupEditorFormValues());
  });

  it("updates field and toggles habit in group with clamped goal", () => {
    const group = createHabitGroup("group-1");
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitGroupEditorState({
        groups: [group],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.setGroupFormField("name", "Group updated");
    });
    expect(result.current.groupFormValues.name).toBe("Group updated");

    act(() => {
      result.current.setGroupFormField("dailyGoal", 2);
    });

    act(() => {
      result.current.toggleHabitInGroupForm("habit-1");
      result.current.toggleHabitInGroupForm("habit-2");
    });
    expect(result.current.groupFormValues.habitIds).toEqual(["habit-1", "habit-2"]);
    expect(result.current.groupFormValues.dailyGoal).toBe(1);

    act(() => {
      result.current.setGroupFormField("dailyGoal", 2);
    });
    expect(result.current.groupFormValues.dailyGoal).toBe(2);

    act(() => {
      result.current.toggleHabitInGroupForm("habit-1");
    });
    expect(result.current.groupFormValues.habitIds).toEqual(["habit-2"]);
    expect(result.current.groupFormValues.dailyGoal).toBe(1);
  });

  it("opens create and edit states correctly", () => {
    const group = createHabitGroup("group-1", {
      name: "Edited group",
      habitIds: ["habit-2", "habit-3"],
    });
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitGroupEditorState({
        groups: [group],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openCreateGroup();
    });
    expect(result.current.groupEditorMode).toBe("create");
    expect(result.current.editingGroupId).toBeNull();
    expect(result.current.isGroupEditorOpen).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith(null);

    act(() => {
      result.current.openEditGroup("missing");
    });
    expect(result.current.groupEditorMode).toBe("create");

    act(() => {
      result.current.openEditGroup("group-1");
    });
    expect(result.current.groupEditorMode).toBe("edit");
    expect(result.current.editingGroupId).toBe("group-1");
    expect(result.current.groupFormValues).toEqual(toHabitGroupFormValues(group));
  });

  it("handles details/editor close rules and finalize", () => {
    const group = createHabitGroup("group-1");
    const setErrorMessage = jest.fn();

    const { result, rerender } = renderHook(
      (props: { isSaving: boolean }) =>
        useHabitGroupEditorState({
          groups: [group],
          isSaving: props.isSaving,
          setErrorMessage,
        }),
      {
        initialProps: { isSaving: false },
      },
    );

    act(() => {
      result.current.openGroupDetails("group-1");
      result.current.openCreateGroup();
    });
    expect(result.current.isGroupDetailsOpen).toBe(true);
    expect(result.current.selectedGroupId).toBe("group-1");
    expect(result.current.isGroupEditorOpen).toBe(true);

    rerender({ isSaving: true });
    act(() => {
      result.current.closeGroupEditor();
    });
    expect(result.current.isGroupEditorOpen).toBe(true);

    rerender({ isSaving: false });
    act(() => {
      result.current.closeGroupEditor();
      result.current.closeGroupDetails();
    });
    expect(result.current.isGroupEditorOpen).toBe(false);
    expect(result.current.isGroupDetailsOpen).toBe(false);

    act(() => {
      result.current.openCreateGroup();
      result.current.finalizeGroupSave();
    });
    expect(result.current.isGroupEditorOpen).toBe(false);
  });

  it("clears references after delete only for matching group id", () => {
    const group = createHabitGroup("group-1");
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitGroupEditorState({
        groups: [group],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openGroupDetails("group-1");
      result.current.openEditGroup("group-1");
    });
    expect(result.current.selectedGroupId).toBe("group-1");
    expect(result.current.editingGroupId).toBe("group-1");

    act(() => {
      result.current.clearGroupReferencesAfterDelete("group-2");
    });
    expect(result.current.selectedGroupId).toBe("group-1");
    expect(result.current.editingGroupId).toBe("group-1");

    act(() => {
      result.current.clearGroupReferencesAfterDelete("group-1");
    });
    expect(result.current.isGroupEditorOpen).toBe(false);
    expect(result.current.isGroupDetailsOpen).toBe(false);
    expect(result.current.selectedGroupId).toBeNull();
    expect(result.current.editingGroupId).toBeNull();
  });
});
