import * as Linking from "expo-linking";
import Constants from "expo-constants";

const DEFAULT_APP_SCHEME = "habbittracker";
const AUTH_CALLBACK_HOST = "auth-callback";
const LEGACY_AUTH_CALLBACK_PATH = "auth/callback";

function normalizeSegment(value: string | null | undefined): string {
  const normalizedValue = value?.trim().replace(/^\/+|\/+$/g, "");

  return normalizedValue ? normalizedValue.toLowerCase() : "";
}

function normalizePath(path: string | null | undefined): string {
  return (
    path
      ?.split("/")
      .map((segment) => normalizeSegment(segment))
      .filter(Boolean)
      .join("/") ?? ""
  );
}

function getConfiguredAppSchemes(): string[] {
  const configuredScheme = Constants.expoConfig?.scheme;

  if (Array.isArray(configuredScheme)) {
    const schemes = configuredScheme
      .map((scheme) => normalizeSegment(scheme))
      .filter(Boolean);

    return schemes.length > 0 ? Array.from(new Set(schemes)) : [DEFAULT_APP_SCHEME];
  }

  if (typeof configuredScheme === "string") {
    const scheme = normalizeSegment(configuredScheme);

    if (scheme) {
      return [scheme];
    }
  }

  return [DEFAULT_APP_SCHEME];
}

const configuredAppSchemes = getConfiguredAppSchemes();

function resolveAppScheme(): string {
  return configuredAppSchemes[0] ?? DEFAULT_APP_SCHEME;
}

function isConfiguredScheme(scheme: string): boolean {
  return configuredAppSchemes.includes(scheme);
}

function getNormalizedUrlRoute(url: string): { scheme: string; route: string } | null {
  const parsedUrl = Linking.parse(url);
  const scheme = normalizeSegment(parsedUrl.scheme);
  const hostname = normalizeSegment(parsedUrl.hostname);
  const path = normalizePath(parsedUrl.path);

  if (!scheme) {
    return null;
  }

  return {
    scheme,
    route: [hostname, path].filter(Boolean).join("/"),
  };
}

export function getAuthCallbackUrl(): string {
  const scheme = resolveAppScheme();

  // Supabase redirect URL validator requires a host for custom schemes.
  // Example accepted format: "habbittracker://auth-callback/"
  return `${scheme}://${AUTH_CALLBACK_HOST}/`;
}

export function isAuthCallbackUrl(url: string): boolean {
  try {
    const normalizedUrl = getNormalizedUrlRoute(url);

    if (!normalizedUrl || !isConfiguredScheme(normalizedUrl.scheme)) {
      return false;
    }

    return (
      normalizedUrl.route === AUTH_CALLBACK_HOST ||
      normalizedUrl.route === LEGACY_AUTH_CALLBACK_PATH
    );
  } catch {
    return false;
  }
}
