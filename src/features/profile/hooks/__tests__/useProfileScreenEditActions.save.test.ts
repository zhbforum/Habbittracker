import { act, renderHook } from "@testing-library/react-native";

import { createUserProfile } from "@/test/fixtures/profile";

import {
  createArgs,
  showErrorToastMock,
  showSuccessToastMock,
  updateCurrentUserProfileMock,
  useProfileScreenEditActions,
} from "../testUtils/useProfileScreenEditActionsTestSetup";

describe("useProfileScreenEditActions (save flow)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns early in setup submit when profile is missing", async () => {
    const args = createArgs({
      profile: null,
    });
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handleSetupSubmit();
    });

    expect(updateCurrentUserProfileMock).not.toHaveBeenCalled();
    expect(args.setIsEditSheetOpen).not.toHaveBeenCalled();
  });

  it("fails validation in setup submit and does not call update", async () => {
    const args = createArgs({
      setupUsernameValue: "ab",
    });
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handleSetupSubmit();
    });

    expect(updateCurrentUserProfileMock).not.toHaveBeenCalled();
    expect(args.setErrorMessage).toHaveBeenCalledWith("Username must be at least 3 characters.");
    expect(args.setIsEditSheetOpen).not.toHaveBeenCalled();
  });

  it("saves edit form successfully and closes edit sheet", async () => {
    const args = createArgs({
      pendingAvatarUri: "file:///tmp/new-avatar.png",
      formValues: {
        name: "Taylor",
        username: "taylor",
        bio: "Built daily.",
        avatarUrl: "",
      },
    });
    const updatedProfile = createUserProfile({
      name: "Taylor",
      username: "taylor",
      bio: "Built daily.",
      avatarUrl: "https://example.com/taylor.png",
    });
    updateCurrentUserProfileMock.mockResolvedValueOnce(updatedProfile);

    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handleEditSave();
    });

    expect(updateCurrentUserProfileMock).toHaveBeenCalledWith(args.user, {
      name: "Taylor",
      username: "taylor",
      bio: "Built daily.",
      avatarUrl: null,
      avatarLocalUri: "file:///tmp/new-avatar.png",
    });
    expect(args.setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(args.setErrorMessage).toHaveBeenNthCalledWith(1, null);
    expect(args.setProfile).toHaveBeenCalledWith(updatedProfile);
    expect(args.setPendingAvatarUri).toHaveBeenCalledWith(null);
    expect(args.setSetupUsernameValue).toHaveBeenCalledWith("taylor");
    expect(args.setFormValues).toHaveBeenCalledWith({
      name: "Taylor",
      username: "taylor",
      bio: "Built daily.",
      avatarUrl: "https://example.com/taylor.png",
    });
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Profile updated",
      "Changes saved successfully.",
    );
    expect(args.setIsEditSheetOpen).toHaveBeenCalledWith(false);
    expect(args.setIsSaving).toHaveBeenLastCalledWith(false);
  });

  it("handles save failure and keeps edit sheet open", async () => {
    const args = createArgs();
    updateCurrentUserProfileMock.mockRejectedValueOnce(new Error("save failed"));
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handleEditSave();
    });

    expect(args.setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(args.setErrorMessage).toHaveBeenNthCalledWith(1, null);
    expect(args.setErrorMessage).toHaveBeenLastCalledWith("save failed");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to save profile", "save failed");
    expect(showSuccessToastMock).not.toHaveBeenCalled();
    expect(args.setIsEditSheetOpen).not.toHaveBeenCalled();
    expect(args.setIsSaving).toHaveBeenLastCalledWith(false);
  });

  it("saves setup username and closes edit sheet", async () => {
    const profile = createUserProfile({
      name: "Alex Doe",
      username: null,
      bio: "Bio text",
      avatarUrl: "https://example.com/avatar.png",
    });
    const args = createArgs({
      profile,
      setupUsernameValue: "alex_doe",
    });
    const updatedProfile = createUserProfile({
      username: "alex_doe",
      bio: "Bio text",
      avatarUrl: "https://example.com/avatar.png",
    });
    updateCurrentUserProfileMock.mockResolvedValueOnce(updatedProfile);

    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handleSetupSubmit();
    });

    expect(updateCurrentUserProfileMock).toHaveBeenCalledWith(args.user, {
      name: "Alex Doe",
      username: "alex_doe",
      bio: "Bio text",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(args.setIsEditSheetOpen).toHaveBeenCalledWith(false);
  });
});
