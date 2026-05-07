import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";

import { createAchievementProgress, createAchievementSummary } from "@/test/fixtures/profile";

import { useAchievementsExplorerSheetState } from "../useAchievementsExplorerSheetState";

function createImmediateAnimation(): Animated.CompositeAnimation {
  return {
    start: (callback?: Animated.EndCallback) => {
      callback?.({ finished: true });
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as unknown as Animated.CompositeAnimation;
}

describe("useAchievementsExplorerSheetState", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Animated, "timing").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "spring").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "parallel").mockImplementation(
      () => createImmediateAnimation(),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("Given visible sheet with mixed achievements, When hook initializes, Then it exposes all items and all-filter stats", () => {
    const achievements = [
      createAchievementProgress({ id: "first_habit", isUnlocked: true }),
      createAchievementProgress({
        id: "streak_3",
        isUnlocked: false,
        unlockedAt: null,
      }),
    ];

    const { result } = renderHook(() =>
      useAchievementsExplorerSheetState({
        isVisible: true,
        achievements,
        summary: createAchievementSummary({ total: 2, unlocked: 1 }),
      }),
    );

    expect(result.current.activeFilter).toBe("all");
    expect(result.current.filteredAchievements).toEqual(achievements);
    expect(result.current.filterStatsLabel).toBe("1/2 unlocked");
    expect(result.current.emptyText).toBe("No achievements available.");
  });

  it("Given user selects unlocked filter, When selection is different from active filter, Then it animates and exposes unlocked-only achievements", async () => {
    const achievements = [
      createAchievementProgress({ id: "first_habit", isUnlocked: true }),
      createAchievementProgress({
        id: "streak_3",
        isUnlocked: false,
        unlockedAt: null,
      }),
    ];

    const { result } = renderHook(() =>
      useAchievementsExplorerSheetState({
        isVisible: true,
        achievements,
        summary: createAchievementSummary({ total: 2, unlocked: 1 }),
      }),
    );

    act(() => {
      result.current.handleSelectFilter("unlocked");
    });

    await waitFor(() => {
      expect(result.current.activeFilter).toBe("unlocked");
      expect(result.current.filteredAchievements).toHaveLength(1);
    });

    expect(result.current.filteredAchievements[0]?.id).toBe("first_habit");
    expect(result.current.filterStatsLabel).toBe("1 unlocked");
    expect(result.current.emptyText).toBe("No unlocked achievements yet. Keep going.");
  });

  it("Given selected filter matches current active filter, When selecting again, Then it skips animation and keeps state unchanged", () => {
    const parallelSpy = jest.spyOn(Animated, "parallel");

    const { result } = renderHook(() =>
      useAchievementsExplorerSheetState({
        isVisible: true,
        achievements: [createAchievementProgress()],
        summary: createAchievementSummary(),
      }),
    );

    act(() => {
      result.current.handleSelectFilter("all");
    });

    expect(result.current.activeFilter).toBe("all");
    expect(parallelSpy).not.toHaveBeenCalled();
  });

  it("Given sheet is reopened, When visibility toggles back to true, Then filter state resets to all", async () => {
    const achievements = [
      createAchievementProgress({ id: "first_habit", isUnlocked: true }),
      createAchievementProgress({
        id: "streak_3",
        isUnlocked: false,
        unlockedAt: null,
      }),
    ];
    const visibilityState = {
      isVisible: true,
    };

    const { result, rerender } = renderHook(() =>
      useAchievementsExplorerSheetState({
        isVisible: visibilityState.isVisible,
        achievements,
        summary: createAchievementSummary({ total: 2, unlocked: 1 }),
      }),
    );

    act(() => {
      result.current.handleSelectFilter("locked");
    });

    await waitFor(() => {
      expect(result.current.activeFilter).toBe("locked");
      expect(result.current.filteredAchievements).toHaveLength(1);
    });

    visibilityState.isVisible = false;
    rerender({});
    visibilityState.isVisible = true;
    rerender({});

    await waitFor(() => {
      expect(result.current.activeFilter).toBe("all");
      expect(result.current.filteredAchievements).toHaveLength(2);
    });

    expect(result.current.filterStatsLabel).toBe("1/2 unlocked");
  });
});
