import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { useHomeFooterNavigation } from "@/features/home/hooks/useHomeFooterNavigation";

import { useHabitsScreenController } from "./useHabitsScreenController";

type UseHabitsScreenViewModelArgs = {
  user: User;
};

export function useHabitsScreenViewModel({ user }: UseHabitsScreenViewModelArgs) {
  const { activeTab, handleTabPress } = useHomeFooterNavigation("habits");
  const [pendingUndoHabitId, setPendingUndoHabitId] = useState<string | null>(null);

  const {
    isLoading,
    isSaving,
    errorMessage,
    habits,
    summary,
    selectedHabit,
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
    reload,
  } = useHabitsScreenController({
    user,
  });

  const pendingUndoHabit =
    habits.find((habit) => habit.id === pendingUndoHabitId) ?? null;

  const handleToggleTodayPress = useCallback(
    (habitId: string) => {
      const habit = habits.find((item) => item.id === habitId);

      if (!habit || isSaving) {
        return;
      }

      if (habit.metrics.completedToday) {
        setPendingUndoHabitId(habitId);
        return;
      }

      void toggleTodayCompletion(habitId);
    },
    [habits, isSaving, toggleTodayCompletion],
  );

  const closeUndoDialog = useCallback(() => {
    setPendingUndoHabitId(null);
  }, []);

  const handleConfirmUndoCompletion = useCallback(() => {
    if (!pendingUndoHabitId || isSaving) {
      return;
    }

    const habitId = pendingUndoHabitId;
    setPendingUndoHabitId(null);
    void toggleTodayCompletion(habitId);
  }, [isSaving, pendingUndoHabitId, toggleTodayCompletion]);

  const handleEditFromDetails = useCallback(
    (habitId: string) => {
      closeDetails();
      openEditHabit(habitId);
    },
    [closeDetails, openEditHabit],
  );

  return useMemo(
    () => ({
      activeTab,
      handleTabPress,
      isLoading,
      isSaving,
      errorMessage,
      habits,
      summary,
      selectedHabit,
      isEditorOpen,
      isDetailsOpen,
      editorMode,
      formValues,
      pendingUndoHabitId,
      pendingUndoHabit,
      isUndoDialogOpen: pendingUndoHabitId !== null,
      setFormField,
      toggleCustomWeekday,
      openCreateHabit,
      openEditHabit,
      openHabitDetails,
      closeEditor,
      closeDetails,
      handleSaveHabit,
      handleDeleteHabit,
      handleToggleTodayPress,
      handleConfirmUndoCompletion,
      handleEditFromDetails,
      closeUndoDialog,
      reload,
    }),
    [
      activeTab,
      closeDetails,
      closeEditor,
      closeUndoDialog,
      editorMode,
      errorMessage,
      formValues,
      habits,
      handleConfirmUndoCompletion,
      handleDeleteHabit,
      handleEditFromDetails,
      handleSaveHabit,
      handleTabPress,
      handleToggleTodayPress,
      isDetailsOpen,
      isEditorOpen,
      isLoading,
      isSaving,
      openCreateHabit,
      openEditHabit,
      openHabitDetails,
      pendingUndoHabit,
      pendingUndoHabitId,
      reload,
      selectedHabit,
      setFormField,
      summary,
      toggleCustomWeekday,
    ],
  );
}
