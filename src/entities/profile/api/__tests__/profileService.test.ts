import { createSupabaseUser } from "@/test/fixtures/auth";
import {
  createAchievementProgress,
  createAchievementSummary,
  createUserStats,
} from "@/test/fixtures/profile";
import { getSupabaseClient } from "@/shared/api/supabase/client";
import {
  fetchPublicAchievementsForUser,
  resolveAndSyncAchievementsForUser,
} from "@entities/achievement/api/achievementService";

import type { ProfileRow } from "../profileDb";
import {
  fetchCurrentUserProfileBundle,
  fetchPublicProfileByUsername,
  getUsernameChangeInfo,
  signOutCurrentUser,
  updateCurrentUserProfile,
  updateCurrentUserThemePreference,
} from "../profileService";
import { uploadAvatarFromDevice } from "../profileAvatar";
import { PROFILE_SELECT_COLUMNS, PROFILES_TABLE } from "../profileDb";
import { ensureCurrentUserProfileRow, isUsernameAvailable } from "../profileRowService";
import { fetchCurrentUserStats, fetchPublicUserStats } from "../profileStats";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock("@entities/achievement/api/achievementService", () => ({
  resolveAndSyncAchievementsForUser: jest.fn(),
  fetchPublicAchievementsForUser: jest.fn(),
}));

jest.mock("../profileAvatar", () => ({
  uploadAvatarFromDevice: jest.fn(),
}));

jest.mock("../profileRowService", () => ({
  ensureCurrentUserProfileRow: jest.fn(),
  isUsernameAvailable: jest.fn(),
}));

jest.mock("../profileStats", () => ({
  fetchCurrentUserStats: jest.fn(),
  fetchPublicUserStats: jest.fn(),
}));

const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;
const resolveAndSyncAchievementsForUserMock =
  resolveAndSyncAchievementsForUser as jest.MockedFunction<
    typeof resolveAndSyncAchievementsForUser
  >;
const fetchPublicAchievementsForUserMock =
  fetchPublicAchievementsForUser as jest.MockedFunction<
    typeof fetchPublicAchievementsForUser
  >;
const uploadAvatarFromDeviceMock = uploadAvatarFromDevice as jest.MockedFunction<
  typeof uploadAvatarFromDevice
>;
const ensureCurrentUserProfileRowMock =
  ensureCurrentUserProfileRow as jest.MockedFunction<typeof ensureCurrentUserProfileRow>;
const isUsernameAvailableMock = isUsernameAvailable as jest.MockedFunction<
  typeof isUsernameAvailable
>;
const fetchCurrentUserStatsMock = fetchCurrentUserStats as jest.MockedFunction<
  typeof fetchCurrentUserStats
>;
const fetchPublicUserStatsMock = fetchPublicUserStats as jest.MockedFunction<
  typeof fetchPublicUserStats
>;

function createProfileRow(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "user-1",
    username: "alex",
    username_updated_at: "2026-06-01T10:00:00.000Z",
    bio: "Keep going.",
    avatar_url: "https://example.com/avatar.png",
    full_name: "Alex Doe",
    theme_preference: "light",
    ...overrides,
  };
}

function createProfileUpdateSupabaseMock(args: {
  updateResult: { data: ProfileRow | null; error: { message: string } | null };
}) {
  const single = jest.fn().mockResolvedValue(args.updateResult);
  const select = jest.fn().mockReturnValue({
    single,
  });
  const eq = jest.fn().mockReturnValue({
    select,
  });
  const update = jest.fn().mockReturnValue({
    eq,
  });
  const from = jest.fn().mockReturnValue({
    update,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    update,
    eq,
    select,
  };
}

function createPublicProfileFetchSupabaseMock(args: {
  fetchResult: { data: ProfileRow | null; error: { message: string } | null };
}) {
  const maybeSingle = jest.fn().mockResolvedValue(args.fetchResult);
  const eq = jest.fn().mockReturnValue({
    maybeSingle,
  });
  const select = jest.fn().mockReturnValue({
    eq,
  });
  const from = jest.fn().mockReturnValue({
    select,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    select,
    eq,
    maybeSingle,
  };
}

describe("profileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    ensureCurrentUserProfileRowMock.mockResolvedValue(
      createProfileRow({
        id: "user-default",
      }),
    );
    isUsernameAvailableMock.mockResolvedValue(true);
    uploadAvatarFromDeviceMock.mockResolvedValue("https://example.com/uploaded-avatar.png");
    fetchCurrentUserStatsMock.mockResolvedValue(createUserStats());
    fetchPublicUserStatsMock.mockResolvedValue(createUserStats());

    resolveAndSyncAchievementsForUserMock.mockResolvedValue({
      achievements: [createAchievementProgress()],
      summary: createAchievementSummary(),
    });
    fetchPublicAchievementsForUserMock.mockResolvedValue({
      achievements: [createAchievementProgress()],
      summary: createAchievementSummary(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("getUsernameChangeInfo", () => {
    it("Given user has no username, When resolving username change info, Then username can be changed immediately", () => {
      expect(getUsernameChangeInfo(null, null)).toEqual({
        canChangeNow: true,
        nextChangeAt: null,
      });
    });

    it("Given cooldown window is active, When resolving username change info, Then it returns future nextChangeAt and canChangeNow false", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-06-15T12:00:00.000Z"));

      const result = getUsernameChangeInfo("alex", "2026-06-10T12:00:00.000Z");

      expect(result.canChangeNow).toBe(false);
      expect(result.nextChangeAt?.toISOString()).toBe("2026-06-24T12:00:00.000Z");
    });
  });

  describe("fetchCurrentUserProfileBundle", () => {
    it("Given profile, stats and achievements are loaded, When fetching current user bundle, Then it returns unified profile data", async () => {
      const user = createSupabaseUser({
        id: "user-bundle",
        email: "bundle-user@example.com",
      });
      const profileRow = createProfileRow({
        id: user.id,
        full_name: null,
      });
      const stats = createUserStats({
        totalHabits: 7,
        currentStreak: 5,
      });
      const achievements = [createAchievementProgress()];
      const summary = createAchievementSummary({
        total: 3,
        unlocked: 1,
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(profileRow);
      fetchCurrentUserStatsMock.mockResolvedValue(stats);
      resolveAndSyncAchievementsForUserMock.mockResolvedValue({
        achievements,
        summary,
      });

      const result = await fetchCurrentUserProfileBundle(user);

      expect(result).toEqual({
        profile: {
          id: "user-bundle",
          name: "bundle-user",
          username: "alex",
          usernameUpdatedAt: "2026-06-01T10:00:00.000Z",
          bio: "Keep going.",
          avatarUrl: "https://example.com/avatar.png",
          themePreference: "light",
        },
        stats,
        achievements,
        achievementSummary: summary,
      });
      expect(ensureCurrentUserProfileRowMock).toHaveBeenCalledWith(user);
      expect(fetchCurrentUserStatsMock).toHaveBeenCalledWith(user.id);
      expect(resolveAndSyncAchievementsForUserMock).toHaveBeenCalledWith(user.id);
    });

    it("Given achievements sync fails, When fetching current user bundle, Then it falls back to empty achievements summary", async () => {
      const user = createSupabaseUser({
        id: "user-bundle-fallback",
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(
        createProfileRow({
          id: user.id,
        }),
      );
      resolveAndSyncAchievementsForUserMock.mockRejectedValueOnce(
        new Error("achievement sync failed"),
      );

      const result = await fetchCurrentUserProfileBundle(user);

      expect(result.achievements).toEqual([]);
      expect(result.achievementSummary).toEqual({
        total: 0,
        unlocked: 0,
      });
      expect(fetchCurrentUserStatsMock).toHaveBeenCalledWith(user.id);
      expect(resolveAndSyncAchievementsForUserMock).toHaveBeenCalledWith(user.id);
    });
  });

  describe("updateCurrentUserProfile", () => {
    it("Given unchanged username and trimmed fields, When updating profile, Then it updates normalized payload without username availability check", async () => {
      const user = createSupabaseUser({
        id: "user-update-1",
        email: "alex@example.com",
      });
      const currentProfile = createProfileRow({
        id: "user-update-1",
        username: "alex",
        username_updated_at: null,
      });
      const updatedProfileRow = createProfileRow({
        id: "user-update-1",
        username: "alex",
        full_name: "Alex Doe",
        bio: "Focus daily",
        avatar_url: "https://example.com/new-avatar.png",
      });
      const supabase = createProfileUpdateSupabaseMock({
        updateResult: { data: updatedProfileRow, error: null },
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(currentProfile);

      const result = await updateCurrentUserProfile(user, {
        name: "  Alex   Doe  ",
        username: "  alex  ",
        bio: "  Focus   daily ",
        avatarUrl: "  https://example.com/new-avatar.png  ",
      });

      expect(isUsernameAvailableMock).not.toHaveBeenCalled();
      expect(uploadAvatarFromDeviceMock).not.toHaveBeenCalled();

      const updatePayload = supabase.update.mock.calls[0]?.[0];
      expect(updatePayload).toMatchObject({
        username: "alex",
        bio: "Focus daily",
        avatar_url: "https://example.com/new-avatar.png",
        full_name: "Alex Doe",
      });
      expect(updatePayload).not.toHaveProperty("username_updated_at");
      expect(ensureCurrentUserProfileRowMock).toHaveBeenCalledWith(user);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.eq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(result.name).toBe("Alex Doe");
      expect(result.bio).toBe("Focus daily");
    });

    it("Given changed username is available, When updating profile, Then it validates availability and sets username_updated_at", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-07-01T08:00:00.000Z"));

      const user = createSupabaseUser({
        id: "user-update-2",
      });
      const currentProfile = createProfileRow({
        id: "user-update-2",
        username: "old_name",
        username_updated_at: null,
      });
      const updatedProfileRow = createProfileRow({
        id: "user-update-2",
        username: "new_name",
      });
      const supabase = createProfileUpdateSupabaseMock({
        updateResult: { data: updatedProfileRow, error: null },
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(currentProfile);
      isUsernameAvailableMock.mockResolvedValueOnce(true);

      await updateCurrentUserProfile(user, {
        name: "Alex",
        username: "  NEW_NAME  ",
        bio: "",
        avatarUrl: "",
      });

      expect(isUsernameAvailableMock).toHaveBeenCalledWith("new_name", "user-update-2");
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.eq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(supabase.update.mock.calls[0]?.[0]).toEqual({
        username: "new_name",
        username_updated_at: "2026-07-01T08:00:00.000Z",
        bio: null,
        avatar_url: null,
        full_name: "Alex",
      });
    });

    it("Given changed username is still under cooldown, When updating profile, Then it throws cooldown error and skips availability query", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-06-15T12:00:00.000Z"));

      const user = createSupabaseUser({
        id: "user-update-cooldown",
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(
        createProfileRow({
          id: user.id,
          username: "current_name",
          username_updated_at: "2026-06-10T12:00:00.000Z",
        }),
      );
      const from = jest.fn();
      getSupabaseClientMock.mockReturnValue({
        from,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(
        updateCurrentUserProfile(user, {
          name: "Alex",
          username: "next_name",
          bio: "",
          avatarUrl: "",
        }),
      ).rejects.toThrow(/Username can be changed once every 14 days\./i);

      expect(isUsernameAvailableMock).not.toHaveBeenCalled();
      expect(from).not.toHaveBeenCalled();
    });

    it("Given changed username is taken, When updating profile, Then it throws user-facing business error and skips update", async () => {
      const user = createSupabaseUser({
        id: "user-update-3",
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(
        createProfileRow({
          id: "user-update-3",
          username: "current_name",
          username_updated_at: null,
        }),
      );
      isUsernameAvailableMock.mockResolvedValueOnce(false);
      const from = jest.fn();
      getSupabaseClientMock.mockReturnValue({
        from,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(
        updateCurrentUserProfile(user, {
          name: "Alex",
          username: "next_name",
          bio: "",
          avatarUrl: "",
        }),
      ).rejects.toThrow("This username is already taken.");

      expect(isUsernameAvailableMock).toHaveBeenCalledWith("next_name", user.id);
      expect(from).not.toHaveBeenCalled();
    });

    it("Given avatar local URI is provided, When updating profile, Then it uploads avatar and stores uploaded URL", async () => {
      const user = createSupabaseUser({
        id: "user-update-4",
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(
        createProfileRow({
          id: "user-update-4",
          username: "alex",
          username_updated_at: null,
        }),
      );
      uploadAvatarFromDeviceMock.mockResolvedValueOnce(
        "https://cdn.example.com/uploaded/profile.png",
      );
      const supabase = createProfileUpdateSupabaseMock({
        updateResult: {
          data: createProfileRow({
            id: "user-update-4",
            avatar_url: "https://cdn.example.com/uploaded/profile.png",
          }),
          error: null,
        },
      });

      await updateCurrentUserProfile(user, {
        name: "Alex",
        username: "alex",
        bio: "bio",
        avatarUrl: "https://example.com/old.png",
        avatarLocalUri: "file:///storage/new-profile.png",
      });

      expect(uploadAvatarFromDeviceMock).toHaveBeenCalledWith(
        "user-update-4",
        "file:///storage/new-profile.png",
      );
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.eq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(supabase.update.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          avatar_url: "https://cdn.example.com/uploaded/profile.png",
        }),
      );
    });

    it("Given Supabase update fails, When updating profile, Then it throws update error message", async () => {
      const user = createSupabaseUser({
        id: "user-update-5",
      });
      ensureCurrentUserProfileRowMock.mockResolvedValue(
        createProfileRow({
          id: "user-update-5",
          username: "alex",
          username_updated_at: null,
        }),
      );
      createProfileUpdateSupabaseMock({
        updateResult: { data: null, error: { message: "Unable to persist profile." } },
      });

      await expect(
        updateCurrentUserProfile(user, {
          name: "Alex",
          username: "alex",
          bio: "",
          avatarUrl: "",
        }),
      ).rejects.toThrow("Unable to persist profile.");

      expect(getSupabaseClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateCurrentUserThemePreference", () => {
    it("Given valid theme mode, When updating theme preference, Then it updates profile theme", async () => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const update = jest.fn().mockReturnValue({
        eq,
      });
      const from = jest.fn().mockReturnValue({
        update,
      });
      getSupabaseClientMock.mockReturnValue({
        from,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await updateCurrentUserThemePreference(createSupabaseUser({ id: "user-theme" }), "dark");

      expect(from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(update).toHaveBeenCalledWith({
        theme_preference: "dark",
      });
      expect(eq).toHaveBeenCalledWith("id", "user-theme");
    });

    it("Given Supabase returns update error, When updating theme preference, Then it throws error", async () => {
      const eq = jest.fn().mockResolvedValue({
        error: {
          message: "theme update failed",
        },
      });
      const update = jest.fn().mockReturnValue({
        eq,
      });
      const from = jest.fn().mockReturnValue({
        update,
      });
      getSupabaseClientMock.mockReturnValue({
        from,
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(
        updateCurrentUserThemePreference(createSupabaseUser({ id: "user-theme-error" }), "light"),
      ).rejects.toThrow("theme update failed");

      expect(from).toHaveBeenCalledWith(PROFILES_TABLE);
    });
  });

  describe("signOutCurrentUser", () => {
    it("Given sign out succeeds, When signing out current user, Then it resolves successfully", async () => {
      const signOut = jest.fn().mockResolvedValue({
        error: null,
      });
      getSupabaseClientMock.mockReturnValue({
        auth: {
          signOut,
        },
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(signOutCurrentUser()).resolves.toBeUndefined();
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    it("Given sign out fails, When signing out current user, Then it throws Supabase message", async () => {
      const signOut = jest.fn().mockResolvedValue({
        error: {
          message: "sign out failed",
        },
      });
      getSupabaseClientMock.mockReturnValue({
        auth: {
          signOut,
        },
      } as unknown as ReturnType<typeof getSupabaseClient>);

      await expect(signOutCurrentUser()).rejects.toThrow("sign out failed");
    });
  });

  describe("fetchPublicProfileByUsername", () => {
    it("Given empty username, When fetching public profile, Then it returns null without querying Supabase", async () => {
      const result = await fetchPublicProfileByUsername("   ");

      expect(result).toBeNull();
      expect(getSupabaseClientMock).not.toHaveBeenCalled();
    });

    it("Given Supabase query fails, When fetching public profile, Then it throws query error", async () => {
      const supabase = createPublicProfileFetchSupabaseMock({
        fetchResult: { data: null, error: { message: "public profile query failed" } },
      });

      await expect(fetchPublicProfileByUsername("alex")).rejects.toThrow(
        "public profile query failed",
      );
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(supabase.eq).toHaveBeenCalledWith("username", "alex");
    });

    it("Given public profile does not exist, When fetching by username, Then it returns null", async () => {
      const supabase = createPublicProfileFetchSupabaseMock({
        fetchResult: { data: null, error: null },
      });

      await expect(fetchPublicProfileByUsername("alex")).resolves.toBeNull();
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(supabase.eq).toHaveBeenCalledWith("username", "alex");
      expect(fetchPublicUserStatsMock).not.toHaveBeenCalled();
      expect(fetchPublicAchievementsForUserMock).not.toHaveBeenCalled();
    });

    it("Given public profile exists, When fetching by username, Then it normalizes username and returns mapped profile bundle", async () => {
      const profileRow = createProfileRow({
        id: "public-user-1",
        username: "alex",
        full_name: null,
      });
      const supabase = createPublicProfileFetchSupabaseMock({
        fetchResult: { data: profileRow, error: null },
      });
      const stats = createUserStats({
        totalHabits: 9,
        currentStreak: 4,
      });
      const achievements = [createAchievementProgress()];
      const summary = createAchievementSummary({
        total: 4,
        unlocked: 2,
      });
      fetchPublicUserStatsMock.mockResolvedValueOnce(stats);
      fetchPublicAchievementsForUserMock.mockResolvedValueOnce({
        achievements,
        summary,
      });

      const result = await fetchPublicProfileByUsername("  ALEx  ");

      expect(supabase.eq).toHaveBeenCalledWith("username", "alex");
      expect(result).toEqual({
        profile: {
          id: "public-user-1",
          name: "Habit Tracker User",
          username: "alex",
          usernameUpdatedAt: "2026-06-01T10:00:00.000Z",
          bio: "Keep going.",
          avatarUrl: "https://example.com/avatar.png",
          themePreference: "light",
        },
        stats,
        achievements,
        achievementSummary: summary,
      });
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.select).toHaveBeenCalledWith(PROFILE_SELECT_COLUMNS);
      expect(fetchPublicUserStatsMock).toHaveBeenCalledWith("public-user-1");
      expect(fetchPublicAchievementsForUserMock).toHaveBeenCalledWith("public-user-1");
    });

    it("Given public achievements fetch fails, When fetching public profile, Then it returns stats with empty achievements fallback", async () => {
      const supabase = createPublicProfileFetchSupabaseMock({
        fetchResult: {
          data: createProfileRow({
            id: "public-user-2",
            username: "public-user",
          }),
          error: null,
        },
      });
      fetchPublicUserStatsMock.mockResolvedValueOnce(
        createUserStats({
          totalHabits: 3,
          currentStreak: 1,
        }),
      );
      fetchPublicAchievementsForUserMock.mockRejectedValueOnce(
        new Error("achievement list unavailable"),
      );

      const result = await fetchPublicProfileByUsername("public-user");

      expect(result?.achievements).toEqual([]);
      expect(result?.achievementSummary).toEqual({
        total: 0,
        unlocked: 0,
      });
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(fetchPublicUserStatsMock).toHaveBeenCalledWith("public-user-2");
      expect(fetchPublicAchievementsForUserMock).toHaveBeenCalledWith("public-user-2");
    });
  });
});
