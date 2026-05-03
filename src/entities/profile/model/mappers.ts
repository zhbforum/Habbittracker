import type { ProfileDto, ProfileUpdateDto } from "./dto";
import type { ProfileFormValues, UserProfile } from "./types";

export function mapProfileDtoToUserProfile(
  dto: ProfileDto,
  fallbackName: string,
): UserProfile {
  return {
    id: dto.id,
    name: dto.full_name || fallbackName,
    username: dto.username,
    usernameUpdatedAt: dto.username_updated_at,
    bio: dto.bio,
    avatarUrl: dto.avatar_url,
    themePreference: dto.theme_preference === "dark" ? "dark" : "light",
  };
}

export function mapUserProfileToFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    username: profile.username ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

type BuildProfileUpdateDtoArgs = {
  username: string;
  usernameChanged: boolean;
  bio: string | null;
  avatarUrl: string | null;
  name: string;
};

export function buildProfileUpdateDto({
  username,
  usernameChanged,
  bio,
  avatarUrl,
  name,
}: BuildProfileUpdateDtoArgs): ProfileUpdateDto {
  return {
    username,
    ...(usernameChanged ? { username_updated_at: new Date().toISOString() } : {}),
    bio,
    avatar_url: avatarUrl,
    full_name: name,
  };
}
