import { act, renderHook, waitFor } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import { resolveAndSyncAchievementsForUser } from "@entities/achievement";
import { resolveDisplayName } from "@entities/profile";
import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";

import { useHomeScreenActions } from "../useHomeScreenActions";
import { useHomeScreenController } from "../useHomeScreenController";
import { useHomeScreenData } from "../useHomeScreenData";
import { useHomeScreenDerived } from "../useHomeScreenDerived";

jest.mock("@entities/achievement", () => ({
  resolveAndSyncAchievementsForUser: jest.fn(),
}));

jest.mock("@entities/profile", () => ({
  resolveDisplayName: jest.fn(),
}));

jest.mock("@shared/navigation/useHomeFooterNavigation", () => ({
  useHomeFooterNavigation: jest.fn(),
}));

jest.mock("../useHomeScreenData", () => ({
  useHomeScreenData: jest.fn(),
}));

jest.mock("../useHomeScreenDerived", () => ({
  useHomeScreenDerived: jest.fn(),
}));

jest.mock("../useHomeScreenActions", () => ({
  useHomeScreenActions: jest.fn(),
}));

const resolveAndSyncAchievementsForUserMock =
  resolveAndSyncAchievementsForUser as jest.MockedFunction<
    typeof resolveAndSyncAchievementsForUser
  >;
const resolveDisplayNameMock = resolveDisplayName as jest.MockedFunction<
  typeof resolveDisplayName
>;
const useHomeFooterNavigationMock =
  useHomeFooterNavigation as jest.MockedFunction<typeof useHomeFooterNavigation>;
const useHomeScreenDataMock = useHomeScreenData as jest.MockedFunction<
  typeof useHomeScreenData
>;
const useHomeScreenDerivedMock = useHomeScreenDerived as jest.MockedFunction<
  typeof useHomeScreenDerived
>;
const useHomeScreenActionsMock = useHomeScreenActions as jest.MockedFunction<
  typeof useHomeScreenActions
>;

type HomeScreenDataState = ReturnType<typeof useHomeScreenData>;
type HomeScreenDerivedState = ReturnType<typeof useHomeScreenDerived>;
type HomeScreenActionsState = ReturnType<typeof useHomeScreenActions>;

function createHomeScreenDataState(
  overrides: Partial<HomeScreenDataState> = {},
): HomeScreenDataState {
  return {
    isLoading: false,
    errorMessage: null,
    displayName: "Alex Home",
    habits: [createHabit("habit-1")],
    groups: [createHabitGroup("group-1")],
    now: new Date("2026-07-15T08:00:00.000Z"),
    setErrorMessage: jest.fn(),
    setHabits: jest.fn(),
    loadHomeData: jest.fn(async () => undefined),
    ...overrides,
  };
}

function createHomeScreenDerivedState(
  overrides: Partial<HomeScreenDerivedState> = {},
): HomeScreenDerivedState {
  return {
    todayHabits: [],
    todayGroups: [],
    hasAnyGroups: false,
    hasMoreGroups: false,
    greeting: "Good morning",
    dateLabel: "Wednesday, Jul 15",
    progress: {
      completedCount: 1,
      totalCount: 2,
      percent: 50,
      message: "Great momentum. You're on track!",
    },
    ...overrides,
  };
}

function createHomeScreenActionsState(
  overrides: Partial<HomeScreenActionsState> = {},
): HomeScreenActionsState {
  return {
    openHabits: jest.fn(),
    openCreateHabit: jest.fn(),
    openHabitById: jest.fn(),
    openGroupById: jest.fn(),
    toggleTodayCompletion: jest.fn(async () => undefined),
    ...overrides,
  };
}

describe("useHomeScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    resolveDisplayNameMock.mockReturnValue("  Alex Home  ");
    resolveAndSyncAchievementsForUserMock.mockResolvedValue({
      achievements: [],
      summary: {
        total: 0,
        unlocked: 0,
      },
    } as never);

    useHomeFooterNavigationMock.mockReturnValue({
      activeTab: "home",
      handleTabPress: jest.fn(),
    });
    useHomeScreenDataMock.mockReturnValue(createHomeScreenDataState());
    useHomeScreenDerivedMock.mockReturnValue(createHomeScreenDerivedState());
    useHomeScreenActionsMock.mockReturnValue(createHomeScreenActionsState());
  });

  it("Given hook dependencies return data and actions, When building controller state, Then it exposes composed view model and reload delegates to loadHomeData(true)", () => {
    const user = createSupabaseUser({ id: "user-home-1" });
    const dataState = createHomeScreenDataState();
    const derivedState = createHomeScreenDerivedState();
    const actionsState = createHomeScreenActionsState();
    useHomeScreenDataMock.mockReturnValue(dataState);
    useHomeScreenDerivedMock.mockReturnValue(derivedState);
    useHomeScreenActionsMock.mockReturnValue(actionsState);

    const { result } = renderHook(() => useHomeScreenController({ user }));

    expect(resolveDisplayNameMock).toHaveBeenCalledWith(user);
    expect(useHomeScreenDataMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user,
        initialDisplayName: "Alex Home",
        syncAchievements: expect.any(Function),
      }),
    );
    expect(useHomeScreenDerivedMock).toHaveBeenCalledWith({
      habits: dataState.habits,
      groups: dataState.groups,
      now: dataState.now,
    });
    expect(useHomeScreenActionsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-home-1",
        now: dataState.now,
        isSaving: false,
        setErrorMessage: dataState.setErrorMessage,
        setHabits: dataState.setHabits,
        syncAchievements: expect.any(Function),
      }),
    );

    expect(result.current.activeTab).toBe("home");
    expect(result.current.displayName).toBe(dataState.displayName);
    expect(result.current.greeting).toBe(derivedState.greeting);
    expect(result.current.progress).toEqual(derivedState.progress);
    expect(result.current.openCreateHabit).toBe(actionsState.openCreateHabit);

    act(() => {
      result.current.reload();
    });

    expect(dataState.loadHomeData).toHaveBeenCalledWith(true);
  });

  it("Given achievements sync rejects, When sync callback is invoked from wiring args, Then it still calls service with user id and swallows rejection", async () => {
    const user = createSupabaseUser({ id: "user-home-2" });
    resolveAndSyncAchievementsForUserMock.mockRejectedValueOnce(
      new Error("achievement sync failed"),
    );

    renderHook(() => useHomeScreenController({ user }));

    const dataArgs = useHomeScreenDataMock.mock.calls[0]?.[0];
    const actionsArgs = useHomeScreenActionsMock.mock.calls[0]?.[0];
    const syncFromData = dataArgs?.syncAchievements;
    const syncFromActions = actionsArgs?.syncAchievements;

    expect(syncFromData).toBeDefined();
    expect(syncFromActions).toBe(syncFromData);

    expect(() => syncFromData?.()).not.toThrow();

    await waitFor(() => {
      expect(resolveAndSyncAchievementsForUserMock).toHaveBeenCalledWith("user-home-2");
    });
  });
});
