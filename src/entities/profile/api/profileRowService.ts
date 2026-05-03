import type { User } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/api/supabase/client";

import { normalizeUsername } from "../model/validators";
import { PROFILES_TABLE, PROFILE_SELECT_COLUMNS, type ProfileRow } from "./profileDb";
import {
  createProfileInsertPayload,
  resolveDisplayName,
  resolveProviderAvatarUrl,
} from "./profileIdentity";

export async function ensureCurrentUserProfileRow(user: User): Promise<ProfileRow> {
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
