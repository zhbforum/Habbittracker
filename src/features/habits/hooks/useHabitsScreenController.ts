import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getErrorMessage } from "@/shared/lib";
import { showErrorToast, showSuccessToast } from "@/shared/ui";

import { buildHabitSummary, withHabitMetrics } from "../model/analytics";
import { DEFAULT_HABIT_FORM_VALUES } from "../model/constants";
import { toDateKey } from "../model/date";
import type { Habit, HabitFormValues } from "../model/types";
import { validateHabitForm } from "../model/validators";
import {
  createHabitForUser,
  deleteHabitForUser,
  fetchHabitsForUser,
  toggleHabitCompletionForDate,
  updateHabitForUser,
} from "../services/habitStorageService";

type UseHabitsScreenControllerArgs = {
  user: User;
};

function toFormValues(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    kind: habit.kind,
    frequency: habit.frequency,
    reminderTime: habit.reminderTime,
    iconId: habit.iconId,
    iconColorId: habit.iconColorId,
    weeklyWeekday: habit.weeklyWeekday,
    customWeekdays: habit.customWeekdays,
  };
}

function createDefaultFormValues(): HabitFormValues {
  const todayWeekday = new Date().getDay();

  return {
    ...DEFAULT_HABIT_FORM_VALUES,
    weeklyWeekday: todayWeekday as HabitFormValues["weeklyWeekday"],
  };
}

export function useHabitsScreenController({ user }: UseHabitsScreenControllerArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<HabitFormValues>(createDefaultFormValues);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loadedHabits = await fetchHabitsForUser(user.id);
      setHabits(loadedHabits);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load habits.");
      setErrorMessage(message);
      showErrorToast("Unable to load habits", message);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const habitsWithMetrics = useMemo(() => withHabitMetrics(habits), [habits]);

  const summary = useMemo(() => buildHabitSummary(habitsWithMetrics), [habitsWithMetrics]);

  const selectedHabit = useMemo(
    () => habitsWithMetrics.find((habit) => habit.id === selectedHabitId) || null,
    [habitsWithMetrics, selectedHabitId],
  );

  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editingHabitId) || null,
    [editingHabitId, habits],
  );

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
    setFormValues(createDefaultFormValues());
    setErrorMessage(null);
    setIsEditorOpen(true);
  }, []);

  const openEditHabit = useCallback((habitId: string) => {
    const targetHabit = habits.find((habit) => habit.id === habitId);

    if (!targetHabit) {
      return;
    }

    setEditorMode("edit");
    setEditingHabitId(habitId);
    setFormValues(toFormValues(targetHabit));
    setErrorMessage(null);
    setIsEditorOpen(true);
  }, [habits]);

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

  const handleSaveHabit = useCallback(async () => {
    const formError = validateHabitForm(formValues);

    if (formError) {
      setErrorMessage(formError);
      showErrorToast("Check habit details", formError);
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editorMode === "create") {
        const createdHabit = await createHabitForUser(user.id, formValues);
        setHabits((currentHabits) => [createdHabit, ...currentHabits]);
        showSuccessToast("Habit created", "Your new habit is ready to track.");
      } else if (editingHabitId) {
        const updatedHabit = await updateHabitForUser(user.id, editingHabitId, formValues);
        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
        );
        showSuccessToast("Habit updated", "Changes have been saved.");
      }

      setIsEditorOpen(false);
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save habit.");
      setErrorMessage(message);
      showErrorToast("Unable to save habit", message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [editorMode, editingHabitId, formValues, user.id]);

  const toggleTodayCompletion = useCallback(
    async (habitId: string) => {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        const updatedHabit = await toggleHabitCompletionForDate(
          user.id,
          habitId,
          toDateKey(new Date()),
        );
        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
        );
      } catch (error) {
        const message = getErrorMessage(error, "Unable to update habit progress.");
        setErrorMessage(message);
        showErrorToast("Unable to update progress", message);
      } finally {
        setIsSaving(false);
      }
    },
    [user.id],
  );

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await deleteHabitForUser(user.id, habitId);
      setHabits((currentHabits) =>
        currentHabits.filter((habit) => habit.id !== habitId),
      );

      setIsDetailsOpen(false);
      setIsEditorOpen(false);
      setSelectedHabitId((currentValue) => (currentValue === habitId ? null : currentValue));
      setEditingHabitId((currentValue) => (currentValue === habitId ? null : currentValue));
      showSuccessToast("Habit deleted", "Habit and its history were removed.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete habit.");
      setErrorMessage(message);
      showErrorToast("Unable to delete habit", message);
    } finally {
      setIsSaving(false);
    }
  }, [user.id]);

  return useMemo(
    () => ({
      isLoading,
      isSaving,
      errorMessage,
      habits: habitsWithMetrics,
      summary,
      selectedHabit,
      editingHabit,
      isEditorOpen,
      isDetailsOpen,
      editorMode,
      formValues,
      setFormField,
      toggleCustomWeekday,
      openCreateHabit,
      openEditHabit,
      openHabitDetails,
      closeEditor,
      closeDetails,
      handleSaveHabit,
      toggleTodayCompletion,
      handleDeleteHabit,
      reload: loadHabits,
    }),
    [
      closeDetails,
      closeEditor,
      editorMode,
      editingHabit,
      errorMessage,
      formValues,
      habitsWithMetrics,
      handleDeleteHabit,
      handleSaveHabit,
      isDetailsOpen,
      isEditorOpen,
      isLoading,
      isSaving,
      loadHabits,
      openCreateHabit,
      openEditHabit,
      openHabitDetails,
      selectedHabit,
      setFormField,
      summary,
      toggleCustomWeekday,
      toggleTodayCompletion,
    ],
  );
}
