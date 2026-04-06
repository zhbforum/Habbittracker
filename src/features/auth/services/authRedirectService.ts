import type { EmailOtpType } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/api/supabase/client";
import { getAuthCallbackHost } from "@/shared/navigation/deepLinks";

type AuthRedirectResult =
  | {
      status: "ignored" | "success";
    }
  | {
      status: "error";
      message: string;
    };

const AUTH_CALLBACK_HOST = getAuthCallbackHost();
const LEGACY_AUTH_CALLBACK_PATH = "auth/callback";

function isEmailOtpType(type: string): type is EmailOtpType {
  return [
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "email",
  ].includes(type);
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
  return message.split("+").join(" ");
}

export async function resolveAuthRedirectUrl(
  url: string,
): Promise<AuthRedirectResult> {
  const isCurrentCallbackUrl = url.includes(`://${AUTH_CALLBACK_HOST}`);
  const isLegacyCallbackUrl = url.includes(LEGACY_AUTH_CALLBACK_PATH);

  if (!isCurrentCallbackUrl && !isLegacyCallbackUrl) {
    return {
      status: "ignored",
    };
  }

  const params = mergeUrlParams(url);
  const supabase = getSupabaseClient();

  const authError =
    params.get("error_description") ??
    params.get("error") ??
    params.get("error_description".toUpperCase());

  if (authError) {
    return {
      status: "error",
      message: decodeAuthMessage(authError),
    };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
    };
  }

  const code = params.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
    };
  }

  const tokenHash = params.get("token_hash");
  const otpType = params.get("type");

  if (tokenHash && otpType && isEmailOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
    };
  }

  return {
    status: "ignored",
  };
}
