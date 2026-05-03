import type { Dispatch, SetStateAction } from "react";

import type {
  Habit,
  HabitGroup,
  HabitGroupFormValues,
  HabitFormValues,
} from "@entities/habit/model/types";

export type HabitsMutationEditorState = {
  formValues: HabitFormValues;
  editorMode: "create" | "edit";
  editingHabitId: string | null;
  groupFormValues: HabitGroupFormValues;
  groupEditorMode: "create" | "edit";
  editingGroupId: string | null;
  finalizeHabitSave: () => void;
  finalizeGroupSave: () => void;
  clearHabitReferencesAfterDelete: (habitId: string) => void;
  clearGroupReferencesAfterDelete: (groupId: string) => void;
};

export type HabitsMutationSharedArgs = {
  userId: string;
  syncAchievements: () => void;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setHabits: Dispatch<SetStateAction<Habit[]>>;
  setGroups: Dispatch<SetStateAction<HabitGroup[]>>;
};
