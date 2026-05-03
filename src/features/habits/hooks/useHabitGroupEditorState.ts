import { useCallback, useState } from "react";

import { clampGroupDailyGoal } from "@features/habits/model/groupValidators";
import {
  createDefaultHabitGroupEditorFormValues,
  toHabitGroupFormValues,
} from "@features/habits/model/formValues";
import type { HabitGroup, HabitGroupFormValues } from "@features/habits/model/types";

type UseHabitGroupEditorStateArgs = {
  groups: HabitGroup[];
  isSaving: boolean;
  setErrorMessage: (message: string | null) => void;
};

export function useHabitGroupEditorState({
  groups,
  isSaving,
  setErrorMessage,
}: UseHabitGroupEditorStateArgs) {
  const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [groupEditorMode, setGroupEditorMode] = useState<"create" | "edit">("create");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupFormValues, setGroupFormValues] = useState<HabitGroupFormValues>(
    createDefaultHabitGroupEditorFormValues,
  );

  const setGroupFormField = useCallback(
    <K extends keyof HabitGroupFormValues>(field: K, value: HabitGroupFormValues[K]) => {
      setGroupFormValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [],
  );

  const toggleHabitInGroupForm = useCallback((habitId: string) => {
    setGroupFormValues((currentValues) => {
      const hasHabit = currentValues.habitIds.includes(habitId);
      const nextHabitIds = hasHabit
        ? currentValues.habitIds.filter((currentHabitId) => currentHabitId !== habitId)
        : [...currentValues.habitIds, habitId];

      return {
        ...currentValues,
        habitIds: nextHabitIds,
        dailyGoal: clampGroupDailyGoal(currentValues.dailyGoal, nextHabitIds.length),
      };
    });
  }, []);

  const openCreateGroup = useCallback(() => {
    setGroupEditorMode("create");
    setEditingGroupId(null);
    setGroupFormValues(createDefaultHabitGroupEditorFormValues());
    setErrorMessage(null);
    setIsGroupEditorOpen(true);
  }, [setErrorMessage]);

  const openEditGroup = useCallback(
    (groupId: string) => {
      const targetGroup = groups.find((group) => group.id === groupId);

      if (!targetGroup) {
        return;
      }

      setGroupEditorMode("edit");
      setEditingGroupId(groupId);
      setGroupFormValues(toHabitGroupFormValues(targetGroup));
      setErrorMessage(null);
      setIsGroupEditorOpen(true);
    },
    [groups, setErrorMessage],
  );

  const openGroupDetails = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setIsGroupDetailsOpen(true);
  }, []);

  const closeGroupEditor = useCallback(() => {
    if (isSaving) {
      return;
    }

    setIsGroupEditorOpen(false);
  }, [isSaving]);

  const closeGroupDetails = useCallback(() => {
    setIsGroupDetailsOpen(false);
  }, []);

  const finalizeGroupSave = useCallback(() => {
    setIsGroupEditorOpen(false);
  }, []);

  const clearGroupReferencesAfterDelete = useCallback((groupId: string) => {
    setIsGroupDetailsOpen(false);
    setIsGroupEditorOpen(false);
    setSelectedGroupId((currentId) => (currentId === groupId ? null : currentId));
    setEditingGroupId((currentId) => (currentId === groupId ? null : currentId));
  }, []);

  return {
    isGroupEditorOpen,
    isGroupDetailsOpen,
    groupEditorMode,
    editingGroupId,
    selectedGroupId,
    groupFormValues,
    setGroupFormField,
    toggleHabitInGroupForm,
    openCreateGroup,
    openEditGroup,
    openGroupDetails,
    closeGroupEditor,
    closeGroupDetails,
    finalizeGroupSave,
    clearGroupReferencesAfterDelete,
  };
}
