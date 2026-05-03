import { useCallback, useState } from "react";

import { createDefaultHabitFormValues, toHabitFormValues } from "@features/habits/model/formValues";
import type { Habit, HabitFormValues } from "@features/habits/model/types";

type UseHabitItemEditorStateArgs = {
  habits: Habit[];
  isSaving: boolean;
  setErrorMessage: (message: string | null) => void;
};

export function useHabitItemEditorState({
  habits,
  isSaving,
  setErrorMessage,
}: UseHabitItemEditorStateArgs) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<HabitFormValues>(createDefaultHabitFormValues);

  const setFormField = useCallback(
    <K extends keyof HabitFormValues>(field: K, value: HabitFormValues[K]) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [],
  );

  const toggleCustomWeekday = useCallback((weekday: HabitFormValues["weeklyWeekday"]) => {
    setFormValues((currentValues) => {
      const hasWeekday = currentValues.customWeekdays.includes(weekday);

      if (hasWeekday) {
        return {
          ...currentValues,
          customWeekdays: currentValues.customWeekdays.filter((day) => day !== weekday),
        };
      }

      return {
        ...currentValues,
        customWeekdays: [...currentValues.customWeekdays, weekday].sort(
          (left, right) => left - right,
        ) as HabitFormValues["customWeekdays"],
      };
    });
  }, []);

  const openCreateHabit = useCallback(() => {
    setEditorMode("create");
    setEditingHabitId(null);
    setFormValues(createDefaultHabitFormValues());
    setErrorMessage(null);
    setIsEditorOpen(true);
  }, [setErrorMessage]);

  const openEditHabit = useCallback(
    (habitId: string) => {
      const targetHabit = habits.find((habit) => habit.id === habitId);

      if (!targetHabit) {
        return;
      }

      setEditorMode("edit");
      setEditingHabitId(habitId);
      setFormValues(toHabitFormValues(targetHabit));
      setErrorMessage(null);
      setIsEditorOpen(true);
    },
    [habits, setErrorMessage],
  );

  const openHabitDetails = useCallback((habitId: string) => {
    setSelectedHabitId(habitId);
    setIsDetailsOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    if (isSaving) {
      return;
    }

    setIsEditorOpen(false);
  }, [isSaving]);

  const closeDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  const finalizeHabitSave = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const clearHabitReferencesAfterDelete = useCallback((habitId: string) => {
    setIsDetailsOpen(false);
    setIsEditorOpen(false);
    setSelectedHabitId((currentValue) => (currentValue === habitId ? null : currentValue));
    setEditingHabitId((currentValue) => (currentValue === habitId ? null : currentValue));
  }, []);

  return {
    isEditorOpen,
    isDetailsOpen,
    editorMode,
    editingHabitId,
    selectedHabitId,
    formValues,
    setFormField,
    toggleCustomWeekday,
    openCreateHabit,
    openEditHabit,
    openHabitDetails,
    closeEditor,
    closeDetails,
    finalizeHabitSave,
    clearHabitReferencesAfterDelete,
  };
}
