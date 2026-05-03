import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { User } from "@supabase/supabase-js";

import { getErrorMessage } from "@shared/lib";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import { mapUserProfileToFormValues } from "../model/mappers";
import type { ProfileFormValues, UserProfile } from "../model/types";
import { validateProfileFormValues } from "../model/validators";
import { pickAvatarFromGallery } from "../services/profileGalleryPicker";
import { updateCurrentUserProfile } from "../services/profileService";

type UseProfileScreenEditActionsArgs = {
  user: User;
  profile: UserProfile | null;
  formValues: ProfileFormValues;
  setupUsernameValue: string;
  pendingAvatarUri: string | null;
  isSaving: boolean;
  isPickingAvatar: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  setIsPickingAvatar: Dispatch<SetStateAction<boolean>>;
  setIsEditSheetOpen: Dispatch<SetStateAction<boolean>>;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setPendingAvatarUri: Dispatch<SetStateAction<string | null>>;
  setSetupUsernameValue: Dispatch<SetStateAction<string>>;
  setFormValues: Dispatch<SetStateAction<ProfileFormValues>>;
};

export function useProfileScreenEditActions({
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
}: UseProfileScreenEditActionsArgs) {
  const setFormField = useCallback(
    <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => {
      setFormValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [setFormValues],
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
  }, [
    isPickingAvatar,
    isSaving,
    setErrorMessage,
    setIsPickingAvatar,
    setPendingAvatarUri,
  ]);

  const handleResetAvatar = useCallback(() => {
    setPendingAvatarUri(null);
    setFormField("avatarUrl", "");
  }, [setFormField, setPendingAvatarUri]);

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
    [
      setErrorMessage,
      setFormValues,
      setIsSaving,
      setPendingAvatarUri,
      setProfile,
      setSetupUsernameValue,
      user,
    ],
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
  }, [applyProfileUpdate, profile, setIsEditSheetOpen, setupUsernameValue]);

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
  }, [applyProfileUpdate, formValues, pendingAvatarUri, setIsEditSheetOpen]);

  return {
    setFormField,
    handlePickAvatarFromGallery,
    handleResetAvatar,
    handleSetupSubmit,
    handleEditSave,
  };
}
