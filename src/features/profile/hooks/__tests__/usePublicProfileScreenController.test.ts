import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { createProfileBundle } from "@/test/fixtures/profile";
import { routes } from "@/shared/navigation/routes";

import { fetchPublicProfileByUsername } from "../../services/profileService";
import { usePublicProfileScreenController } from "../usePublicProfileScreenController";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../services/profileService", () => ({
  fetchPublicProfileByUsername: jest.fn(),
}));

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;
const useLocalSearchParamsMock =
  useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const fetchPublicProfileByUsernameMock =
  fetchPublicProfileByUsername as jest.MockedFunction<typeof fetchPublicProfileByUsername>;

describe("usePublicProfileScreenController", () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue({
      replace,
    } as unknown as ReturnType<typeof useRouter>);
    useLocalSearchParamsMock.mockReturnValue({
      username: "alex",
    });
    fetchPublicProfileByUsernameMock.mockResolvedValue(createProfileBundle());
  });

  it("Given username param is missing, When controller initializes, Then it stops loading and shows username required message", async () => {
    useLocalSearchParamsMock.mockReturnValue({});

    const { result } = renderHook(() => usePublicProfileScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe("Username is missing.");
    expect(result.current.profileData).toBeNull();
    expect(fetchPublicProfileByUsernameMock).not.toHaveBeenCalled();
  });

  it("Given username param needs normalization, When controller loads profile, Then it requests normalized username and stores loaded profile", async () => {
    const profileBundle = createProfileBundle();
    useLocalSearchParamsMock.mockReturnValue({
      username: ["  ALEx  ", "ignored"],
    });
    fetchPublicProfileByUsernameMock.mockResolvedValueOnce(profileBundle);

    const { result } = renderHook(() => usePublicProfileScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchPublicProfileByUsernameMock).toHaveBeenCalledWith("alex");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.profileData).toEqual(profileBundle);
  });

  it("Given profile request fails, When controller loads profile, Then it stores user-friendly error state", async () => {
    fetchPublicProfileByUsernameMock.mockRejectedValueOnce(new Error("public profile failed"));

    const { result } = renderHook(() => usePublicProfileScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profileData).toBeNull();
    expect(result.current.errorMessage).toBe("public profile failed");
  });

  it("Given public profile is not found, When controller loads profile, Then it stops loading without error and keeps profileData null", async () => {
    useLocalSearchParamsMock.mockReturnValue({
      username: "  MissingUser  ",
    });
    fetchPublicProfileByUsernameMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => usePublicProfileScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchPublicProfileByUsernameMock).toHaveBeenCalledWith("missinguser");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.profileData).toBeNull();
  });

  it("Given back button action, When handleBackPress is called, Then it redirects to profile route", async () => {
    const { result } = renderHook(() => usePublicProfileScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleBackPress();
    });

    expect(replace).toHaveBeenCalledWith(routes.profile);
  });
});
