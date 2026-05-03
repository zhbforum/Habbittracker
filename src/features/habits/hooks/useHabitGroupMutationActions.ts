import { useCallback } from "react";

import {
  createHabitGroupForUser,
  deleteHabitGroupForUser,
  updateHabitGroupForUser,
} from "@entities/habit/api/habitGroupStorage";
import {
  normalizeHabitGroupFormValues,
  validateHabitGroupForm,
} from "@entities/habit/model/groupValidators";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import type {
  HabitsMutationEditorState,
  HabitsMutationSharedArgs,
} from "./habitsMutation.types";

type UseHabitGroupMutationActionsArgs = Pick<
  HabitsMutationSharedArgs,
  "userId" | "syncAchievements" | "setIsSaving" | "setErrorMessage" | "setGroups"
> & {
  editorState: Pick<
    HabitsMutationEditorState,
    | "groupFormValues"
    | "groupEditorMode"
    | "editingGroupId"
    | "finalizeGroupSave"
    | "clearGroupReferencesAfterDelete"
  >;
};

export function useHabitGroupMutationActions({
  userId,
  syncAchievements,
  setIsSaving,
  setErrorMessage,
  setGroups,
  editorState,
}: UseHabitGroupMutationActionsArgs) {
  const handleSaveGroup = useCallback(async () => {
    const normalizedValues = normalizeHabitGroupFormValues(editorState.groupFormValues);
    const formError = validateHabitGroupForm(normalizedValues);

    if (formError) {
      setErrorMessage(formError);
      showErrorToast("Check group details", formError);
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (editorState.groupEditorMode === "create") {
        const createdGroup = await createHabitGroupForUser(userId, normalizedValues);
        setGroups((currentGroups) => [createdGroup, ...currentGroups]);
        syncAchievements();
        showSuccessToast("Group created", "Your group is ready to track.");
      } else if (editorState.editingGroupId) {
        const updatedGroup = await updateHabitGroupForUser(
          userId,
          editorState.editingGroupId,
          normalizedValues,
        );
        setGroups((currentGroups) =>
          currentGroups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
        );
        syncAchievements();
        showSuccessToast("Group updated", "Group changes have been saved.");
      }

      editorState.finalizeGroupSave();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save group.");
      setErrorMessage(message);
      showErrorToast("Unable to save group", message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    editorState,
    setErrorMessage,
    setGroups,
    setIsSaving,
    syncAchievements,
    userId,
  ]);

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      setIsSaving(true);
      setErrorMessage(null);

      try {
        await deleteHabitGroupForUser(userId, groupId);
        setGroups((currentGroups) => currentGroups.filter((group) => group.id !== groupId));
        editorState.clearGroupReferencesAfterDelete(groupId);
        syncAchievements();
        showSuccessToast("Group deleted", "Group removed successfully.");
      } catch (error) {
        const message = getErrorMessage(error, "Unable to delete group.");
        setErrorMessage(message);
        showErrorToast("Unable to delete group", message);
      } finally {
        setIsSaving(false);
      }
    },
    [editorState, setErrorMessage, setGroups, setIsSaving, syncAchievements, userId],
  );

  return {
    handleSaveGroup,
    handleDeleteGroup,
  };
}
