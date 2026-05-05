import { act, renderHook } from "@testing-library/react-native";

import {
  applyFormValuesUpdater,
  createArgs,
  pickAvatarFromGalleryMock,
  showErrorToastMock,
  useProfileScreenEditActions,
} from "../testUtils/useProfileScreenEditActionsTestSetup";

describe("useProfileScreenEditActions (avatar flow)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates one form field via setFormField", () => {
    const args = createArgs();
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    act(() => {
      result.current.setFormField("bio", "New bio");
    });

    const nextValues = applyFormValuesUpdater(args, args.formValues);
    expect(nextValues).toEqual({
      ...args.formValues,
      bio: "New bio",
    });
  });

  it("resets pending avatar and clears avatarUrl", () => {
    const args = createArgs({
      pendingAvatarUri: "file:///tmp/avatar.png",
    });
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    act(() => {
      result.current.handleResetAvatar();
    });

    expect(args.setPendingAvatarUri).toHaveBeenCalledWith(null);
    const nextValues = applyFormValuesUpdater(args, args.formValues);
    expect(nextValues.avatarUrl).toBe("");
  });

  it("skips gallery picking when saving or picking is already in progress", async () => {
    const savingArgs = createArgs({
      isSaving: true,
    });
    const { result: savingResult } = renderHook(() => useProfileScreenEditActions(savingArgs));

    await act(async () => {
      await savingResult.current.handlePickAvatarFromGallery();
    });

    const pickingArgs = createArgs({
      isPickingAvatar: true,
    });
    const { result: pickingResult } = renderHook(() => useProfileScreenEditActions(pickingArgs));

    await act(async () => {
      await pickingResult.current.handlePickAvatarFromGallery();
    });

    expect(pickAvatarFromGalleryMock).not.toHaveBeenCalled();
    expect(savingArgs.setIsPickingAvatar).not.toHaveBeenCalled();
    expect(pickingArgs.setIsPickingAvatar).not.toHaveBeenCalled();
  });

  it("handles permission denied and invalid asset results", async () => {
    const permissionArgs = createArgs();
    pickAvatarFromGalleryMock.mockResolvedValueOnce({
      status: "permission_denied",
    });
    const { result: permissionResult } = renderHook(() =>
      useProfileScreenEditActions(permissionArgs),
    );

    await act(async () => {
      await permissionResult.current.handlePickAvatarFromGallery();
    });

    expect(permissionArgs.setErrorMessage).toHaveBeenCalledWith(
      "Gallery permission is required to choose an avatar.",
    );
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Permission needed",
      "Gallery permission is required to choose an avatar.",
    );
    expect(permissionArgs.setPendingAvatarUri).not.toHaveBeenCalled();
    expect(permissionArgs.setIsPickingAvatar).toHaveBeenNthCalledWith(1, true);
    expect(permissionArgs.setIsPickingAvatar).toHaveBeenLastCalledWith(false);

    const invalidArgs = createArgs();
    pickAvatarFromGalleryMock.mockResolvedValueOnce({
      status: "invalid_asset",
    });
    const { result: invalidResult } = renderHook(() =>
      useProfileScreenEditActions(invalidArgs),
    );

    await act(async () => {
      await invalidResult.current.handlePickAvatarFromGallery();
    });

    expect(invalidArgs.setErrorMessage).toHaveBeenCalledWith(
      "Unable to load selected image.",
    );
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Image loading failed",
      "Unable to load selected image.",
    );
  });

  it("ignores cancelled pick and applies successful pick uri", async () => {
    const cancelledArgs = createArgs();
    pickAvatarFromGalleryMock.mockResolvedValueOnce({
      status: "cancelled",
    });
    const { result: cancelledResult } = renderHook(() =>
      useProfileScreenEditActions(cancelledArgs),
    );

    await act(async () => {
      await cancelledResult.current.handlePickAvatarFromGallery();
    });

    expect(cancelledArgs.setErrorMessage).not.toHaveBeenCalled();
    expect(cancelledArgs.setPendingAvatarUri).not.toHaveBeenCalled();

    const successArgs = createArgs();
    pickAvatarFromGalleryMock.mockResolvedValueOnce({
      status: "success",
      uri: "file:///tmp/new-avatar.png",
    });
    const { result: successResult } = renderHook(() =>
      useProfileScreenEditActions(successArgs),
    );

    await act(async () => {
      await successResult.current.handlePickAvatarFromGallery();
    });

    expect(successArgs.setPendingAvatarUri).toHaveBeenCalledWith("file:///tmp/new-avatar.png");
    expect(successArgs.setErrorMessage).not.toHaveBeenCalled();
  });

  it("shows gallery error toast when picker throws", async () => {
    const args = createArgs();
    pickAvatarFromGalleryMock.mockRejectedValueOnce(new Error("unexpected"));
    const { result } = renderHook(() => useProfileScreenEditActions(args));

    await act(async () => {
      await result.current.handlePickAvatarFromGallery();
    });

    expect(args.setErrorMessage).toHaveBeenCalledWith(
      "Unable to pick an image from gallery.",
    );
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Gallery error",
      "Unable to pick an image from gallery.",
    );
    expect(args.setIsPickingAvatar).toHaveBeenNthCalledWith(1, true);
    expect(args.setIsPickingAvatar).toHaveBeenLastCalledWith(false);
  });
});
