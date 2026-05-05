import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createProfileBundle, createUserProfile } from "@/test/fixtures/profile";
import { showErrorToast } from "@shared/ui";

import { fetchCurrentUserProfileBundle } from "../../services/profileService";
import { useProfileScreenData } from "../useProfileScreenData";

jest.mock("../../services/profileService", () => ({
  fetchCurrentUserProfileBundle: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
}));

const fetchCurrentUserProfileBundleMock =
  fetchCurrentUserProfileBundle as jest.MockedFunction<typeof fetchCurrentUserProfileBundle>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;

describe("useProfileScreenData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCurrentUserProfileBundleMock.mockResolvedValue(createProfileBundle());
  });

  it("loads profile bundle on mount and maps profile to editable state", async () => {
    const user = createSupabaseUser({ id: "user-1" });
    const setMode = jest.fn();
    const bundle = createProfileBundle({
      profile: createUserProfile({
        name: "Taylor",
        username: "taylor",
        bio: "Build daily.",
        avatarUrl: "https://example.com/taylor.png",
        themePreference: "light",
      }),
    });
    fetchCurrentUserProfileBundleMock.mockResolvedValueOnce(bundle);

    const { result } = renderHook(() =>
      useProfileScreenData({
        user,
        mode: "light",
        setMode,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchCurrentUserProfileBundleMock).toHaveBeenCalledWith(user);
    expect(result.current.profile).toEqual(bundle.profile);
    expect(result.current.stats).toEqual(bundle.stats);
    expect(result.current.achievements).toEqual(bundle.achievements);
    expect(result.current.achievementSummary).toEqual(bundle.achievementSummary);
    expect(result.current.setupUsernameValue).toBe("taylor");
    expect(result.current.pendingAvatarUri).toBeNull();
    expect(result.current.formValues).toEqual({
      name: "Taylor",
      username: "taylor",
      bio: "Build daily.",
      avatarUrl: "https://example.com/taylor.png",
    });
    expect(result.current.errorMessage).toBeNull();
    expect(setMode).not.toHaveBeenCalled();
    expect(showErrorToastMock).not.toHaveBeenCalled();
  });

  it("syncs local theme mode when profile preference differs", async () => {
    const user = createSupabaseUser({ id: "user-2" });
    const setMode = jest.fn();
    const bundle = createProfileBundle({
      profile: createUserProfile({
        themePreference: "dark",
      }),
    });
    fetchCurrentUserProfileBundleMock.mockResolvedValueOnce(bundle);

    const { result } = renderHook(() =>
      useProfileScreenData({
        user,
        mode: "light",
        setMode,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(setMode).toHaveBeenCalledWith("dark");
  });

  it("stores error and shows toast when loading fails", async () => {
    const user = createSupabaseUser({ id: "user-3" });
    const setMode = jest.fn();
    fetchCurrentUserProfileBundleMock.mockRejectedValueOnce(new Error("profile unavailable"));

    const { result } = renderHook(() =>
      useProfileScreenData({
        user,
        mode: "light",
        setMode,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe("profile unavailable");
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Unable to load profile",
      "profile unavailable",
    );
    expect(setMode).not.toHaveBeenCalled();
    expect(result.current.profile).toBeNull();
  });

  it("supports manual reload after a previous failure", async () => {
    const user = createSupabaseUser({ id: "user-4" });
    const setMode = jest.fn();
    const bundle = createProfileBundle({
      profile: createUserProfile({
        name: "Recovered User",
      }),
    });
    fetchCurrentUserProfileBundleMock
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce(bundle);

    const { result } = renderHook(() =>
      useProfileScreenData({
        user,
        mode: "light",
        setMode,
      }),
    );

    await waitFor(() => {
      expect(result.current.errorMessage).toBe("temporary failure");
    });

    await act(async () => {
      await result.current.loadProfileData();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.profile?.name).toBe("Recovered User");
  });
});
