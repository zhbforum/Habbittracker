import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import type { AchievementProgress, AchievementSummary } from "@entities/achievement/model/types";
import type { ThemeMode } from "@shared/theme";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast } from "@shared/ui";

import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_ACHIEVEMENT_SUMMARY,
  INITIAL_PROFILE_FORM_VALUES,
  INITIAL_USER_STATS,
} from "../model/constants";
import { mapUserProfileToFormValues } from "../model/mappers";
import type { ProfileFormValues, UserProfile, UserStats } from "../model/types";
import { fetchCurrentUserProfileBundle } from "../services/profileService";

type UseProfileScreenDataArgs = {
  user: User;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export function useProfileScreenData({ user, mode, setMode }: UseProfileScreenDataArgs) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [achievements, setAchievements] =
    useState<AchievementProgress[]>(INITIAL_ACHIEVEMENTS);
  const [achievementSummary, setAchievementSummary] =
    useState<AchievementSummary>(INITIAL_ACHIEVEMENT_SUMMARY);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>(
    INITIAL_PROFILE_FORM_VALUES,
  );
  const [setupUsernameValue, setSetupUsernameValue] = useState("");

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const bundle = await fetchCurrentUserProfileBundle(user);

      setProfile(bundle.profile);
      setStats(bundle.stats);
      setAchievements(bundle.achievements);
      setAchievementSummary(bundle.achievementSummary);
      setSetupUsernameValue(bundle.profile.username ?? "");
      setPendingAvatarUri(null);
      setFormValues(mapUserProfileToFormValues(bundle.profile));

      if (bundle.profile.themePreference !== mode) {
        setMode(bundle.profile.themePreference);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load profile.");
      setErrorMessage(message);
      showErrorToast("Unable to load profile", message);
    } finally {
      setIsLoading(false);
    }
  }, [mode, setMode, user]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  return {
    isLoading,
    profile,
    stats,
    achievements,
    achievementSummary,
    errorMessage,
    pendingAvatarUri,
    formValues,
    setupUsernameValue,
    setProfile,
    setErrorMessage,
    setPendingAvatarUri,
    setFormValues,
    setSetupUsernameValue,
    loadProfileData,
  };
}
