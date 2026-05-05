import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";
import { routes } from "@shared/navigation/routes";
import { showErrorToast } from "@shared/ui";

import { useStatsScreenController } from "../useStatsScreenController";

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
let focusEffectCallback: (() => void) | null = null;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
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

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
}));

const fetchHabitsForUserMock = fetchHabitsForUser as jest.MockedFunction<typeof fetchHabitsForUser>;
const fetchHabitGroupsForUserMock =
  fetchHabitGroupsForUser as jest.MockedFunction<typeof fetchHabitGroupsForUser>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;

function triggerFocusEffect() {
  if (!focusEffectCallback) {
    throw new Error("Expected focus effect callback to be set.");
  }

  act(() => {
    focusEffectCallback?.();
  });
}

function expectMonthStart(date: Date, year: number, monthIndex: number) {
  expect(date.getFullYear()).toBe(year);
  expect(date.getMonth()).toBe(monthIndex);
  expect(date.getDate()).toBe(1);
}

describe("useStatsScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 31, 10, 30, 0, 0));
    focusEffectCallback = null;
    fetchHabitsForUserMock.mockResolvedValue([]);
    fetchHabitGroupsForUserMock.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads stats data on focus and exposes derived state", async () => {
    const user = createSupabaseUser({ id: "user-1" });
    const habits = [
      createHabit("h1", {
        frequency: "daily",
      }),
      createHabit("h2", {
        frequency: "weekly",
        weeklyWeekday: 2,
      }),
    ];
    const groups = [
      createHabitGroup("g1", {
        frequency: "daily",
        habitIds: ["h1"],
        dailyGoal: 1,
        startDate: "2026-03-01",
        endDate: "2026-04-30",
      }),
    ];

    fetchHabitsForUserMock.mockResolvedValueOnce(habits);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce(groups);

    const { result } = renderHook(() => useStatsScreenController({ user }));

    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchHabitsForUserMock).toHaveBeenCalledWith("user-1");
    expect(fetchHabitGroupsForUserMock).toHaveBeenCalledWith("user-1");
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.activeTab).toBe("stats");
    expect(result.current.weekdayLabels).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expectMonthStart(result.current.monthDate, 2026, 2);
    expect(result.current.summaryRange).toBe("month");
    expect(result.current.monthLabel).toBe("March 2026");
    expect(result.current.summaryRangeLabel).toBe("Selected month");
    expect(result.current.calendarCells.length).toBeGreaterThan(0);
    expect(result.current.heatmapWeeks.length).toBeGreaterThan(0);
    expect(result.current.selectedDateKey).toBe("2026-03-31");
  });

  it("supports month navigation, tab navigation and route actions", async () => {
    const user = createSupabaseUser({ id: "user-2" });

    const { result } = renderHook(() => useStatsScreenController({ user }));
    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.goToPreviousMonth();
    });
    expectMonthStart(result.current.monthDate, 2026, 1);
    expect(result.current.selectedDateKey).toBe("2026-02-28");

    act(() => {
      result.current.handleTabPress("stats");
      result.current.handleTabPress("home");
      result.current.openHabits();
      result.current.openHabitById("");
      result.current.openHabitById("habit 1");
      result.current.openGroupById(" ");
      result.current.openGroupById("group/1");
    });

    expect(mockRouterReplace).toHaveBeenNthCalledWith(1, routes.home);
    expect(mockRouterReplace).toHaveBeenNthCalledWith(2, routes.habits);
    expect(mockRouterPush).toHaveBeenNthCalledWith(
      1,
      `${routes.habits}?habitId=${encodeURIComponent("habit 1")}`,
    );
    expect(mockRouterPush).toHaveBeenNthCalledWith(
      2,
      `${routes.habits}?groupId=${encodeURIComponent("group/1")}`,
    );
    expect(mockRouterPush).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.jumpToToday();
    });
    expectMonthStart(result.current.monthDate, 2026, 2);
    expect(result.current.selectedDateKey).toBe("2026-03-31");
  });

  it("reloads and shows user-facing error when fetching fails", async () => {
    const user = createSupabaseUser({ id: "user-3" });

    fetchHabitsForUserMock.mockRejectedValueOnce(new Error("stats down"));

    const { result } = renderHook(() => useStatsScreenController({ user }));
    triggerFocusEffect();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe("stats down");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to load stats", "stats down");

    fetchHabitsForUserMock.mockResolvedValueOnce([]);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce([]);

    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(fetchHabitsForUserMock).toHaveBeenCalledTimes(2);
    });
  });
});
