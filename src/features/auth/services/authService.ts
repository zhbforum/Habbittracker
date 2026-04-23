import * as WebBrowser from "expo-web-browser";

import { getSupabaseClient } from "@/shared/api/supabase/client";
import { getAuthCallbackUrl } from "@/shared/navigation/deepLinks";

import { resolveAuthRedirectUrl } from "./authRedirectService";
import { normalizeEmail } from "../model/validators";
import type {
  AuthActionResult,
  OAuthActionResult,
  SignInFormValues,
  SignUpFormValues,
} from "../model/types";

void WebBrowser.maybeCompleteAuthSession();

function resolveAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function registerWithEmail(
  values: SignUpFormValues,
): Promise<AuthActionResult> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(values.email),
      password: values.password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: {
          full_name: values.fullName.trim(),
        },
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    const requiresEmailConfirmation = Boolean(data.user && !data.session);

    return {
      status: "success",
      message: requiresEmailConfirmation
        ? "Account created. Please confirm your email to continue."
        : "Account created successfully.",
      requiresEmailConfirmation,
    };
  } catch (error) {
    return {
      status: "error",
      message: resolveAuthErrorMessage(error),
    };
  }
}

export async function loginWithEmail(
  values: SignInFormValues,
): Promise<AuthActionResult> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(values.email),
      password: values.password,
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
      message: "Welcome back.",
    };
  } catch (error) {
    return {
      status: "error",
      message: resolveAuthErrorMessage(error),
    };
  }
}

export async function loginWithGoogleOAuth(): Promise<OAuthActionResult> {
  try {
    const supabase = getSupabaseClient();
    const redirectTo = getAuthCallbackUrl();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error || !data.url) {
      return {
        status: "error",
        message: error?.message ?? "Unable to start Google sign-in.",
      };
    }

    const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
      return {
        status: "error",
        message: "Google sign-in was cancelled.",
      };
    }

    if (browserResult.type === "success") {
      const callbackResult = await resolveAuthRedirectUrl(browserResult.url);

      if (callbackResult.status === "success") {
        return {
          status: "success",
          message: "Signed in with Google.",
        };
      }

      if (callbackResult.status === "error") {
        return {
          status: "error",
          message: callbackResult.message,
        };
      }
    }

    return {
      status: "pending",
      message: "Continue sign-in in browser and return to the app.",
    };
  } catch (error) {
    return {
      status: "error",
      message: resolveAuthErrorMessage(error),
    };
  }
}
