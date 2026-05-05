import * as WebBrowser from "expo-web-browser";
import { getAuthCallbackUrl } from "@/shared/navigation/deepLinks";
import { getSupabaseClient } from "@/shared/api/supabase/client";
import {
  loginWithEmail,
  loginWithGoogleOAuth,
  registerWithEmail,
} from "../authService";
import { resolveAuthRedirectUrl } from "../authRedirectService";

const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock("@/shared/navigation/deepLinks", () => ({
  getAuthCallbackUrl: jest.fn(() => "habbittracker://auth-callback/"),
}));

jest.mock("../authRedirectService", () => ({
  resolveAuthRedirectUrl: jest.fn(),
}));

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const mockOpenAuthSessionAsync = WebBrowser.openAuthSessionAsync as jest.MockedFunction<
  typeof WebBrowser.openAuthSessionAsync
>;
const mockGetAuthCallbackUrl = getAuthCallbackUrl as jest.MockedFunction<
  typeof getAuthCallbackUrl
>;
const mockResolveAuthRedirectUrl = resolveAuthRedirectUrl as jest.MockedFunction<
  typeof resolveAuthRedirectUrl
>;
const mockGetSupabaseClient = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

function createSupabaseClient(): unknown {
  return {
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
  };
}

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue(
      createSupabaseClient() as ReturnType<typeof getSupabaseClient>,
    );
    mockGetAuthCallbackUrl.mockReturnValue("habbittracker://auth-callback/");
  });

  it("registers with normalized email and trimmed name", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-1" },
        session: null,
      },
      error: null,
    });

    const result = await registerWithEmail({
      fullName: "  Alice Doe  ",
      email: "  ALICE@EXAMPLE.COM ",
      password: "strong-password",
      acceptedTerms: true,
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "strong-password",
      options: {
        emailRedirectTo: "habbittracker://auth-callback/",
        data: {
          full_name: "Alice Doe",
        },
      },
    });
    expect(result).toEqual({
      status: "success",
      message: "Account created. Please confirm your email to continue.",
      requiresEmailConfirmation: true,
    });
  });

  it("returns success without confirmation when session exists", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "user-1" },
        session: { access_token: "token" },
      },
      error: null,
    });

    const result = await registerWithEmail({
      fullName: "Alice Doe",
      email: "alice@example.com",
      password: "strong-password",
      acceptedTerms: true,
    });

    expect(result).toEqual({
      status: "success",
      message: "Account created successfully.",
      requiresEmailConfirmation: false,
    });
  });

  it("returns supabase error for register", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Email already registered.",
      },
    });

    const result = await registerWithEmail({
      fullName: "Alice Doe",
      email: "alice@example.com",
      password: "strong-password",
      acceptedTerms: true,
    });

    expect(result).toEqual({
      status: "error",
      message: "Email already registered.",
    });
  });

  it("returns readable message on register exception", async () => {
    mockSignUp.mockRejectedValue(new Error("Network down"));

    const result = await registerWithEmail({
      fullName: "Alice Doe",
      email: "alice@example.com",
      password: "strong-password",
      acceptedTerms: true,
    });

    expect(result).toEqual({
      status: "error",
      message: "Network down",
    });
  });

  it("logs in with normalized email", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: null,
    });

    const result = await loginWithEmail({
      email: "  USER@Example.COM ",
      password: "secret",
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret",
    });
    expect(result).toEqual({
      status: "success",
      message: "Welcome back.",
    });
  });

  it("returns login error from supabase", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: {
        message: "Invalid credentials.",
      },
    });

    const result = await loginWithEmail({
      email: "user@example.com",
      password: "bad",
    });

    expect(result).toEqual({
      status: "error",
      message: "Invalid credentials.",
    });
  });

  it("returns generic login error on unknown exception", async () => {
    mockSignInWithPassword.mockRejectedValue("boom");

    const result = await loginWithEmail({
      email: "user@example.com",
      password: "secret",
    });

    expect(result).toEqual({
      status: "error",
      message: "Something went wrong. Please try again.",
    });
  });

  it("returns oauth start error when supabase cannot provide url", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: {
        message: "OAuth provider unavailable.",
      },
    });

    const result = await loginWithGoogleOAuth();

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "habbittracker://auth-callback/",
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    expect(result).toEqual({
      status: "error",
      message: "OAuth provider unavailable.",
    });
  });

  it("returns cancelled message when user closes oauth flow", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: "https://example.com/oauth" },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "cancel",
    } as never);

    const result = await loginWithGoogleOAuth();

    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      "https://example.com/oauth",
      "habbittracker://auth-callback/",
    );
    expect(result).toEqual({
      status: "error",
      message: "Google sign-in was cancelled.",
    });
  });

  it("returns oauth success when callback resolves successfully", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: "https://example.com/oauth" },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "habbittracker://auth-callback/?code=123",
    } as never);
    mockResolveAuthRedirectUrl.mockResolvedValue({
      status: "success",
    });

    const result = await loginWithGoogleOAuth();

    expect(mockResolveAuthRedirectUrl).toHaveBeenCalledWith(
      "habbittracker://auth-callback/?code=123",
    );
    expect(result).toEqual({
      status: "success",
      message: "Signed in with Google.",
    });
  });

  it("returns callback error when oauth redirect resolution fails", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: "https://example.com/oauth" },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "habbittracker://auth-callback/?error=access_denied",
    } as never);
    mockResolveAuthRedirectUrl.mockResolvedValue({
      status: "error",
      message: "Access denied.",
    });

    const result = await loginWithGoogleOAuth();

    expect(result).toEqual({
      status: "error",
      message: "Access denied.",
    });
  });

  it("returns pending state when oauth callback is not finalized", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: "https://example.com/oauth" },
      error: null,
    });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "habbittracker://auth-callback/",
    } as never);
    mockResolveAuthRedirectUrl.mockResolvedValue({
      status: "ignored",
    });

    const result = await loginWithGoogleOAuth();

    expect(result).toEqual({
      status: "pending",
      message: "Continue sign-in in browser and return to the app.",
    });
  });
});
