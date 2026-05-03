import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";
import { fetchCurrentUserProfileBundle, resolveDisplayName } from "@entities/profile";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast } from "@shared/ui";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

type UseHomeScreenDataArgs = {
  user: User;
  initialDisplayName: string;
  syncAchievements: () => void;
};

const HOME_DISPLAY_NAME_CACHE = new Map<string, string>();

export function useHomeScreenData({
  user,
  initialDisplayName,
  syncAchievements,
}: UseHomeScreenDataArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<HabitGroup[]>([]);
  const [now, setNow] = useState(new Date());
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const loadHomeData = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [loadedHabits, loadedGroups, profileBundle] = await Promise.all([
          fetchHabitsForUser(user.id),
          fetchHabitGroupsForUser(user.id),
          fetchCurrentUserProfileBundle(user).catch(() => null),
        ]);

        setHabits(loadedHabits);
        setGroups(loadedGroups);
        syncAchievements();
        setDisplayName((currentDisplayName) => {
          const remoteName = profileBundle?.profile.name?.trim();

          if (remoteName) {
            HOME_DISPLAY_NAME_CACHE.set(user.id, remoteName);
            return remoteName;
          }

          if (currentDisplayName.trim().length > 0) {
            return currentDisplayName;
          }

          const fallbackName = resolveDisplayName(user).trim();

          if (fallbackName.length > 0) {
            HOME_DISPLAY_NAME_CACHE.set(user.id, fallbackName);
          }

          return fallbackName;
        });
      } catch (error) {
        const message = getErrorMessage(error, "Unable to load home screen data.");
        setErrorMessage(message);
        showErrorToast("Unable to load home", message);
      } finally {
        setIsLoading(false);
      }
    },
    [syncAchievements, user],
  );

  useFocusEffect(
    useCallback(() => {
      const shouldShowLoader = !hasLoadedRef.current;
      hasLoadedRef.current = true;
      void loadHomeData(shouldShowLoader);
    }, [loadHomeData]),
  );

  return {
    isLoading,
    errorMessage,
    displayName,
    habits,
    groups,
    now,
    setErrorMessage,
    setHabits,
    loadHomeData,
  };
}
