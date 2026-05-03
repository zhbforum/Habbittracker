import { useCallback, useEffect, useState } from "react";

import type { HabitWithMetrics } from "@features/habits/model/types";

type UseHabitDetailsStateArgs = {
  isVisible: boolean;
  habit: HabitWithMetrics | null;
  onSetTodayProgressValue: (habitId: string, value: number) => void;
};

export function useHabitDetailsState({
  isVisible,
  habit,
  onSetTodayProgressValue,
}: UseHabitDetailsStateArgs) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [todayValueInput, setTodayValueInput] = useState("");

  useEffect(() => {
    if (!isVisible) {
      setIsDeleteDialogOpen(false);
      setTodayValueInput("");
    }
  }, [isVisible]);

  useEffect(() => {
    if (!habit || !isVisible) {
      return;
    }

    setTodayValueInput(
      habit.metrics.todayLoggedValue > 0 ? String(habit.metrics.todayLoggedValue) : "",
    );
  }, [habit, isVisible]);

  const openDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const submitTodayValue = useCallback(() => {
    if (!habit) {
      return;
    }

    const numericValue = Number(todayValueInput.replace(",", "."));

    if (!Number.isFinite(numericValue)) {
      return;
    }

    onSetTodayProgressValue(habit.id, numericValue);
  }, [habit, onSetTodayProgressValue, todayValueInput]);

  const clearTodayValue = useCallback(() => {
    if (!habit) {
      return;
    }

    setTodayValueInput("");
    onSetTodayProgressValue(habit.id, 0);
  }, [habit, onSetTodayProgressValue]);

  const confirmDelete = useCallback(
    (onDelete: (habitId: string) => void) => {
      if (!habit) {
        return;
      }

      setIsDeleteDialogOpen(false);
      onDelete(habit.id);
    },
    [habit],
  );

  return {
    isDeleteDialogOpen,
    todayValueInput,
    setTodayValueInput,
    openDeleteDialog,
    closeDeleteDialog,
    submitTodayValue,
    clearTodayValue,
    confirmDelete,
  };
}
