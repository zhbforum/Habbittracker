import { act, renderHook } from "@testing-library/react-native";

import {
  createDefaultHabitFormValues,
  toHabitFormValues,
} from "@features/habits/model/formValues";
import { createHabit } from "@/test/fixtures/habits";

import { useHabitItemEditorState } from "../useHabitItemEditorState";

describe("useHabitItemEditorState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-11T09:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes with default form values", () => {
    const habit = createHabit("habit-1", { name: "Raw habit" });
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitItemEditorState({
        habits: [habit],
        isSaving: false,
        setErrorMessage,
      }),
    );

    expect(result.current.isEditorOpen).toBe(false);
    expect(result.current.isDetailsOpen).toBe(false);
    expect(result.current.editorMode).toBe("create");
    expect(result.current.editingHabitId).toBeNull();
    expect(result.current.selectedHabitId).toBeNull();
    expect(result.current.formValues).toEqual(createDefaultHabitFormValues());
  });

  it("updates fields and toggles custom weekday add/remove", () => {
    const habit = createHabit("habit-1");
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitItemEditorState({
        habits: [habit],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.setFormField("name", "Updated name");
    });
    expect(result.current.formValues.name).toBe("Updated name");

    act(() => {
      result.current.toggleCustomWeekday(3);
    });
    expect(result.current.formValues.customWeekdays).toEqual([1, 5]);

    act(() => {
      result.current.toggleCustomWeekday(2);
    });
    expect(result.current.formValues.customWeekdays).toEqual([1, 2, 5]);
  });

  it("opens create editor and resets values", () => {
    const habit = createHabit("habit-1");
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitItemEditorState({
        habits: [habit],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openCreateHabit();
    });

    expect(result.current.isEditorOpen).toBe(true);
    expect(result.current.editorMode).toBe("create");
    expect(result.current.editingHabitId).toBeNull();
    expect(result.current.formValues).toEqual(createDefaultHabitFormValues());
    expect(setErrorMessage).toHaveBeenCalledWith(null);
  });

  it("opens edit editor for existing habit only", () => {
    const habit = createHabit("habit-1", {
      name: "Edited habit",
      frequency: "custom",
      customWeekdays: [2, 4],
    });
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitItemEditorState({
        habits: [habit],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openEditHabit("missing");
    });
    expect(result.current.isEditorOpen).toBe(false);

    act(() => {
      result.current.openEditHabit("habit-1");
    });

    expect(result.current.isEditorOpen).toBe(true);
    expect(result.current.editorMode).toBe("edit");
    expect(result.current.editingHabitId).toBe("habit-1");
    expect(result.current.formValues).toEqual(toHabitFormValues(habit));
    expect(setErrorMessage).toHaveBeenCalledWith(null);
  });

  it("handles details/editor close rules and finalize", () => {
    const habit = createHabit("habit-1");
    const setErrorMessage = jest.fn();

    const { result, rerender } = renderHook(
      (props: { isSaving: boolean }) =>
        useHabitItemEditorState({
          habits: [habit],
          isSaving: props.isSaving,
          setErrorMessage,
        }),
      {
        initialProps: { isSaving: false },
      },
    );

    act(() => {
      result.current.openHabitDetails("habit-1");
      result.current.openCreateHabit();
    });
    expect(result.current.isDetailsOpen).toBe(true);
    expect(result.current.selectedHabitId).toBe("habit-1");
    expect(result.current.isEditorOpen).toBe(true);

    rerender({ isSaving: true });
    act(() => {
      result.current.closeEditor();
    });
    expect(result.current.isEditorOpen).toBe(true);

    rerender({ isSaving: false });
    act(() => {
      result.current.closeEditor();
      result.current.closeDetails();
    });
    expect(result.current.isEditorOpen).toBe(false);
    expect(result.current.isDetailsOpen).toBe(false);

    act(() => {
      result.current.openCreateHabit();
      result.current.finalizeHabitSave();
    });
    expect(result.current.isEditorOpen).toBe(false);
  });

  it("clears references after delete only for matching habit id", () => {
    const habit = createHabit("habit-1");
    const setErrorMessage = jest.fn();

    const { result } = renderHook(() =>
      useHabitItemEditorState({
        habits: [habit],
        isSaving: false,
        setErrorMessage,
      }),
    );

    act(() => {
      result.current.openHabitDetails("habit-1");
      result.current.openEditHabit("habit-1");
    });
    expect(result.current.selectedHabitId).toBe("habit-1");
    expect(result.current.editingHabitId).toBe("habit-1");

    act(() => {
      result.current.clearHabitReferencesAfterDelete("habit-2");
    });
    expect(result.current.selectedHabitId).toBe("habit-1");
    expect(result.current.editingHabitId).toBe("habit-1");

    act(() => {
      result.current.clearHabitReferencesAfterDelete("habit-1");
    });
    expect(result.current.isEditorOpen).toBe(false);
    expect(result.current.isDetailsOpen).toBe(false);
    expect(result.current.selectedHabitId).toBeNull();
    expect(result.current.editingHabitId).toBeNull();
  });
});
