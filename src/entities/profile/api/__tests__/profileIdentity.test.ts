import { createSupabaseUser } from "@/test/fixtures/auth";
import { USERNAME_CHANGE_COOLDOWN_DAYS } from "@entities/profile/model/constants";

import {
  assertUsernameCanBeUpdated,
  createProfileInsertPayload,
  getUsernameNextChangeAt,
  resolveDisplayName,
  resolveProviderAvatarUrl,
} from "../profileIdentity";

describe("profileIdentity", () => {
  describe("resolveDisplayName", () => {
    it.each([
      {
        name: "Given full_name in metadata, When resolving display name, Then it uses full_name",
        user: createSupabaseUser({
          email: "fallback@example.com",
          user_metadata: { full_name: "Ada Lovelace", name: "Ada" },
        }),
        expected: "Ada Lovelace",
      },
      {
        name: "Given only name in metadata, When resolving display name, Then it uses name",
        user: createSupabaseUser({
          email: "fallback@example.com",
          user_metadata: { name: "Grace Hopper" },
        }),
        expected: "Grace Hopper",
      },
      {
        name: "Given no metadata name and existing email, When resolving display name, Then it uses email prefix",
        user: createSupabaseUser({
          email: "linus@example.com",
          user_metadata: {},
        }),
        expected: "linus",
      },
      {
        name: "Given no metadata name and no email, When resolving display name, Then it uses default fallback",
        user: createSupabaseUser({
          email: undefined,
          user_metadata: {},
        }),
        expected: "Habit Tracker User",
      },
    ])("$name", ({ user, expected }) => {
      expect(resolveDisplayName(user)).toBe(expected);
    });
  });

  describe("resolveProviderAvatarUrl", () => {
    it.each([
      {
        name: "Given avatar_url in metadata, When resolving provider avatar, Then it returns avatar_url",
        user: createSupabaseUser({
          user_metadata: {
            avatar_url: "https://cdn.example.com/avatar.jpg",
            picture: "https://cdn.example.com/picture.jpg",
          },
        }),
        expected: "https://cdn.example.com/avatar.jpg",
      },
      {
        name: "Given picture only in metadata, When resolving provider avatar, Then it returns picture",
        user: createSupabaseUser({
          user_metadata: {
            picture: "https://cdn.example.com/picture.jpg",
          },
        }),
        expected: "https://cdn.example.com/picture.jpg",
      },
      {
        name: "Given no avatar metadata, When resolving provider avatar, Then it returns null",
        user: createSupabaseUser({
          user_metadata: {},
        }),
        expected: null,
      },
    ])("$name", ({ user, expected }) => {
      expect(resolveProviderAvatarUrl(user)).toBe(expected);
    });
  });

  describe("createProfileInsertPayload", () => {
    it("Given user metadata has name and avatar, When creating insert payload, Then profile payload uses resolved fields and default light theme", () => {
      const user = createSupabaseUser({
        id: "user-create",
        email: "fallback@example.com",
        user_metadata: {
          full_name: "Create User",
          avatar_url: "https://cdn.example.com/create-user.jpg",
        },
      });

      expect(createProfileInsertPayload(user)).toEqual({
        id: "user-create",
        full_name: "Create User",
        avatar_url: "https://cdn.example.com/create-user.jpg",
        theme_preference: "light",
      });
    });
  });

  describe("getUsernameNextChangeAt", () => {
    it("Given valid username update date, When resolving next change date, Then it applies cooldown days", () => {
      const changedAt = "2026-06-10T12:00:00.000Z";
      const expected = new Date(
        new Date(changedAt).getTime() +
          USERNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      );

      expect(getUsernameNextChangeAt(changedAt)?.toISOString()).toBe(
        expected.toISOString(),
      );
    });

    it("Given null or invalid username update date, When resolving next change date, Then it returns null", () => {
      expect(getUsernameNextChangeAt(null)).toBeNull();
      expect(getUsernameNextChangeAt("not-a-date")).toBeNull();
    });
  });

  describe("assertUsernameCanBeUpdated", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("Given cooldown already passed, When validating username change, Then no error is thrown", () => {
      const currentProfile = {
        id: "user-1",
        username: "current-user",
        username_updated_at: "2026-05-01T12:00:00.000Z",
        bio: null,
        avatar_url: null,
        full_name: "User",
        theme_preference: "light" as const,
      };

      expect(() =>
        assertUsernameCanBeUpdated(currentProfile, "next-user"),
      ).not.toThrow();
    });

    it("Given cooldown is still active, When validating username change, Then it throws clear business error", () => {
      const currentProfile = {
        id: "user-2",
        username: "current-user",
        username_updated_at: "2026-06-10T12:00:00.000Z",
        bio: null,
        avatar_url: null,
        full_name: "User",
        theme_preference: "dark" as const,
      };

      expect(() =>
        assertUsernameCanBeUpdated(currentProfile, "next-user"),
      ).toThrow(
        /Username can be changed once every 14 days\. Next change is available on/i,
      );
    });

    it("Given cooldown is active but username does not change, When validating, Then no error is thrown", () => {
      const currentProfile = {
        id: "user-3",
        username: "same-user",
        username_updated_at: "2026-06-14T12:00:00.000Z",
        bio: null,
        avatar_url: null,
        full_name: "User",
        theme_preference: "light" as const,
      };

      expect(() =>
        assertUsernameCanBeUpdated(currentProfile, "same-user"),
      ).not.toThrow();
    });
  });
});
