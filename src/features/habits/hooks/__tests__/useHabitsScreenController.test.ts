import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { resolveAndSyncAchievementsForUser } from "@entities/achievement";
import { fetchHabitGroupsForUser } from "@features/habits/services/habitGroupStorageService";
import { fetchHabitsForUser } from "@features/habits/services/habitStorageService";
import { showErrorToast } from "@shared/ui";

import { useHabitsScreenController } from "../useHabitsScreenController";

jest.mock("@entities/achievement", () => ({
  resolveAndSyncAchievementsForUser: jest.fn(),
}));

jest.mock("@features/habits/services/habitStorageService", () => ({
  fetchHabitsForUser: jest.fn(),
}));

jest.mock("@features/habits/services/habitGroupStorageService", () => ({
  fetchHabitGroupsForUser: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
}));

const resolveAndSyncAchievementsForUserMock =
  resolveAndSyncAchievementsForUser as jest.MockedFunction<typeof resolveAndSyncAchievementsForUser>;
const fetchHabitsForUserMock = fetchHabitsForUser as jest.MockedFunction<typeof fetchHabitsForUser>;
const fetchHabitGroupsForUserMock =
  fetchHabitGroupsForUser as jest.MockedFunction<typeof fetchHabitGroupsForUser>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;

const todayKey = "2026-06-15";

const habits = [
  createHabit("habit-1", {
    name: "Drink water",
    kind: "positive",
    completions: {
      [todayKey]: {
        completedAt: "2026-06-15T07:00:00.000Z",
        value: null,
      },
    },
  }),
  createHabit("habit-2", {
    name: "No sugar",
    kind: "negative",
  }),
];

const groups = [
  createHabitGroup("group-1", {
    name: "Morning routine",
    habitIds: ["habit-1"],
    dailyGoal: 1,
  }),
];

describe("useHabitsScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-15T10:00:00.000Z"));

    fetchHabitsForUserMock.mockResolvedValue(habits);
    fetchHabitGroupsForUserMock.mockResolvedValue(groups);
    resolveAndSyncAchievementsForUserMock.mockResolvedValue({
      achievements: [],
      summary: {
        total: 0,
        unlocked: 0,
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads habits and groups, computes behavior-facing state and syncs achievements", async () => {
    const user = createSupabaseUser();
    const { result } = renderHook(() => useHabitsScreenController({ user }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchHabitsForUserMock).toHaveBeenCalledWith("user-1");
    expect(fetchHabitGroupsForUserMock).toHaveBeenCalledWith("user-1");
    expect(resolveAndSyncAchievementsForUserMock).toHaveBeenCalledWith("user-1");

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.habits).toHaveLength(2);
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.summary).toEqual({
      total: 2,
      positive: 1,
      negative: 1,
      completedToday: 1,
    });
    expect(result.current.groups[0]?.metrics.isCompletedToday).toBe(true);
    expect(result.current.selectedHabit).toBeNull();
    expect(result.current.editingHabit).toBeNull();
    expect(showErrorToastMock).not.toHaveBeenCalled();
  });

  it("updates selected and editing entities through public editor actions", async () => {
    const user = createSupabaseUser();
    const { result } = renderHook(() => useHabitsScreenController({ user }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.openHabitDetails("habit-1");
      result.current.openGroupDetails("group-1");
      result.current.openEditHabit("habit-1");
      result.current.openEditGroup("group-1");
    });

    expect(result.current.isDetailsOpen).toBe(true);
    expect(result.current.isGroupDetailsOpen).toBe(true);
    expect(result.current.isEditorOpen).toBe(true);
    expect(result.current.isGroupEditorOpen).toBe(true);
    expect(result.current.selectedHabit?.id).toBe("habit-1");
    expect(result.current.selectedGroup?.id).toBe("group-1");
    expect(result.current.editingHabit?.id).toBe("habit-1");
    expect(result.current.editingGroup?.id).toBe("group-1");
  });

  it("stores user-facing error and shows toast when loading fails", async () => {
    fetchHabitsForUserMock.mockRejectedValueOnce(new Error("boom"));
    const user = createSupabaseUser();
    const { result } = renderHook(() => useHabitsScreenController({ user }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.errorMessage).toBe("boom");
    });

    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to load habits", "boom");
    expect(resolveAndSyncAchievementsForUserMock).not.toHaveBeenCalled();
  });

  it("keeps the screen usable when achievement sync fails", async () => {
    resolveAndSyncAchievementsForUserMock.mockRejectedValueOnce(new Error("sync failed"));
    const user = createSupabaseUser();
    const { result } = renderHook(() => useHabitsScreenController({ user }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.habits).toHaveLength(2);
    expect(showErrorToastMock).not.toHaveBeenCalled();
  });

  it("reloads habits and groups on demand", async () => {
    const user = createSupabaseUser();
    const { result } = renderHook(() => useHabitsScreenController({ user }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(fetchHabitsForUserMock).toHaveBeenCalledTimes(1);
    expect(fetchHabitGroupsForUserMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.reload();
    });

    expect(fetchHabitsForUserMock).toHaveBeenCalledTimes(2);
    expect(fetchHabitGroupsForUserMock).toHaveBeenCalledTimes(2);
    expect(resolveAndSyncAchievementsForUserMock).toHaveBeenCalledTimes(2);
  });
});
