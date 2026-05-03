import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";

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
    groups,
    summary,
    selectedHabit,
    selectedGroup,
    isEditorOpen,
    isDetailsOpen,
    isGroupEditorOpen,
    isGroupDetailsOpen,
    editorMode,
    groupEditorMode,
    formValues,
    groupFormValues,
    setFormField,
    setGroupFormField,
    toggleCustomWeekday,
    toggleHabitInGroupForm,
    openCreateHabit,
    openEditHabit,
    openHabitDetails,
    openCreateGroup,
    openEditGroup,
    openGroupDetails,
    closeEditor,
    closeDetails,
    closeGroupEditor,
    closeGroupDetails,
    handleSaveHabit,
    handleSaveGroup,
    toggleTodayCompletion,
    setTodayProgressValue,
    handleDeleteHabit,
    handleDeleteGroup,
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

  const handleEditGroupFromDetails = useCallback(
    (groupId: string) => {
      closeGroupDetails();
      openEditGroup(groupId);
    },
    [closeGroupDetails, openEditGroup],
  );

  return useMemo(
    () => ({
      activeTab,
      handleTabPress,
      isLoading,
      isSaving,
      errorMessage,
      habits,
      groups,
      summary,
      selectedHabit,
      selectedGroup,
      isEditorOpen,
      isDetailsOpen,
      isGroupEditorOpen,
      isGroupDetailsOpen,
      editorMode,
      groupEditorMode,
      formValues,
      groupFormValues,
      pendingUndoHabitId,
      pendingUndoHabit,
      isUndoDialogOpen: pendingUndoHabitId !== null,
      setFormField,
      setGroupFormField,
      toggleCustomWeekday,
      toggleHabitInGroupForm,
      openCreateHabit,
      openEditHabit,
      openHabitDetails,
      openCreateGroup,
      openEditGroup,
      openGroupDetails,
      closeEditor,
      closeDetails,
      closeGroupEditor,
      closeGroupDetails,
      handleSaveHabit,
      handleSaveGroup,
      handleDeleteHabit,
      handleDeleteGroup,
      handleToggleTodayPress,
      setTodayProgressValue,
      handleConfirmUndoCompletion,
      handleEditFromDetails,
      handleEditGroupFromDetails,
      closeUndoDialog,
      reload,
    }),
    [
      activeTab,
      closeDetails,
      closeEditor,
      closeGroupDetails,
      closeGroupEditor,
      closeUndoDialog,
      editorMode,
      errorMessage,
      formValues,
      groupEditorMode,
      groupFormValues,
      groups,
      habits,
      handleConfirmUndoCompletion,
      handleDeleteGroup,
      handleDeleteHabit,
      handleEditGroupFromDetails,
      handleEditFromDetails,
      handleSaveGroup,
      handleSaveHabit,
      setTodayProgressValue,
      handleTabPress,
      handleToggleTodayPress,
      isGroupDetailsOpen,
      isGroupEditorOpen,
      isDetailsOpen,
      isEditorOpen,
      isLoading,
      isSaving,
      openCreateGroup,
      openCreateHabit,
      openEditGroup,
      openEditHabit,
      openGroupDetails,
      openHabitDetails,
      pendingUndoHabit,
      pendingUndoHabitId,
      reload,
      selectedGroup,
      selectedHabit,
      setGroupFormField,
      setFormField,
      summary,
      toggleHabitInGroupForm,
      toggleCustomWeekday,
    ],
  );
}

