import type { Habit, HabitGroup } from "@features/habits/model/types";

import { useHabitGroupEditorState } from "./useHabitGroupEditorState";
import { useHabitItemEditorState } from "./useHabitItemEditorState";

type UseHabitsEditorStateArgs = {
  habits: Habit[];
  groups: HabitGroup[];
  isSaving: boolean;
  setErrorMessage: (message: string | null) => void;
};

export function useHabitsEditorState({
  habits,
  groups,
  isSaving,
  setErrorMessage,
}: UseHabitsEditorStateArgs) {
  const itemEditorState = useHabitItemEditorState({
    habits,
    isSaving,
    setErrorMessage,
  });

  const groupEditorState = useHabitGroupEditorState({
    groups,
    isSaving,
    setErrorMessage,
  });

  return {
    ...itemEditorState,
    ...groupEditorState,
  };
}
