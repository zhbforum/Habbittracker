import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { resolveAndSyncAchievementsForUser } from "@entities/achievement";
import { resolveDisplayName } from "@entities/profile";

import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";
import { useHomeScreenActions } from "./useHomeScreenActions";
import { useHomeScreenData } from "./useHomeScreenData";
import { useHomeScreenDerived } from "./useHomeScreenDerived";

type UseHomeScreenControllerArgs = {
  user: User;
};

export function useHomeScreenController({ user }: UseHomeScreenControllerArgs) {
  const { activeTab, handleTabPress } = useHomeFooterNavigation("home");
  const [isSaving, setIsSaving] = useState(false);
  const initialDisplayName = resolveDisplayName(user).trim();
  const syncAchievements = useCallback(() => {
    void resolveAndSyncAchievementsForUser(user.id).catch(() => undefined);
  }, [user.id]);

  const {
    isLoading,
    errorMessage,
    displayName,
    habits,
    groups,
    now,
    setErrorMessage,
    setHabits,
    loadHomeData,
  } = useHomeScreenData({
    user,
    initialDisplayName,
    syncAchievements,
  });

  const {
    todayHabits,
    todayGroups,
    hasAnyGroups,
    hasMoreGroups,
    greeting,
    dateLabel,
    progress,
  } = useHomeScreenDerived({
    habits,
    groups,
    now,
  });

  const {
    openHabits,
    openCreateHabit,
    openHabitById,
    openGroupById,
    toggleTodayCompletion,
  } = useHomeScreenActions({
    userId: user.id,
    now,
    isSaving,
    syncAchievements,
    setIsSaving,
    setErrorMessage,
    setHabits,
  });

  return useMemo(
    () => ({
      isLoading,
      isSaving,
      errorMessage,
      activeTab,
      handleTabPress,
      greeting,
      dateLabel,
      displayName,
      todayHabits,
      todayGroups,
      hasAnyGroups,
      hasMoreGroups,
      progress,
      openHabits,
      openCreateHabit,
      openHabitById,
      openGroupById,
      toggleTodayCompletion,
      reload: () => loadHomeData(true),
    }),
    [
      activeTab,
      dateLabel,
      displayName,
      errorMessage,
      greeting,
      hasAnyGroups,
      hasMoreGroups,
      handleTabPress,
      isLoading,
      isSaving,
      loadHomeData,
      openCreateHabit,
      openGroupById,
      openHabitById,
      openHabits,
      progress,
      todayGroups,
      todayHabits,
      toggleTodayCompletion,
    ],
  );
}

