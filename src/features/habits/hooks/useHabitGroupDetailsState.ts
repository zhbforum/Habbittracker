import { useCallback, useEffect, useMemo, useState } from "react";

import type { HabitGroupWithMetrics, HabitWithMetrics } from "@features/habits/model/types";

type UseHabitGroupDetailsStateArgs = {
  isVisible: boolean;
  group: HabitGroupWithMetrics | null;
  habits: HabitWithMetrics[];
};

export function useHabitGroupDetailsState({
  isVisible,
  group,
  habits,
}: UseHabitGroupDetailsStateArgs) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsDeleteDialogOpen(false);
    }
  }, [isVisible]);

  const memberHabits = useMemo(() => {
    if (!group) {
      return [];
    }

    return habits.filter((habit) => group.habitIds.includes(habit.id));
  }, [group, habits]);

  const openDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const confirmDelete = useCallback(
    (onDelete: (groupId: string) => void) => {
      if (!group) {
        return;
      }

      setIsDeleteDialogOpen(false);
      onDelete(group.id);
    },
    [group],
  );

  return {
    isDeleteDialogOpen,
    memberHabits,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}
