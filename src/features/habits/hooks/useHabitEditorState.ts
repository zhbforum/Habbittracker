import { useCallback, useState } from "react";

import type { HabitFormValues } from "@features/habits/model/types";

type UseHabitEditorStateArgs = {
  mode: "create" | "edit";
  isSaving: boolean;
  values: HabitFormValues;
  onFieldChange: <K extends keyof HabitFormValues>(
    field: K,
    value: HabitFormValues[K],
  ) => void;
};

export function useHabitEditorState({
  mode,
  isSaving,
  values,
  onFieldChange,
}: UseHabitEditorStateArgs) {
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);

  const handleGoalMetricSelect = useCallback(
    (nextMetric: HabitFormValues["goalMetric"]) => {
      onFieldChange("goalMetric", nextMetric);

      if (
        nextMetric === "value" &&
        (values.goalUnit.trim().length === 0 || values.goalUnit === "times")
      ) {
        onFieldChange("goalUnit", "units");
      }

      if (
        nextMetric === "checkins" &&
        (values.goalUnit.trim().length === 0 || values.goalUnit === "units")
      ) {
        onFieldChange("goalUnit", "times");
      }
    },
    [onFieldChange, values.goalUnit],
  );

  const handleGoalTargetChange = useCallback(
    (value: string) => {
      const parsed = Number(value.replace(",", "."));
      onFieldChange("goalTarget", Number.isFinite(parsed) ? parsed : 0);
    },
    [onFieldChange],
  );

  const saveButtonLabel = isSaving
    ? mode === "create"
      ? "Creating..."
      : "Saving..."
    : mode === "create"
      ? "Create"
      : "Save";

  return {
    isReminderPickerOpen,
    setIsReminderPickerOpen,
    handleGoalMetricSelect,
    handleGoalTargetChange,
    saveButtonLabel,
  };
}
