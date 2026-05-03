import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { resolveAndSyncAchievementsForUser } from "@entities/achievement";
import { buildHabitSummary, withHabitMetrics } from "@features/habits/model/analytics";
import { withHabitGroupMetrics } from "@features/habits/model/groupAnalytics";
import type { Habit, HabitGroup } from "@features/habits/model/types";
import { fetchHabitGroupsForUser } from "@features/habits/services/habitGroupStorageService";
import { fetchHabitsForUser } from "@features/habits/services/habitStorageService";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast } from "@shared/ui";

import { useHabitsEditorState } from "./useHabitsEditorState";
import { useHabitsMutationActions } from "./useHabitsMutationActions";

type UseHabitsScreenControllerArgs = {
  user: User;
};

export function useHabitsScreenController({ user }: UseHabitsScreenControllerArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<HabitGroup[]>([]);

  const syncAchievements = useCallback(() => {
    void resolveAndSyncAchievementsForUser(user.id).catch(() => undefined);
  }, [user.id]);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [loadedHabits, loadedGroups] = await Promise.all([
        fetchHabitsForUser(user.id),
        fetchHabitGroupsForUser(user.id),
      ]);

      setHabits(loadedHabits);
      setGroups(loadedGroups);
      syncAchievements();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load habits.");
      setErrorMessage(message);
      showErrorToast("Unable to load habits", message);
    } finally {
      setIsLoading(false);
    }
  }, [syncAchievements, user.id]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const habitsWithMetrics = useMemo(() => withHabitMetrics(habits), [habits]);
  const groupsWithMetrics = useMemo(
    () => withHabitGroupMetrics(groups, habitsWithMetrics),
    [groups, habitsWithMetrics],
  );
  const summary = useMemo(() => buildHabitSummary(habitsWithMetrics), [habitsWithMetrics]);

  const editorState = useHabitsEditorState({
    habits,
    groups,
    isSaving,
    setErrorMessage,
  });

  const selectedHabit = useMemo(
    () =>
      habitsWithMetrics.find((habit) => habit.id === editorState.selectedHabitId) || null,
    [editorState.selectedHabitId, habitsWithMetrics],
  );

  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editorState.editingHabitId) || null,
    [editorState.editingHabitId, habits],
  );

  const selectedGroup = useMemo(
    () =>
      groupsWithMetrics.find((group) => group.id === editorState.selectedGroupId) || null,
    [editorState.selectedGroupId, groupsWithMetrics],
  );

  const editingGroup = useMemo(
    () => groups.find((group) => group.id === editorState.editingGroupId) || null,
    [editorState.editingGroupId, groups],
  );

  const {
    handleSaveHabit,
    toggleTodayCompletion,
    handleDeleteHabit,
    handleSaveGroup,
    handleDeleteGroup,
    setTodayProgressValue,
  } = useHabitsMutationActions({
    userId: user.id,
    syncAchievements,
    setIsSaving,
    setErrorMessage,
    setHabits,
    setGroups,
    editorState: {
      formValues: editorState.formValues,
      editorMode: editorState.editorMode,
      editingHabitId: editorState.editingHabitId,
      groupFormValues: editorState.groupFormValues,
      groupEditorMode: editorState.groupEditorMode,
      editingGroupId: editorState.editingGroupId,
      finalizeHabitSave: editorState.finalizeHabitSave,
      finalizeGroupSave: editorState.finalizeGroupSave,
      clearHabitReferencesAfterDelete: editorState.clearHabitReferencesAfterDelete,
      clearGroupReferencesAfterDelete: editorState.clearGroupReferencesAfterDelete,
    },
  });

  return useMemo(
    () => ({
      isLoading,
      isSaving,
      errorMessage,
      habits: habitsWithMetrics,
      groups: groupsWithMetrics,
      summary,
      selectedHabit,
      selectedGroup,
      editingHabit,
      editingGroup,
      isEditorOpen: editorState.isEditorOpen,
      isDetailsOpen: editorState.isDetailsOpen,
      isGroupEditorOpen: editorState.isGroupEditorOpen,
      isGroupDetailsOpen: editorState.isGroupDetailsOpen,
      editorMode: editorState.editorMode,
      groupEditorMode: editorState.groupEditorMode,
      formValues: editorState.formValues,
      groupFormValues: editorState.groupFormValues,
      setFormField: editorState.setFormField,
      setGroupFormField: editorState.setGroupFormField,
      toggleCustomWeekday: editorState.toggleCustomWeekday,
      toggleHabitInGroupForm: editorState.toggleHabitInGroupForm,
      openCreateHabit: editorState.openCreateHabit,
      openEditHabit: editorState.openEditHabit,
      openHabitDetails: editorState.openHabitDetails,
      openCreateGroup: editorState.openCreateGroup,
      openEditGroup: editorState.openEditGroup,
      openGroupDetails: editorState.openGroupDetails,
      closeEditor: editorState.closeEditor,
      closeDetails: editorState.closeDetails,
      closeGroupEditor: editorState.closeGroupEditor,
      closeGroupDetails: editorState.closeGroupDetails,
      handleSaveHabit,
      handleSaveGroup,
      toggleTodayCompletion,
      setTodayProgressValue,
      handleDeleteHabit,
      handleDeleteGroup,
      reload: loadHabits,
    }),
    [
      editingGroup,
      editingHabit,
      editorState,
      errorMessage,
      groupsWithMetrics,
      habitsWithMetrics,
      handleDeleteGroup,
      handleDeleteHabit,
      handleSaveGroup,
      handleSaveHabit,
      isLoading,
      isSaving,
      loadHabits,
      selectedGroup,
      selectedHabit,
      setTodayProgressValue,
      summary,
      toggleTodayCompletion,
    ],
  );
}
