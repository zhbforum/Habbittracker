import { act, renderHook } from "@testing-library/react-native";

import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { useHabitsEditorState } from "../useHabitsEditorState";

describe("useHabitsEditorState", () => {
  it("combines item and group editor behavior without mocking internal hooks", () => {
    const setErrorMessage = jest.fn();
    const { result } = renderHook(() =>
      useHabitsEditorState({
        habits: [createHabit("habit-1", { name: "Read books" })],
        groups: [createHabitGroup("group-1", { name: "Morning routine" })],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openCreateHabit();
      result.current.openCreateGroup();
    });

    expect(result.current.isEditorOpen).toBe(true);
    expect(result.current.isGroupEditorOpen).toBe(true);
    expect(result.current.editorMode).toBe("create");
    expect(result.current.groupEditorMode).toBe("create");
    expect(setErrorMessage).toHaveBeenCalledWith(null);

    act(() => {
      result.current.openEditHabit("habit-1");
      result.current.openEditGroup("group-1");
    });

    expect(result.current.editorMode).toBe("edit");
    expect(result.current.editingHabitId).toBe("habit-1");
    expect(result.current.groupEditorMode).toBe("edit");
    expect(result.current.editingGroupId).toBe("group-1");
  });
});
