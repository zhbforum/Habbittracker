import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@supabase/supabase-js";

import type { UserProfile } from "@entities/profile/model/types";
import type { ThemeMode } from "@shared/theme";
import { getErrorMessage } from "@shared/lib";
import { showErrorToast, showInfoToast } from "@shared/ui";

import {
  signOutCurrentUser,
  updateCurrentUserThemePreference,
} from "../services/profileService";

type UseProfileScreenSessionActionsArgs = {
  user: User;
  setMode: (mode: ThemeMode) => void;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
};

export function useProfileScreenSessionActions({
  user,
  setMode,
  setProfile,
  setErrorMessage,
  setIsSaving,
}: UseProfileScreenSessionActionsArgs) {
  const handleThemeChange = useCallback(
    async (nextMode: ThemeMode) => {
      setMode(nextMode);

      try {
        await updateCurrentUserThemePreference(user, nextMode);
        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                themePreference: nextMode,
              }
            : currentProfile,
        );
        showInfoToast(
          "Theme updated",
          nextMode === "dark" ? "Dark theme enabled." : "Light theme enabled.",
        );
      } catch {
        // Keep theme switch instant. Cloud sync can fail silently for v1.
      }
    },
    [setMode, setProfile, user],
  );

  const handleSignOut = useCallback(async () => {
    setIsSaving(true);

    try {
      await signOutCurrentUser();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign out.");
      setErrorMessage(message);
      showErrorToast("Unable to sign out", message);
    } finally {
      setIsSaving(false);
    }
  }, [setErrorMessage, setIsSaving]);

  return {
    handleThemeChange,
    handleSignOut,
  };
}
