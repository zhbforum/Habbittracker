import { useCallback } from "react";

import {
  createHabitForUser,
  deleteHabitForUser,
  setHabitProgressForDate,
  toggleHabitCompletionForDate,
  updateHabitForUser,
} from "@entities/habit/api/habitStorage";
import { toDateKey } from "@entities/habit/model/date";
import { clampGroupDailyGoal } from "@entities/habit/model/groupValidators";
import { validateHabitForm } from "@entities/habit/model/validators";
import { removeHabitFromGroupsForUser } from "@features/habits/services/habitGroupStorageService";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import type {
  HabitsMutationEditorState,
  HabitsMutationSharedArgs,
} from "./habitsMutation.types";

type UseHabitItemMutationActionsArgs = HabitsMutationSharedArgs & {
  editorState: Pick<
    HabitsMutationEditorState,
    | "formValues"
    | "editorMode"
    | "editingHabitId"
    | "finalizeHabitSave"
    | "clearHabitReferencesAfterDelete"
  >;
};

export function useHabitItemMutationActions({
  userId,
  syncAchievements,
  setIsSaving,
  setErrorMessage,
  setHabits,
  setGroups,
  editorState,
}: UseHabitItemMutationActionsArgs) {
  const handleSaveHabit = useCallback(async () => {
    const formError = validateHabitForm(editorState.formValues);

    if (formError) {
      setErrorMessage(formError);
      showErrorToast("Check habit details", formError);
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editorState.editorMode === "create") {
        const createdHabit = await createHabitForUser(userId, editorState.formValues);
        setHabits((currentHabits) => [createdHabit, ...currentHabits]);
        syncAchievements();
        showSuccessToast("Habit created", "Your new habit is ready to track.");
      } else if (editorState.editingHabitId) {
        const updatedHabit = await updateHabitForUser(
          userId,
          editorState.editingHabitId,
          editorState.formValues,
        );
        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
        );
        syncAchievements();
        showSuccessToast("Habit updated", "Changes have been saved.");
      }

      editorState.finalizeHabitSave();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save habit.");
      setErrorMessage(message);
      showErrorToast("Unable to save habit", message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    editorState,
    setErrorMessage,
    setHabits,
    setIsSaving,
    syncAchievements,
    userId,
  ]);

  const toggleTodayCompletion = useCallback(
    async (habitId: string) => {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        const updatedHabit = await toggleHabitCompletionForDate(
          userId,
          habitId,
          toDateKey(new Date()),
        );
        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
        );
        syncAchievements();
      } catch (error) {
        const message = getErrorMessage(error, "Unable to update habit progress.");
        setErrorMessage(message);
        showErrorToast("Unable to update progress", message);
      } finally {
        setIsSaving(false);
      }
    },
    [setErrorMessage, setHabits, setIsSaving, syncAchievements, userId],
  );

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        await deleteHabitForUser(userId, habitId);
        await removeHabitFromGroupsForUser(userId, habitId);

        setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
        setGroups((currentGroups) =>
          currentGroups.map((group) => {
            if (!group.habitIds.includes(habitId)) {
              return group;
            }

            const nextHabitIds = group.habitIds.filter(
              (currentHabitId) => currentHabitId !== habitId,
            );

            return {
              ...group,
              habitIds: nextHabitIds,
              dailyGoal: clampGroupDailyGoal(group.dailyGoal, nextHabitIds.length),
              updatedAt: new Date().toISOString(),
            };
          }),
        );

        editorState.clearHabitReferencesAfterDelete(habitId);
        syncAchievements();
        showSuccessToast("Habit deleted", "Habit and its history were removed.");
      } catch (error) {
        const message = getErrorMessage(error, "Unable to delete habit.");
        setErrorMessage(message);
        showErrorToast("Unable to delete habit", message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      editorState,
      setErrorMessage,
      setGroups,
      setHabits,
      setIsSaving,
      syncAchievements,
      userId,
    ],
  );

  const setTodayProgressValue = useCallback(
    async (habitId: string, value: number) => {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        const updatedHabit = await setHabitProgressForDate(
          userId,
          habitId,
          toDateKey(new Date()),
          value,
        );

        setHabits((currentHabits) =>
          currentHabits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)),
        );
        syncAchievements();
      } catch (error) {
        const message = getErrorMessage(error, "Unable to update habit progress.");
        setErrorMessage(message);
        showErrorToast("Unable to update progress", message);
      } finally {
        setIsSaving(false);
      }
    },
    [setErrorMessage, setHabits, setIsSaving, syncAchievements, userId],
  );

  return {
    handleSaveHabit,
    toggleTodayCompletion,
    handleDeleteHabit,
    setTodayProgressValue,
  };
}
