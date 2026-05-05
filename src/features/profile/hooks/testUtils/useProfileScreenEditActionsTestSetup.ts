import type { SetStateAction } from "react";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createUserProfile } from "@/test/fixtures/profile";
import { showErrorToast, showSuccessToast } from "@shared/ui";

import { pickAvatarFromGallery } from "../../services/profileGalleryPicker";
import { updateCurrentUserProfile } from "../../services/profileService";
import { useProfileScreenEditActions } from "../useProfileScreenEditActions";

jest.mock("../../services/profileGalleryPicker", () => ({
  pickAvatarFromGallery: jest.fn(),
}));

jest.mock("../../services/profileService", () => ({
  updateCurrentUserProfile: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));

export const pickAvatarFromGalleryMock =
  pickAvatarFromGallery as jest.MockedFunction<typeof pickAvatarFromGallery>;
export const updateCurrentUserProfileMock =
  updateCurrentUserProfile as jest.MockedFunction<typeof updateCurrentUserProfile>;
export const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;
export const showSuccessToastMock =
  showSuccessToast as jest.MockedFunction<typeof showSuccessToast>;

export type UseProfileScreenEditActionsArgs = Parameters<typeof useProfileScreenEditActions>[0];

function createStateSetterMock<T>() {
  return jest.fn<void, [SetStateAction<T>]>();
}

export function createArgs(
  overrides: Partial<UseProfileScreenEditActionsArgs> = {},
): UseProfileScreenEditActionsArgs {
  return {
    user: createSupabaseUser(),
    profile: createUserProfile(),
    formValues: {
      name: "Alex Doe",
      username: "alex",
      bio: "Keep moving.",
      avatarUrl: "https://example.com/avatar.png",
    },
    setupUsernameValue: "alex",
    pendingAvatarUri: null,
    isSaving: false,
    isPickingAvatar: false,
    setIsSaving: createStateSetterMock<boolean>(),
    setIsPickingAvatar: createStateSetterMock<boolean>(),
    setIsEditSheetOpen: createStateSetterMock<boolean>(),
    setProfile: createStateSetterMock<ReturnType<typeof createUserProfile> | null>(),
    setErrorMessage: createStateSetterMock<string | null>(),
    setPendingAvatarUri: createStateSetterMock<string | null>(),
    setSetupUsernameValue: createStateSetterMock<string>(),
    setFormValues: createStateSetterMock<UseProfileScreenEditActionsArgs["formValues"]>(),
    ...overrides,
  };
}

export function applyFormValuesUpdater(
  args: UseProfileScreenEditActionsArgs,
  currentValues: UseProfileScreenEditActionsArgs["formValues"],
) {
  const setFormValuesMock = args.setFormValues as jest.Mock<
    void,
    [SetStateAction<UseProfileScreenEditActionsArgs["formValues"]>]
  >;
  const updater = setFormValuesMock.mock.calls[0]?.[0];

  if (!updater) {
    throw new Error("setFormValues updater was not called.");
  }

  if (typeof updater === "function") {
    return updater(currentValues);
  }

  return updater;
}

export { useProfileScreenEditActions };
