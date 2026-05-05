import type { ProfileDto } from "../dto";
import type { UserProfile } from "../types";
import {
  buildProfileUpdateDto,
  mapProfileDtoToUserProfile,
  mapUserProfileToFormValues,
} from "../mappers";

describe("profile mappers", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-03T14:20:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("maps profile dto to user profile with fallback name and light theme fallback", () => {
    const dto: ProfileDto = {
      id: "user-1",
      username: null,
      username_updated_at: null,
      bio: null,
      avatar_url: null,
      full_name: null,
      theme_preference: null,
    };

    expect(mapProfileDtoToUserProfile(dto, "Fallback User")).toEqual({
      id: "user-1",
      name: "Fallback User",
      username: null,
      usernameUpdatedAt: null,
      bio: null,
      avatarUrl: null,
      themePreference: "light",
    });
  });

  it("maps dark theme correctly and converts profile to form values", () => {
    const dto: ProfileDto = {
      id: "user-2",
      username: "alice",
      username_updated_at: "2026-05-30T00:00:00.000Z",
      bio: "Focused on progress",
      avatar_url: "https://cdn.example/avatar.png",
      full_name: "Alice Doe",
      theme_preference: "dark",
    };

    const profile = mapProfileDtoToUserProfile(dto, "Fallback");
    expect(profile.themePreference).toBe("dark");

    expect(mapUserProfileToFormValues(profile)).toEqual({
      name: "Alice Doe",
      username: "alice",
      bio: "Focused on progress",
      avatarUrl: "https://cdn.example/avatar.png",
    });
  });

  it("maps null profile fields to empty form values", () => {
    const profile: UserProfile = {
      id: "user-3",
      name: "No Extras",
      username: null,
      usernameUpdatedAt: null,
      bio: null,
      avatarUrl: null,
      themePreference: "light",
    };

    expect(mapUserProfileToFormValues(profile)).toEqual({
      name: "No Extras",
      username: "",
      bio: "",
      avatarUrl: "",
    });
  });

  it("builds profile update dto and includes username_updated_at only when changed", () => {
    expect(
      buildProfileUpdateDto({
        username: "alice",
        usernameChanged: true,
        bio: "Bio",
        avatarUrl: "https://cdn.example/a.png",
        name: "Alice",
      }),
    ).toEqual({
      username: "alice",
      username_updated_at: "2026-06-03T14:20:00.000Z",
      bio: "Bio",
      avatar_url: "https://cdn.example/a.png",
      full_name: "Alice",
    });

    expect(
      buildProfileUpdateDto({
        username: "alice",
        usernameChanged: false,
        bio: null,
        avatarUrl: null,
        name: "Alice",
      }),
    ).toEqual({
      username: "alice",
      bio: null,
      avatar_url: null,
      full_name: "Alice",
    });
  });
});
