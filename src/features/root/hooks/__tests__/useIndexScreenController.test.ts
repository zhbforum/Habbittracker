import { renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { routes } from "@/shared/navigation/routes";
import { useAuthSession } from "@/shared/auth";
import { hasCompletedOnboarding, markOnboardingAsCompleted } from "@features/onboarding";

import { useIndexScreenController } from "../useIndexScreenController";

jest.mock("@/shared/auth", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("@features/onboarding", () => ({
  hasCompletedOnboarding: jest.fn(),
  markOnboardingAsCompleted: jest.fn(),
}));

const useAuthSessionMock = useAuthSession as jest.MockedFunction<typeof useAuthSession>;
const hasCompletedOnboardingMock =
  hasCompletedOnboarding as jest.MockedFunction<typeof hasCompletedOnboarding>;
const markOnboardingAsCompletedMock =
  markOnboardingAsCompleted as jest.MockedFunction<typeof markOnboardingAsCompleted>;

type AuthSessionState = ReturnType<typeof useAuthSession>;

function createAuthSessionState(overrides: Partial<AuthSessionState> = {}): AuthSessionState {
  return {
    isLoading: false,
    session: null,
    user: null,
    isAuthenticated: false,
    ...overrides,
  };
}

describe("useIndexScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hasCompletedOnboardingMock.mockResolvedValue(false);
    markOnboardingAsCompletedMock.mockResolvedValue();
  });

  it("stays loading while auth session is loading", async () => {
    useAuthSessionMock.mockReturnValue(
      createAuthSessionState({
        isLoading: true,
      }),
    );

    const { result } = renderHook(() => useIndexScreenController());

    await waitFor(() => {
      expect(hasCompletedOnboardingMock).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toEqual({
      isLoading: true,
      shouldShowOnboarding: false,
      redirectRoute: null,
    });
    expect(markOnboardingAsCompletedMock).not.toHaveBeenCalled();
  });

  it("redirects authenticated user to home and marks onboarding as completed", async () => {
    useAuthSessionMock.mockReturnValue(
      createAuthSessionState({
        user: createSupabaseUser(),
        isAuthenticated: true,
      }),
    );
    hasCompletedOnboardingMock.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useIndexScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.redirectRoute).toBe(routes.home);
    expect(result.current.shouldShowOnboarding).toBe(false);

    await waitFor(() => {
      expect(markOnboardingAsCompletedMock).toHaveBeenCalledTimes(1);
    });
  });

  it("redirects anonymous user to profile when onboarding is completed", async () => {
    useAuthSessionMock.mockReturnValue(createAuthSessionState());
    hasCompletedOnboardingMock.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useIndexScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isLoading: false,
      shouldShowOnboarding: false,
      redirectRoute: routes.profile,
    });
    expect(markOnboardingAsCompletedMock).not.toHaveBeenCalled();
  });

  it("shows onboarding for anonymous user who has not completed onboarding", async () => {
    useAuthSessionMock.mockReturnValue(createAuthSessionState());
    hasCompletedOnboardingMock.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useIndexScreenController());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      isLoading: false,
      shouldShowOnboarding: true,
      redirectRoute: null,
    });
    expect(markOnboardingAsCompletedMock).not.toHaveBeenCalled();
  });
});
