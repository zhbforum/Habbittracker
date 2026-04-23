import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/api/supabase/client";
import { isAuthCallbackUrl } from "@/shared/navigation/deepLinks";

type AuthRedirectResult =
  | {
      status: "ignored" | "success";
    }
  | {
      status: "error";
      message: string;
    };

const EMAIL_OTP_TYPES: ReadonlySet<EmailOtpType> = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

const AUTH_ERROR_PARAM_KEYS = [
  "error_description",
  "error",
  "ERROR_DESCRIPTION",
] as const;

function isEmailOtpType(type: string): type is EmailOtpType {
  return EMAIL_OTP_TYPES.has(type as EmailOtpType);
}

function mergeUrlParams(url: string): URLSearchParams {
  const [withoutHash, hashPart = ""] = url.split("#");
  const queryPart = withoutHash.split("?")[1] ?? "";

  const params = new URLSearchParams(queryPart);
  const hashParams = new URLSearchParams(hashPart);

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  return params;
}

function decodeAuthMessage(message: string): string {
  const normalizedMessage = message.split("+").join("%20");

  try {
    return decodeURIComponent(normalizedMessage);
  } catch {
    return message.split("+").join(" ");
  }
}

function getFirstParam(
  params: URLSearchParams,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = params.get(key);

    if (value) {
      return value;
    }
  }

  return null;
}

function toErrorResult(message: string): AuthRedirectResult {
  return {
    status: "error",
    message,
  };
}

async function resolveSessionFromTokens(
  supabase: SupabaseClient,
  params: URLSearchParams,
): Promise<AuthRedirectResult | null> {
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return toErrorResult(error.message);
  }

  return {
    status: "success",
  };
}

async function resolveSessionFromCode(
  supabase: SupabaseClient,
  params: URLSearchParams,
): Promise<AuthRedirectResult | null> {
  const code = params.get("code");

  if (!code) {
    return null;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return toErrorResult(error.message);
  }

  return {
    status: "success",
  };
}

async function resolveSessionFromOtp(
  supabase: SupabaseClient,
  params: URLSearchParams,
): Promise<AuthRedirectResult | null> {
  const tokenHash = params.get("token_hash");
  const otpType = params.get("type");

  if (!tokenHash || !otpType || !isEmailOtpType(otpType)) {
    return null;
  }

  const { error } = await supabase.auth.verifyOtp({
    type: otpType,
    token_hash: tokenHash,
  });

  if (error) {
    return toErrorResult(error.message);
  }

  return {
    status: "success",
  };
}

export async function resolveAuthRedirectUrl(
  url: string,
): Promise<AuthRedirectResult> {
  if (!isAuthCallbackUrl(url)) {
    return {
      status: "ignored",
    };
  }

  const params = mergeUrlParams(url);
  const authError = getFirstParam(params, AUTH_ERROR_PARAM_KEYS);

  if (authError) {
    return toErrorResult(decodeAuthMessage(authError));
  }

  const supabase = getSupabaseClient();

  const sessionResolvers = [
    resolveSessionFromTokens,
    resolveSessionFromCode,
    resolveSessionFromOtp,
  ] as const;

  for (const resolveSession of sessionResolvers) {
    const result = await resolveSession(supabase, params);

    if (result) {
      return result;
    }
  }

  return {
    status: "ignored",
  };
}
