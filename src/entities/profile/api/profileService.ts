import type { User } from "@supabase/supabase-js";

import { fetchPublicAchievementsForUser, resolveAndSyncAchievementsForUser } from "@entities/achievement/api/achievementService";
import { getSupabaseClient } from "@/shared/api/supabase/client";
import type { ThemeMode } from "@/shared/theme";

import { buildProfileUpdateDto, mapProfileDtoToUserProfile } from "../model/mappers";
import type { ProfileBundle, PublicProfile, UserProfile } from "../model/types";
import { normalizeUsername, sanitizeBio, sanitizeName } from "../model/validators";
import { uploadAvatarFromDevice } from "./profileAvatar";
import { PROFILES_TABLE, PROFILE_SELECT_COLUMNS, type ProfileRow } from "./profileDb";
import {
  assertUsernameCanBeUpdated,
  getUsernameNextChangeAt,
  resolveDisplayName,
} from "./profileIdentity";
import { ensureCurrentUserProfileRow, isUsernameAvailable } from "./profileRowService";
import { fetchCurrentUserStats, fetchPublicUserStats } from "./profileStats";

export { isUsernameAvailable } from "./profileRowService";

export function getUsernameChangeInfo(
  username: string | null,
  usernameUpdatedAt: string | null,
): {
  canChangeNow: boolean;
  nextChangeAt: Date | null;
} {
  if (!username) {
    return {
      canChangeNow: true,
      nextChangeAt: null,
    };
  }

  const nextChangeAt = getUsernameNextChangeAt(usernameUpdatedAt);

  return {
    canChangeNow: !nextChangeAt || nextChangeAt.getTime() <= Date.now(),
    nextChangeAt,
  };
}

export async function fetchCurrentUserProfileBundle(user: User): Promise<ProfileBundle> {
  const [profileRow, stats, achievementData] = await Promise.all([
    ensureCurrentUserProfileRow(user),
    fetchCurrentUserStats(user.id),
    resolveAndSyncAchievementsForUser(user.id).catch(() => ({
      achievements: [],
      summary: {
        total: 0,
        unlocked: 0,
      },
    })),
  ]);

  return {
    profile: mapProfileDtoToUserProfile(profileRow, resolveDisplayName(user)),
    stats,
    achievements: achievementData.achievements,
    achievementSummary: achievementData.summary,
  };
}

export async function updateCurrentUserProfile(
  user: User,
  values: {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string | null;
    avatarLocalUri?: string | null;
  },
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const currentProfile = await ensureCurrentUserProfileRow(user);
  const normalizedName = sanitizeName(values.name) || resolveDisplayName(user);
  const normalizedUsername = normalizeUsername(values.username);
  const normalizedBio = sanitizeBio(values.bio);
  const usernameChanged = normalizedUsername !== (currentProfile.username ?? "");

  if (usernameChanged) {
    assertUsernameCanBeUpdated(currentProfile, normalizedUsername);

    const usernameIsAvailable = await isUsernameAvailable(normalizedUsername, user.id);

    if (!usernameIsAvailable) {
      throw new Error("This username is already taken.");
    }
  }

  const resolvedAvatarUrl = values.avatarLocalUri
    ? await uploadAvatarFromDevice(user.id, values.avatarLocalUri)
    : values.avatarUrl?.trim() || null;

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update(
      buildProfileUpdateDto({
        username: normalizedUsername,
        usernameChanged,
        bio: normalizedBio || null,
        avatarUrl: resolvedAvatarUrl,
        name: normalizedName,
      }),
    )
    .eq("id", user.id)
    .select(PROFILE_SELECT_COLUMNS)
    .single<ProfileRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update profile.");
  }

  return mapProfileDtoToUserProfile(data, resolveDisplayName(user));
}

export async function updateCurrentUserThemePreference(
  user: User,
  themeMode: ThemeMode,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(PROFILES_TABLE)
    .update({
      theme_preference: themeMode,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutCurrentUser(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchPublicProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_SELECT_COLUMNS)
    .eq("username", normalizedUsername)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [stats, achievementData] = await Promise.all([
    fetchPublicUserStats(data.id),
    fetchPublicAchievementsForUser(data.id).catch(() => ({
      achievements: [],
      summary: {
        total: 0,
        unlocked: 0,
      },
    })),
  ]);

  return {
    profile: mapProfileDtoToUserProfile(data, "Habit Tracker User"),
    stats,
    achievements: achievementData.achievements,
    achievementSummary: achievementData.summary,
  };
}
