import { act, renderHook } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createUserProfile } from "@/test/fixtures/profile";
import { showErrorToast, showInfoToast } from "@shared/ui";

import {
  signOutCurrentUser,
  updateCurrentUserThemePreference,
} from "../../services/profileService";
import { useProfileScreenSessionActions } from "../useProfileScreenSessionActions";

jest.mock("../../services/profileService", () => ({
  signOutCurrentUser: jest.fn(),
  updateCurrentUserThemePreference: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
  showInfoToast: jest.fn(),
}));

const signOutCurrentUserMock = signOutCurrentUser as jest.MockedFunction<typeof signOutCurrentUser>;
const updateCurrentUserThemePreferenceMock =
  updateCurrentUserThemePreference as jest.MockedFunction<
    typeof updateCurrentUserThemePreference
  >;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;
const showInfoToastMock = showInfoToast as jest.MockedFunction<typeof showInfoToast>;

describe("useProfileScreenSessionActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates theme preference and profile on success", async () => {
    const user = createSupabaseUser({ id: "user-1" });
    const setMode = jest.fn();
    const setProfile = jest.fn();
    const setErrorMessage = jest.fn();
    const setIsSaving = jest.fn();
    updateCurrentUserThemePreferenceMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useProfileScreenSessionActions({
        user,
        setMode,
        setProfile,
        setErrorMessage,
        setIsSaving,
      }),
    );

    await act(async () => {
      await result.current.handleThemeChange("dark");
    });

    expect(setMode).toHaveBeenCalledWith("dark");
    expect(updateCurrentUserThemePreferenceMock).toHaveBeenCalledWith(user, "dark");
    expect(showInfoToastMock).toHaveBeenCalledWith("Theme updated", "Dark theme enabled.");
    expect(setErrorMessage).not.toHaveBeenCalled();
    expect(setIsSaving).not.toHaveBeenCalled();

    const setProfileUpdateCall = setProfile.mock.calls.find(
      (call): call is [((profile: ReturnType<typeof createUserProfile> | null) => ReturnType<typeof createUserProfile> | null)] =>
        typeof call[0] === "function",
    );
    expect(setProfileUpdateCall).toBeDefined();

    const updater = setProfileUpdateCall?.[0];
    if (!updater) {
      throw new Error("Expected setProfile updater to be called.");
    }

    const currentProfile = createUserProfile({
      themePreference: "light",
    });
    expect(updater(currentProfile)).toEqual({
      ...currentProfile,
      themePreference: "dark",
    });
    expect(updater(null)).toBeNull();
  });

  it("keeps instant theme switch when cloud sync fails", async () => {
    const user = createSupabaseUser({ id: "user-2" });
    const setMode = jest.fn();
    const setProfile = jest.fn();
    const setErrorMessage = jest.fn();
    const setIsSaving = jest.fn();
    updateCurrentUserThemePreferenceMock.mockRejectedValueOnce(new Error("sync failed"));

    const { result } = renderHook(() =>
      useProfileScreenSessionActions({
        user,
        setMode,
        setProfile,
        setErrorMessage,
        setIsSaving,
      }),
    );

    await act(async () => {
      await result.current.handleThemeChange("light");
    });

    expect(setMode).toHaveBeenCalledWith("light");
    expect(updateCurrentUserThemePreferenceMock).toHaveBeenCalledWith(user, "light");
    expect(setProfile).not.toHaveBeenCalled();
    expect(showInfoToastMock).not.toHaveBeenCalled();
  });

  it("handles sign out success and failure", async () => {
    const user = createSupabaseUser({ id: "user-3" });
    const setMode = jest.fn();
    const setProfile = jest.fn();
    const setErrorMessage = jest.fn();
    const setIsSaving = jest.fn();

    const { result } = renderHook(() =>
      useProfileScreenSessionActions({
        user,
        setMode,
        setProfile,
        setErrorMessage,
        setIsSaving,
      }),
    );

    signOutCurrentUserMock.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(setIsSaving).toHaveBeenNthCalledWith(2, false);
    expect(signOutCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(setErrorMessage).not.toHaveBeenCalled();
    expect(showErrorToastMock).not.toHaveBeenCalled();

    signOutCurrentUserMock.mockRejectedValueOnce(new Error("logout failed"));
    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(setIsSaving).toHaveBeenNthCalledWith(3, true);
    expect(setErrorMessage).toHaveBeenCalledWith("logout failed");
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Unable to sign out",
      "logout failed",
    );
    expect(setIsSaving).toHaveBeenNthCalledWith(4, false);
  });
});
