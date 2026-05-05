import { act, renderHook } from "@testing-library/react-native";

import {
  createHabitFormValues,
  createHabitGroupFormValues,
  createHabitGroupWithMetrics,
  createHabitSummary,
  createHabitWithMetrics,
} from "@/test/fixtures/habits";
import { createSupabaseUser } from "@/test/fixtures/auth";
import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";
import type { HabitMetrics } from "@features/habits/model/types";
import { useHabitsScreenController } from "../useHabitsScreenController";
import { useHabitsScreenViewModel } from "../useHabitsScreenViewModel";

jest.mock("@shared/navigation/useHomeFooterNavigation", () => ({
  useHomeFooterNavigation: jest.fn(),
}));

jest.mock("../useHabitsScreenController", () => ({
  useHabitsScreenController: jest.fn(),
}));

const useHomeFooterNavigationMock =
  useHomeFooterNavigation as jest.MockedFunction<typeof useHomeFooterNavigation>;
const useHabitsScreenControllerMock =
  useHabitsScreenController as jest.MockedFunction<typeof useHabitsScreenController>;

type HomeFooterNavigationState = ReturnType<typeof useHomeFooterNavigation>;
type HabitsScreenControllerState = ReturnType<typeof useHabitsScreenController>;

function createMetrics(completedToday: boolean): HabitMetrics {
  return {
    completedToday,
    todayLoggedValue: completedToday ? 1 : 0,
    goalProgress: {
      period: "day",
      target: 1,
      currentValue: completedToday ? 1 : 0,
      remainingValue: completedToday ? 0 : 1,
      progressPercent: completedToday ? 100 : 0,
      periodLabel: "Today",
    },
    currentStreak: completedToday ? 1 : 0,
    bestStreak: completedToday ? 2 : 0,
    weeklyPerformance: [],
    weeklyCompletedCount: completedToday ? 1 : 0,
    weeklyScheduledCount: 1,
    heatmap: [],
  };
}

function createControllerState(
  overrides: Partial<HabitsScreenControllerState> = {},
): HabitsScreenControllerState {
  const habits = [
    createHabitWithMetrics("h1", {
      name: "Habit h1",
      metrics: createMetrics(true),
    }),
    createHabitWithMetrics("h2", {
      name: "Habit h2",
      metrics: createMetrics(false),
    }),
  ];
  const groups = [createHabitGroupWithMetrics("g1")];

  return {
    isLoading: false,
    isSaving: false,
    errorMessage: null,
    habits,
    groups,
    summary: createHabitSummary({
      total: 2,
      positive: 2,
      negative: 0,
      completedToday: 1,
    }),
    selectedHabit: null,
    selectedGroup: null,
    editingHabit: null,
    editingGroup: null,
    isEditorOpen: false,
    isDetailsOpen: false,
    isGroupEditorOpen: false,
    isGroupDetailsOpen: false,
    editorMode: "create",
    groupEditorMode: "create",
    formValues: createHabitFormValues(),
    groupFormValues: createHabitGroupFormValues(),
    setFormField: jest.fn(),
    setGroupFormField: jest.fn(),
    toggleCustomWeekday: jest.fn(),
    toggleHabitInGroupForm: jest.fn(),
    openCreateHabit: jest.fn(),
    openEditHabit: jest.fn(),
    openHabitDetails: jest.fn(),
    openCreateGroup: jest.fn(),
    openEditGroup: jest.fn(),
    openGroupDetails: jest.fn(),
    closeEditor: jest.fn(),
    closeDetails: jest.fn(),
    closeGroupEditor: jest.fn(),
    closeGroupDetails: jest.fn(),
    handleSaveHabit: jest.fn(),
    handleSaveGroup: jest.fn(),
    toggleTodayCompletion: jest.fn(async () => undefined),
    setTodayProgressValue: jest.fn(),
    handleDeleteHabit: jest.fn(),
    handleDeleteGroup: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  };
}

describe("useHabitsScreenViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const navigationState: HomeFooterNavigationState = {
      activeTab: "habits",
      handleTabPress: jest.fn(),
    };

    useHomeFooterNavigationMock.mockReturnValue(navigationState);
    useHabitsScreenControllerMock.mockReturnValue(createControllerState());
  });

  it("combines navigation and screen controller data", () => {
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    expect(result.current.activeTab).toBe("habits");
    expect(result.current.habits).toHaveLength(2);
    expect(result.current.isUndoDialogOpen).toBe(false);
    expect(result.current.pendingUndoHabitId).toBeNull();
    expect(result.current.pendingUndoHabit).toBeNull();
  });

  it("toggles completion immediately for not-completed habit", () => {
    const controllerState = createControllerState();
    useHabitsScreenControllerMock.mockReturnValue(controllerState);
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    act(() => {
      result.current.handleToggleTodayPress("h2");
    });

    expect(controllerState.toggleTodayCompletion).toHaveBeenCalledWith("h2");
    expect(result.current.isUndoDialogOpen).toBe(false);
  });

  it("opens undo dialog for completed habit and confirms undo", () => {
    const controllerState = createControllerState();
    useHabitsScreenControllerMock.mockReturnValue(controllerState);
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    act(() => {
      result.current.handleToggleTodayPress("h1");
    });

    expect(controllerState.toggleTodayCompletion).not.toHaveBeenCalled();
    expect(result.current.isUndoDialogOpen).toBe(true);
    expect(result.current.pendingUndoHabitId).toBe("h1");
    expect(result.current.pendingUndoHabit?.id).toBe("h1");

    act(() => {
      result.current.handleConfirmUndoCompletion();
    });

    expect(controllerState.toggleTodayCompletion).toHaveBeenCalledWith("h1");
    expect(result.current.isUndoDialogOpen).toBe(false);
    expect(result.current.pendingUndoHabitId).toBeNull();
  });

  it("does not toggle when saving or habit not found", () => {
    const controllerState = createControllerState({ isSaving: true });
    useHabitsScreenControllerMock.mockReturnValue(controllerState);
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    act(() => {
      result.current.handleToggleTodayPress("h2");
      result.current.handleToggleTodayPress("missing");
    });

    expect(controllerState.toggleTodayCompletion).not.toHaveBeenCalled();
    expect(result.current.isUndoDialogOpen).toBe(false);
  });

  it("supports closing undo dialog manually", () => {
    const controllerState = createControllerState();
    useHabitsScreenControllerMock.mockReturnValue(controllerState);
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    act(() => {
      result.current.handleToggleTodayPress("h1");
    });
    expect(result.current.isUndoDialogOpen).toBe(true);

    act(() => {
      result.current.closeUndoDialog();
    });
    expect(result.current.isUndoDialogOpen).toBe(false);
    expect(result.current.pendingUndoHabitId).toBeNull();
  });

  it("edits habit/group from details by closing details first", () => {
    const controllerState = createControllerState();
    useHabitsScreenControllerMock.mockReturnValue(controllerState);
    const { result } = renderHook(() => useHabitsScreenViewModel({ user: createSupabaseUser() }));

    act(() => {
      result.current.handleEditFromDetails("h2");
      result.current.handleEditGroupFromDetails("g1");
    });

    expect(controllerState.closeDetails).toHaveBeenCalledTimes(1);
    expect(controllerState.openEditHabit).toHaveBeenCalledWith("h2");
    expect(controllerState.closeGroupDetails).toHaveBeenCalledTimes(1);
    expect(controllerState.openEditGroup).toHaveBeenCalledWith("g1");
  });
});
