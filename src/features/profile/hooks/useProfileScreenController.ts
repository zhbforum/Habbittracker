import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { USERNAME_CHANGE_COOLDOWN_DAYS } from "../model/constants";
import { getUsernameChangeInfo } from "../services/profileService";
import { useProfileScreenData } from "./useProfileScreenData";
import { useProfileScreenEditActions } from "./useProfileScreenEditActions";
import { useProfileScreenSessionActions } from "./useProfileScreenSessionActions";

import { useAppTheme } from "@/shared/theme";

type UseProfileScreenControllerArgs = {
  user: User;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function useProfileScreenController({ user }: UseProfileScreenControllerArgs) {
  const { mode, setMode } = useAppTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const {
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
  } = useProfileScreenData({
    user,
    mode,
    setMode,
  });

  const {
    setFormField,
    handlePickAvatarFromGallery,
    handleResetAvatar,
    handleSetupSubmit,
    handleEditSave,
  } = useProfileScreenEditActions({
    user,
    profile,
    formValues,
    setupUsernameValue,
    pendingAvatarUri,
    isSaving,
    isPickingAvatar,
    setIsSaving,
    setIsPickingAvatar,
    setIsEditSheetOpen,
    setProfile,
    setErrorMessage,
    setPendingAvatarUri,
    setSetupUsernameValue,
    setFormValues,
  });

  const { handleThemeChange, handleSignOut } = useProfileScreenSessionActions({
    user,
    setMode,
    setProfile,
    setErrorMessage,
    setIsSaving,
  });

  const requiresUsernameSetup = !isLoading && !!profile && !profile.username;

  const usernameChangeInfo = useMemo(
    () =>
      getUsernameChangeInfo(
        profile?.username ?? null,
        profile?.usernameUpdatedAt ?? null,
      ),
    [profile?.username, profile?.usernameUpdatedAt],
  );

  const canChangeUsername = usernameChangeInfo.canChangeNow;
  const usernameChangeHint = usernameChangeInfo.canChangeNow
    ? `Username can be changed once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days.`
    : `Username can be changed again on ${formatDate(usernameChangeInfo.nextChangeAt!)}.`;

  return useMemo(
    () => ({
      mode,
      isLoading,
      isSaving,
      isPickingAvatar,
      profile,
      stats,
      achievements,
      achievementSummary,
      formValues,
      setupUsernameValue,
      pendingAvatarUri,
      errorMessage,
      requiresUsernameSetup,
      isThemeSheetOpen,
      isEditSheetOpen,
      canChangeUsername,
      usernameChangeHint,
      setSetupUsernameValue,
      setFormField,
      setIsThemeSheetOpen,
      setIsEditSheetOpen,
      handleThemeChange,
      handleEditSave,
      handleSetupSubmit,
      handleSignOut,
      handlePickAvatarFromGallery,
      handleResetAvatar,
      reload: loadProfileData,
    }),
    [
      achievements,
      achievementSummary,
      canChangeUsername,
      errorMessage,
      formValues,
      handleEditSave,
      handlePickAvatarFromGallery,
      handleResetAvatar,
      handleSetupSubmit,
      handleSignOut,
      handleThemeChange,
      isEditSheetOpen,
      isLoading,
      isPickingAvatar,
      isSaving,
      isThemeSheetOpen,
      loadProfileData,
      mode,
      pendingAvatarUri,
      profile,
      requiresUsernameSetup,
      setFormField,
      setSetupUsernameValue,
      setupUsernameValue,
      stats,
      usernameChangeHint,
    ],
  );
}
