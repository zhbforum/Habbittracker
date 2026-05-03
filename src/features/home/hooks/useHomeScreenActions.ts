import { useRouter } from "expo-router";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import { toggleHabitCompletionForDate } from "@entities/habit/api/habitStorage";
import { toDateKey } from "@entities/habit/model/date";
import type { Habit } from "@entities/habit/model/types";
import { getErrorMessage } from "@shared/lib";
import { routes } from "@shared/navigation/routes";
import { showErrorToast } from "@shared/ui";

type UseHomeScreenActionsArgs = {
  userId: string;
  now: Date;
  isSaving: boolean;
  syncAchievements: () => void;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setHabits: Dispatch<SetStateAction<Habit[]>>;
};

export function useHomeScreenActions({
  userId,
  now,
  isSaving,
  syncAchievements,
  setIsSaving,
  setErrorMessage,
  setHabits,
}: UseHomeScreenActionsArgs) {
  const router = useRouter();

  const openHabits = useCallback(() => {
    router.push(routes.habits);
  }, [router]);

  const openCreateHabit = useCallback(() => {
    router.push(`${routes.habits}?create=1`);
  }, [router]);

  const openHabitById = useCallback(
    (habitId: string) => {
      if (!habitId.trim()) {
        return;
      }

      router.push(`${routes.habits}?habitId=${encodeURIComponent(habitId)}`);
    },
    [router],
  );

  const openGroupById = useCallback(
    (groupId: string) => {
      if (!groupId.trim()) {
        return;
      }

      router.push(`${routes.habits}?groupId=${encodeURIComponent(groupId)}`);
    },
    [router],
  );

  const toggleTodayCompletion = useCallback(
    async (habitId: string) => {
      if (isSaving) {
        return;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const updatedHabit = await toggleHabitCompletionForDate(
          userId,
          habitId,
          toDateKey(now),
        );

        setHabits((currentHabits) =>
          currentHabits.map((habit) =>
            habit.id === updatedHabit.id ? updatedHabit : habit,
          ),
        );
        syncAchievements();
      } catch (error) {
        const message = getErrorMessage(error, "Unable to update habit completion.");
        setErrorMessage(message);
        showErrorToast("Unable to update habit", message);
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, now, setErrorMessage, setHabits, setIsSaving, syncAchievements, userId],
  );

  return {
    openHabits,
    openCreateHabit,
    openHabitById,
    openGroupById,
    toggleTodayCompletion,
  };
}
