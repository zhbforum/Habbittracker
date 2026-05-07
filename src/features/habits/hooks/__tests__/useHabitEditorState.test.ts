import { act, renderHook } from "@testing-library/react-native";

import { createHabitFormValues } from "@/test/fixtures/habits";

import { useHabitEditorState } from "../useHabitEditorState";

describe("useHabitEditorState", () => {
  it("Given goal metric switches to value with empty or times unit, When selecting value metric, Then it normalizes goal unit to units", () => {
    const onFieldChange = jest.fn();

    const { result } = renderHook(() =>
      useHabitEditorState({
        mode: "create",
        isSaving: false,
        values: createHabitFormValues({
          goalUnit: "times",
        }),
        onFieldChange,
      }),
    );

    act(() => {
      result.current.handleGoalMetricSelect("value");
    });

    expect(onFieldChange).toHaveBeenNthCalledWith(1, "goalMetric", "value");
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "goalUnit", "units");
  });

  it("Given goal metric switches to checkins with empty or units unit, When selecting checkins metric, Then it normalizes goal unit to times", () => {
    const onFieldChange = jest.fn();

    const { result } = renderHook(() =>
      useHabitEditorState({
        mode: "edit",
        isSaving: false,
        values: createHabitFormValues({
          goalUnit: "units",
        }),
        onFieldChange,
      }),
    );

    act(() => {
      result.current.handleGoalMetricSelect("checkins");
    });

    expect(onFieldChange).toHaveBeenNthCalledWith(1, "goalMetric", "checkins");
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "goalUnit", "times");
  });

  it("Given non-default goal unit, When metric changes, Then it keeps existing goal unit unchanged", () => {
    const onFieldChange = jest.fn();

    const { result } = renderHook(() =>
      useHabitEditorState({
        mode: "edit",
        isSaving: false,
        values: createHabitFormValues({
          goalUnit: "minutes",
        }),
        onFieldChange,
      }),
    );

    act(() => {
      result.current.handleGoalMetricSelect("value");
    });

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith("goalMetric", "value");
  });

  it("Given goal target text input, When parsing decimal or invalid values, Then it writes normalized numeric goal target", () => {
    const onFieldChange = jest.fn();

    const { result } = renderHook(() =>
      useHabitEditorState({
        mode: "create",
        isSaving: false,
        values: createHabitFormValues(),
        onFieldChange,
      }),
    );

    act(() => {
      result.current.handleGoalTargetChange("3,5");
      result.current.handleGoalTargetChange("not-a-number");
    });

    expect(onFieldChange).toHaveBeenNthCalledWith(1, "goalTarget", 3.5);
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "goalTarget", 0);
  });

  it("Given save state and mode combinations, When reading hook output, Then it resolves expected save button labels", () => {
    const onFieldChange = jest.fn();

    const createIdle = renderHook(() =>
      useHabitEditorState({
        mode: "create",
        isSaving: false,
        values: createHabitFormValues(),
        onFieldChange,
      }),
    );
    const createSaving = renderHook(() =>
      useHabitEditorState({
        mode: "create",
        isSaving: true,
        values: createHabitFormValues(),
        onFieldChange,
      }),
    );
    const editIdle = renderHook(() =>
      useHabitEditorState({
        mode: "edit",
        isSaving: false,
        values: createHabitFormValues(),
        onFieldChange,
      }),
    );
    const editSaving = renderHook(() =>
      useHabitEditorState({
        mode: "edit",
        isSaving: true,
        values: createHabitFormValues(),
        onFieldChange,
      }),
    );

    expect(createIdle.result.current.saveButtonLabel).toBe("Create");
    expect(createSaving.result.current.saveButtonLabel).toBe("Creating...");
    expect(editIdle.result.current.saveButtonLabel).toBe("Save");
    expect(editSaving.result.current.saveButtonLabel).toBe("Saving...");
  });

  it("Given reminder picker state setter, When toggling reminder picker flag, Then hook exposes updated local open state", () => {
    const { result } = renderHook(() =>
      useHabitEditorState({
        mode: "create",
        isSaving: false,
        values: createHabitFormValues(),
        onFieldChange: jest.fn(),
      }),
    );

    expect(result.current.isReminderPickerOpen).toBe(false);

    act(() => {
      result.current.setIsReminderPickerOpen(true);
    });

    expect(result.current.isReminderPickerOpen).toBe(true);
  });
});
