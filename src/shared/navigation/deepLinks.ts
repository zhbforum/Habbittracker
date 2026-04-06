import Constants from "expo-constants";

const DEFAULT_APP_SCHEME = "habbittracker";
const AUTH_CALLBACK_HOST = "auth-callback";

function resolveAppScheme(): string {
  const configuredScheme = Constants.expoConfig?.scheme;

  if (Array.isArray(configuredScheme)) {
    return configuredScheme[0] ?? DEFAULT_APP_SCHEME;
  }

  if (typeof configuredScheme === "string" && configuredScheme.trim().length > 0) {
    return configuredScheme;
  }

  return DEFAULT_APP_SCHEME;
}

export function getAuthCallbackHost(): string {
  return AUTH_CALLBACK_HOST;
}

export function getAuthCallbackUrl(): string {
  const scheme = resolveAppScheme();

  // Supabase redirect URL validator requires a host for custom schemes.
  // Example accepted format: "habbittracker://auth-callback/"
  return `${scheme}://${AUTH_CALLBACK_HOST}/`;
}
