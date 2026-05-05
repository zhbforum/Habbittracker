import { getSupabaseClient } from "@/shared/api/supabase/client";
import { isAuthCallbackUrl } from "@/shared/navigation/deepLinks";

import { resolveAuthRedirectUrl } from "../authRedirectService";

jest.mock("@/shared/navigation/deepLinks", () => ({
  isAuthCallbackUrl: jest.fn(),
}));

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const mockIsAuthCallbackUrl = isAuthCallbackUrl as jest.MockedFunction<
  typeof isAuthCallbackUrl
>;
const mockGetSupabaseClient = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

const mockSetSession = jest.fn();
const mockExchangeCodeForSession = jest.fn();
const mockVerifyOtp = jest.fn();

function createSupabaseMock(): unknown {
  return {
    auth: {
      setSession: mockSetSession,
      exchangeCodeForSession: mockExchangeCodeForSession,
      verifyOtp: mockVerifyOtp,
    },
  };
}

describe("resolveAuthRedirectUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthCallbackUrl.mockReturnValue(true);
    mockGetSupabaseClient.mockReturnValue(
      createSupabaseMock() as ReturnType<typeof getSupabaseClient>,
    );
    mockSetSession.mockResolvedValue({ error: null });
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });
  });

  it("ignores urls that are not auth callback urls", async () => {
    mockIsAuthCallbackUrl.mockReturnValue(false);

    const result = await resolveAuthRedirectUrl("habbittracker://home");

    expect(result).toEqual({ status: "ignored" });
    expect(mockGetSupabaseClient).not.toHaveBeenCalled();
  });

  it("returns decoded error message from redirect params", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/?error_description=Access+Denied%21",
    );

    expect(result).toEqual({
      status: "error",
      message: "Access Denied!",
    });
    expect(mockGetSupabaseClient).not.toHaveBeenCalled();
  });

  it("restores session from access and refresh tokens", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/#access_token=aaa&refresh_token=bbb",
    );

    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: "aaa",
      refresh_token: "bbb",
    });
    expect(result).toEqual({ status: "success" });
  });

  it("returns setSession error when token exchange fails", async () => {
    mockSetSession.mockResolvedValue({
      error: {
        message: "Session token rejected.",
      },
    });

    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/#access_token=aaa&refresh_token=bbb",
    );

    expect(result).toEqual({
      status: "error",
      message: "Session token rejected.",
    });
  });

  it("exchanges auth code when tokens are not present", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/?code=code-123",
    );

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("code-123");
    expect(result).toEqual({ status: "success" });
  });

  it("verifies otp when token_hash and valid type are present", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/?token_hash=hash-123&type=magiclink",
    );

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "magiclink",
      token_hash: "hash-123",
    });
    expect(result).toEqual({ status: "success" });
  });

  it("prefers query params over hash params when merging", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/?code=query-code#code=hash-code",
    );

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("query-code");
    expect(result).toEqual({ status: "success" });
  });

  it("returns ignored when callback has no known auth payload", async () => {
    const result = await resolveAuthRedirectUrl(
      "habbittracker://auth-callback/?foo=bar&type=not-valid",
    );

    expect(result).toEqual({ status: "ignored" });
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });
});
