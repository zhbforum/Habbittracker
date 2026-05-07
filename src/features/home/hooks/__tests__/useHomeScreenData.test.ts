import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";
import type { ProfileBundle } from "@entities/profile/model/types";
import { fetchCurrentUserProfileBundle, resolveDisplayName } from "@entities/profile";
import { showErrorToast } from "@shared/ui";

import { useHomeScreenData } from "../useHomeScreenData";

let focusEffectCallback: (() => void) | null = null;

jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn((effect: () => void) => {
    focusEffectCallback = effect;
  }),
}));

jest.mock("@entities/habit/api/habitStorage", () => ({
  fetchHabitsForUser: jest.fn(),
}));

jest.mock("@entities/habit/api/habitGroupStorage", () => ({
  fetchHabitGroupsForUser: jest.fn(),
}));

jest.mock("@entities/profile", () => ({
  fetchCurrentUserProfileBundle: jest.fn(),
  resolveDisplayName: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
}));

const fetchHabitsForUserMock = fetchHabitsForUser as jest.MockedFunction<typeof fetchHabitsForUser>;
const fetchHabitGroupsForUserMock =
  fetchHabitGroupsForUser as jest.MockedFunction<typeof fetchHabitGroupsForUser>;
const fetchCurrentUserProfileBundleMock =
  fetchCurrentUserProfileBundle as jest.MockedFunction<typeof fetchCurrentUserProfileBundle>;
const resolveDisplayNameMock = resolveDisplayName as jest.MockedFunction<typeof resolveDisplayName>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;

function buildProfileBundle(name: string): ProfileBundle {
  return {
    profile: {
      id: "user-1",
      name,
      username: null,
      usernameUpdatedAt: null,
      bio: null,
      avatarUrl: null,
      themePreference: "light",
    },
    stats: {
      totalHabits: 2,
      currentStreak: 1,
    },
    achievements: [],
    achievementSummary: {
      total: 0,
      unlocked: 0,
    },
  };
}

function triggerFocusEffect() {
  if (!focusEffectCallback) {
    throw new Error("Expected focus effect callback to be set.");
  }

  act(() => {
    focusEffectCallback?.();
  });
}

describe("useHomeScreenData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 1, 9, 0, 0, 0));
    focusEffectCallback = null;
    resolveDisplayNameMock.mockReturnValue("Fallback User");
    fetchHabitsForUserMock.mockResolvedValue([]);
    fetchHabitGroupsForUserMock.mockResolvedValue([]);
    fetchCurrentUserProfileBundleMock.mockResolvedValue(buildProfileBundle(""));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads habits/groups on focus and prefers trimmed remote display name", async () => {
    const user = createSupabaseUser({ id: "user-1" });
    const syncAchievements = jest.fn();
    const habits = [createHabit("h1"), createHabit("h2")];
    const groups = [createHabitGroup("g1")];

    fetchHabitsForUserMock.mockResolvedValueOnce(habits);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce(groups);
    fetchCurrentUserProfileBundleMock.mockResolvedValueOnce(buildProfileBundle("  Alice  "));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: "Initial Name",
        syncAchievements,
      }),
    );

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchHabitsForUserMock).toHaveBeenCalledWith("user-1");
    expect(fetchHabitGroupsForUserMock).toHaveBeenCalledWith("user-1");
    expect(fetchCurrentUserProfileBundleMock).toHaveBeenCalledWith(user);
    expect(result.current.habits).toEqual(habits);
    expect(result.current.groups).toEqual(groups);
    expect(result.current.displayName).toBe("Alice");
    expect(result.current.errorMessage).toBeNull();
    expect(syncAchievements).toHaveBeenCalledTimes(1);
    expect(showErrorToastMock).not.toHaveBeenCalled();
  });

  it("keeps current display name when remote profile name is empty", async () => {
    const user = createSupabaseUser({ id: "user-2" });

    fetchHabitsForUserMock.mockResolvedValueOnce([]);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce([]);
    fetchCurrentUserProfileBundleMock.mockResolvedValueOnce(buildProfileBundle("   "));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: "Current Name",
        syncAchievements: jest.fn(),
      }),
    );

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.displayName).toBe("Current Name");
    expect(resolveDisplayNameMock).not.toHaveBeenCalled();
  });

  it("falls back to resolveDisplayName when both remote and current names are empty", async () => {
    const user = createSupabaseUser({ id: "user-3", email: "someone@example.com" });
    resolveDisplayNameMock.mockReturnValueOnce("Resolved User");

    fetchHabitsForUserMock.mockResolvedValueOnce([]);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce([]);
    fetchCurrentUserProfileBundleMock.mockResolvedValueOnce(buildProfileBundle("  "));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: "  ",
        syncAchievements: jest.fn(),
      }),
    );

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(resolveDisplayNameMock).toHaveBeenCalledWith(user);
    expect(result.current.displayName).toBe("Resolved User");
  });

  it("continues loading habits when profile bundle request fails", async () => {
    const user = createSupabaseUser({ id: "user-3b", email: "recover@example.com" });
    const syncAchievements = jest.fn();
    resolveDisplayNameMock.mockReturnValueOnce("Recovered User");

    fetchHabitsForUserMock.mockResolvedValueOnce([createHabit("h-recover")]);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce([createHabitGroup("g-recover")]);
    fetchCurrentUserProfileBundleMock.mockRejectedValueOnce(new Error("profile unavailable"));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: " ",
        syncAchievements,
      }),
    );

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.displayName).toBe("Recovered User");
    expect(result.current.habits).toEqual([createHabit("h-recover")]);
    expect(result.current.groups).toEqual([createHabitGroup("g-recover")]);
    expect(syncAchievements).toHaveBeenCalledTimes(1);
    expect(showErrorToastMock).not.toHaveBeenCalled();
  });

  it("sets error state and shows toast when load fails", async () => {
    const user = createSupabaseUser({ id: "user-4" });
    const syncAchievements = jest.fn();

    fetchHabitsForUserMock.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: "Fallback",
        syncAchievements,
      }),
    );

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe("network down");
    expect(result.current.displayName).toBe("Fallback");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to load home", "network down");
    expect(syncAchievements).not.toHaveBeenCalled();
  });

  it("updates now every minute", () => {
    const user = createSupabaseUser({ id: "user-5" });

    fetchHabitsForUserMock.mockResolvedValue([]);
    fetchHabitGroupsForUserMock.mockResolvedValue([]);
    fetchCurrentUserProfileBundleMock.mockResolvedValue(buildProfileBundle("Name"));

    const { result } = renderHook(() =>
      useHomeScreenData({
        user,
        initialDisplayName: "Fallback",
        syncAchievements: jest.fn(),
      }),
    );

    const initialNow = result.current.now.getTime();

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(result.current.now.getTime()).toBe(initialNow + 60 * 1000);
  });
});
