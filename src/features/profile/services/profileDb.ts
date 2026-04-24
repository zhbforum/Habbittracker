import type { ProfileDto } from "../model/dto";

export const PROFILES_TABLE = "profiles";
export const HABITS_TABLE = "habits";
export const AVATARS_BUCKET = "avatars";

export type ProfileRow = ProfileDto;

export const PROFILE_SELECT_COLUMNS =
  "id,username,username_updated_at,bio,avatar_url,full_name,theme_preference";
