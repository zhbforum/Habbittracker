import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";
import { routes } from "@/shared/navigation/routes";

import { useProfileScreenController } from "./useProfileScreenController";

type UseUserProfileScreenViewModelArgs = {
  user: User;
};

export function useUserProfileScreenViewModel({
  user,
}: UseUserProfileScreenViewModelArgs) {
  const { activeTab, handleTabPress } = useHomeFooterNavigation("profile");
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const profileController = useProfileScreenController({
    user,
  });

  const {
    isSaving,
    profile,
    setIsThemeSheetOpen,
    handleSignOut,
  } = profileController;

  const handleOpenSignOutDialog = useCallback(() => {
    if (isSaving) {
      return;
    }

    setIsThemeSheetOpen(false);
    setIsSignOutDialogOpen(true);
  }, [isSaving, setIsThemeSheetOpen]);

  const handleConfirmSignOut = useCallback(() => {
    if (isSaving) {
      return;
    }

    setIsSignOutDialogOpen(false);
    void handleSignOut();
  }, [handleSignOut, isSaving]);

  const closeSignOutDialog = useCallback(() => {
    setIsSignOutDialogOpen(false);
  }, []);

  const profileSeed = profile?.username || profile?.id || user.id;
  const usernameLabel = profile?.username ? `@${profile.username}` : "@username";
  const pageTitle = profile?.username ? `${profile.username}'s profile` : "Profile";
  const publicProfilePath = profile?.username
    ? routes.publicProfile(profile.username)
    : "Complete username setup to unlock public profile URL.";

  return useMemo(
    () => ({
      activeTab,
      handleTabPress,
      isSignOutDialogOpen,
      setIsSignOutDialogOpen,
      handleOpenSignOutDialog,
      handleConfirmSignOut,
      closeSignOutDialog,
      profileSeed,
      usernameLabel,
      pageTitle,
      publicProfilePath,
      ...profileController,
    }),
    [
      activeTab,
      handleConfirmSignOut,
      handleOpenSignOutDialog,
      handleTabPress,
      isSignOutDialogOpen,
      closeSignOutDialog,
      pageTitle,
      profileController,
      profileSeed,
      publicProfilePath,
      usernameLabel,
    ],
  );
}
