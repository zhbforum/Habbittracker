import type { User } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/api/supabase/client";
import type { ThemeMode } from "@/shared/theme";

import { buildProfileUpdateDto, mapProfileDtoToUserProfile } from "../model/mappers";
import type { ProfileBundle, PublicProfile, UserProfile } from "../model/types";
import { normalizeUsername, sanitizeBio, sanitizeName } from "../model/validators";
import { uploadAvatarFromDevice } from "./profileAvatar";
import { PROFILES_TABLE, PROFILE_SELECT_COLUMNS, type ProfileRow } from "./profileDb";
import {
  assertUsernameCanBeUpdated,
  createProfileInsertPayload,
  getUsernameNextChangeAt,
  resolveDisplayName,
  resolveProviderAvatarUrl,
} from "./profileIdentity";
import { fetchCurrentUserStats, fetchPublicUserStats } from "./profileStats";

async function ensureCurrentUserProfileRow(user: User): Promise<ProfileRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_SELECT_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from(PROFILES_TABLE)
      .insert(createProfileInsertPayload(user))
      .select(PROFILE_SELECT_COLUMNS)
      .single<ProfileRow>();

    if (insertError || !insertedProfile) {
      throw new Error(insertError?.message ?? "Unable to initialize profile.");
    }

    return insertedProfile;
  }

  const providerAvatarUrl = resolveProviderAvatarUrl(user);
  const displayName = resolveDisplayName(user);
  const needsAvatarBackfill = !data.avatar_url && providerAvatarUrl;
  const needsNameBackfill = !data.full_name && displayName;

  if (!needsAvatarBackfill && !needsNameBackfill) {
    return data;
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from(PROFILES_TABLE)
    .update({
      ...(needsAvatarBackfill ? { avatar_url: providerAvatarUrl } : {}),
      ...(needsNameBackfill ? { full_name: displayName } : {}),
    })
    .eq("id", user.id)
    .select(PROFILE_SELECT_COLUMNS)
    .single<ProfileRow>();

  if (updateError || !updatedProfile) {
    return data;
  }

  return updatedProfile;
}

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
  const profileRow = await ensureCurrentUserProfileRow(user);
  const stats = await fetchCurrentUserStats(user.id);

  return {
    profile: mapProfileDtoToUserProfile(profileRow, resolveDisplayName(user)),
    stats,
  };
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return false;
  }

  const supabase = getSupabaseClient();

  let query = supabase
    .from(PROFILES_TABLE)
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("username", normalizedUsername);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) === 0;
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

  const stats = await fetchPublicUserStats(data.id);

  return {
    profile: mapProfileDtoToUserProfile(data, "Habit Tracker User"),
    stats,
  };
}
