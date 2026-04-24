import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme";
import { showErrorToast, showInfoToast, showSuccessToast } from "@/shared/ui";

import {
  INITIAL_PROFILE_FORM_VALUES,
  INITIAL_USER_STATS,
  USERNAME_CHANGE_COOLDOWN_DAYS,
} from "../model/constants";
import { mapUserProfileToFormValues } from "../model/mappers";
import type { ProfileFormValues, UserProfile, UserStats } from "../model/types";
import { validateProfileFormValues } from "../model/validators";
import { pickAvatarFromGallery } from "../services/profileGalleryPicker";
import {
  fetchCurrentUserProfileBundle,
  getUsernameChangeInfo,
  signOutCurrentUser,
  updateCurrentUserProfile,
  updateCurrentUserThemePreference,
} from "../services/profileService";

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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
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

  const setFormField = useCallback(
    <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [],
  );

  const handlePickAvatarFromGallery = useCallback(async () => {
    if (isSaving || isPickingAvatar) {
      return;
    }

    setIsPickingAvatar(true);

    try {
      const result = await pickAvatarFromGallery();

      if (result.status === "cancelled") {
        return;
      }

      if (result.status === "permission_denied") {
        const message = "Gallery permission is required to choose an avatar.";
        setErrorMessage(message);
        showErrorToast("Permission needed", message);
        return;
      }

      if (result.status === "invalid_asset") {
        const message = "Unable to load selected image.";
        setErrorMessage(message);
        showErrorToast("Image loading failed", message);
        return;
      }

      setPendingAvatarUri(result.uri);
    } catch {
      const message = "Unable to pick an image from gallery.";
      setErrorMessage(message);
      showErrorToast("Gallery error", message);
    } finally {
      setIsPickingAvatar(false);
    }
  }, [isPickingAvatar, isSaving]);

  const handleResetAvatar = useCallback(() => {
    setPendingAvatarUri(null);
    setFormField("avatarUrl", "");
  }, [setFormField]);

  const applyProfileUpdate = useCallback(
    async (values: {
      name: string;
      username: string;
      bio: string;
      avatarUrl: string | null;
      avatarLocalUri?: string | null;
    }) => {
      const formError = validateProfileFormValues(values);

      if (formError) {
        setErrorMessage(formError);
        return false;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        const updatedProfile = await updateCurrentUserProfile(user, values);
        setProfile(updatedProfile);
        setPendingAvatarUri(null);
        setSetupUsernameValue(updatedProfile.username ?? "");
        setFormValues(mapUserProfileToFormValues(updatedProfile));
        showSuccessToast("Profile updated", "Changes saved successfully.");
        return true;
      } catch (error) {
        const message = getErrorMessage(error, "Unable to save profile.");
        setErrorMessage(message);
        showErrorToast("Unable to save profile", message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user],
  );

  const handleSetupSubmit = useCallback(async () => {
    if (!profile) {
      return;
    }

    const didSave = await applyProfileUpdate({
      name: profile.name,
      username: setupUsernameValue,
      bio: profile.bio ?? "",
      avatarUrl: profile.avatarUrl,
    });

    if (didSave) {
      setIsEditSheetOpen(false);
    }
  }, [applyProfileUpdate, profile, setupUsernameValue]);

  const handleEditSave = useCallback(async () => {
    const didSave = await applyProfileUpdate({
      name: formValues.name,
      username: formValues.username,
      bio: formValues.bio,
      avatarUrl: formValues.avatarUrl || null,
      avatarLocalUri: pendingAvatarUri,
    });

    if (didSave) {
      setIsEditSheetOpen(false);
    }
  }, [
    applyProfileUpdate,
    formValues.avatarUrl,
    formValues.bio,
    formValues.name,
    formValues.username,
    pendingAvatarUri,
  ]);

  const handleThemeChange = useCallback(
    async (nextMode: "light" | "dark") => {
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
    [setMode, user],
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
  }, []);

  return useMemo(
    () => ({
      mode,
      isLoading,
      isSaving,
      isPickingAvatar,
      profile,
      stats,
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
      setupUsernameValue,
      stats,
      usernameChangeHint,
    ],
  );
}
