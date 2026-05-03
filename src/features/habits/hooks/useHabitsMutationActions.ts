import { useHabitGroupMutationActions } from "./useHabitGroupMutationActions";
import { useHabitItemMutationActions } from "./useHabitItemMutationActions";
import type {
  HabitsMutationEditorState,
  HabitsMutationSharedArgs,
} from "./habitsMutation.types";

type UseHabitsMutationActionsArgs = HabitsMutationSharedArgs & {
  editorState: HabitsMutationEditorState;
};

export function useHabitsMutationActions({
  userId,
  syncAchievements,
  setIsSaving,
  setErrorMessage,
  setHabits,
  setGroups,
  editorState,
}: UseHabitsMutationActionsArgs) {
  const habitItemActions = useHabitItemMutationActions({
    userId,
    syncAchievements,
    setIsSaving,
    setErrorMessage,
    setHabits,
    setGroups,
    editorState: {
      formValues: editorState.formValues,
      editorMode: editorState.editorMode,
      editingHabitId: editorState.editingHabitId,
      finalizeHabitSave: editorState.finalizeHabitSave,
      clearHabitReferencesAfterDelete: editorState.clearHabitReferencesAfterDelete,
    },
  });

  const habitGroupActions = useHabitGroupMutationActions({
    userId,
    syncAchievements,
    setIsSaving,
    setErrorMessage,
    setGroups,
    editorState: {
      groupFormValues: editorState.groupFormValues,
      groupEditorMode: editorState.groupEditorMode,
      editingGroupId: editorState.editingGroupId,
      finalizeGroupSave: editorState.finalizeGroupSave,
      clearGroupReferencesAfterDelete: editorState.clearGroupReferencesAfterDelete,
    },
  });

  return {
    ...habitItemActions,
    ...habitGroupActions,
  };
}
