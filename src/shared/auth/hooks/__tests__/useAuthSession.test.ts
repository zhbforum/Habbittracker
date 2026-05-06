import { act, renderHook, waitFor } from "@testing-library/react-native";

import { getSupabaseClient } from "@/shared/api/supabase/client";

import { useAuthSession } from "../useAuthSession";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

function createSession(userId: string) {
  return {
    access_token: `token-${userId}`,
    user: {
      id: userId,
    },
  };
}

describe("useAuthSession", () => {
  const getSession = jest.fn();
  const onAuthStateChange = jest.fn();
  const unsubscribe = jest.fn();
  let authStateCallback: ((event: string, session: ReturnType<typeof createSession> | null) => void) | null =
    null;

  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;

    getSession.mockResolvedValue({
      data: {
        session: null,
      },
    });
    onAuthStateChange.mockImplementation(
      (callback: (event: string, session: ReturnType<typeof createSession> | null) => void) => {
        authStateCallback = callback;

        return {
          data: {
            subscription: {
              unsubscribe,
            },
          },
        };
      },
    );

    getSupabaseClientMock.mockReturnValue({
      auth: {
        getSession,
        onAuthStateChange,
      },
    } as unknown as ReturnType<typeof getSupabaseClient>);
  });

  it("Given mounted hook, When initial session resolves, Then it exposes non-loading unauthenticated state", async () => {
    const { result } = renderHook(() => useAuthSession());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Given existing session from Supabase, When hook initializes, Then it exposes authenticated user", async () => {
    getSession.mockResolvedValueOnce({
      data: {
        session: createSession("user-initial"),
      },
    });

    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.id).toBe("user-initial");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("Given getSession returns error with empty session, When hook initializes, Then it falls back to unauthenticated non-loading state", async () => {
    getSession.mockResolvedValueOnce({
      data: {
        session: null,
      },
      error: {
        message: "session failed",
      },
    });

    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Given auth state changes after mount, When callback receives session updates, Then it updates authentication state", async () => {
    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(authStateCallback).not.toBeNull();

    act(() => {
      authStateCallback?.("SIGNED_IN", createSession("user-signed-in"));
    });

    expect(result.current.user?.id).toBe("user-signed-in");
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      authStateCallback?.("SIGNED_OUT", null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("Given hook unmounts, When subscription exists, Then it unsubscribes from auth state listener", () => {
    const { unmount } = renderHook(() => useAuthSession());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
