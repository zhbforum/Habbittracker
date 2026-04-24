import type { User } from "@supabase/supabase-js";

import { USERNAME_CHANGE_COOLDOWN_DAYS } from "../model/constants";
import type { ProfileInsertDto } from "../model/dto";
import type { ProfileRow } from "./profileDb";

function readMetadataString(
  metadata: Record<string, unknown> | null | undefined,
  keys: readonly string[],
): string | null {
  if (!metadata) {
    return null;
  }

  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function resolveDisplayName(user: User): string {
  const metadataName = readMetadataString(user.user_metadata, ["full_name", "name"]);

  if (metadataName) {
    return metadataName;
  }

  const emailName = user.email?.split("@")[0]?.trim();

  if (emailName && emailName.length > 0) {
    return emailName;
  }

  return "Habit Tracker User";
}

export function resolveProviderAvatarUrl(user: User): string | null {
  return readMetadataString(user.user_metadata, ["avatar_url", "picture"]);
}

export function createProfileInsertPayload(user: User): ProfileInsertDto {
  return {
    id: user.id,
    full_name: resolveDisplayName(user),
    avatar_url: resolveProviderAvatarUrl(user),
    theme_preference: "light" as const,
  };
}

function parseDateValue(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getUsernameNextChangeAt(usernameUpdatedAt: string | null): Date | null {
  const changedAt = parseDateValue(usernameUpdatedAt);

  if (!changedAt) {
    return null;
  }

  return new Date(
    changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
  );
}

export function assertUsernameCanBeUpdated(
  currentProfile: ProfileRow,
  nextUsername: string,
): void {
  const currentUsername = currentProfile.username;

  if (!currentUsername || currentUsername === nextUsername) {
    return;
  }

  const nextChangeAt = getUsernameNextChangeAt(currentProfile.username_updated_at);

  if (!nextChangeAt || nextChangeAt.getTime() <= Date.now()) {
    return;
  }

  const formattedDate = nextChangeAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  throw new Error(
    `Username can be changed once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days. Next change is available on ${formattedDate}.`,
  );
}
