import { act, renderHook } from "@testing-library/react-native";

import { createHabit } from "@/test/fixtures/habits";
import { toDateKey } from "@entities/habit/model/date";
import type { Habit } from "@entities/habit/model/types";
import { routes } from "@shared/navigation/routes";
import { showErrorToast } from "@shared/ui";

import { toggleHabitCompletionForDate } from "@entities/habit/api/habitStorage";
import { useHomeScreenActions } from "../useHomeScreenActions";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@entities/habit/api/habitStorage", () => ({
  toggleHabitCompletionForDate: jest.fn(),
}));

jest.mock("@shared/ui", () => ({
  showErrorToast: jest.fn(),
}));

const toggleHabitCompletionForDateMock =
  toggleHabitCompletionForDate as jest.MockedFunction<typeof toggleHabitCompletionForDate>;
const showErrorToastMock = showErrorToast as jest.MockedFunction<typeof showErrorToast>;

describe("useHomeScreenActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates to habits routes and skips empty ids", () => {
    const { result } = renderHook(() =>
      useHomeScreenActions({
        userId: "user-1",
        now: new Date(2026, 5, 1, 9, 0, 0, 0),
        isSaving: false,
        syncAchievements: jest.fn(),
        setIsSaving: jest.fn(),
        setErrorMessage: jest.fn(),
        setHabits: jest.fn(),
      }),
    );

    act(() => {
      result.current.openHabits();
      result.current.openCreateHabit();
      result.current.openHabitById("");
      result.current.openHabitById("habit 1");
      result.current.openGroupById(" ");
      result.current.openGroupById("group/1");
    });

    expect(mockPush).toHaveBeenNthCalledWith(1, routes.habits);
    expect(mockPush).toHaveBeenNthCalledWith(2, `${routes.habits}?create=1`);
    expect(mockPush).toHaveBeenNthCalledWith(
      3,
      `${routes.habits}?habitId=${encodeURIComponent("habit 1")}`,
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      4,
      `${routes.habits}?groupId=${encodeURIComponent("group/1")}`,
    );
    expect(mockPush).toHaveBeenCalledTimes(4);
  });

  it("toggles completion, updates habits and syncs achievements", async () => {
    const setIsSaving = jest.fn();
    const setErrorMessage = jest.fn();
    const setHabits = jest.fn();
    const syncAchievements = jest.fn();
    const now = new Date(2026, 5, 1, 9, 15, 0, 0);
    const updatedHabit = createHabit("h2", { name: "Updated name" });

    toggleHabitCompletionForDateMock.mockResolvedValueOnce(updatedHabit);

    const { result } = renderHook(() =>
      useHomeScreenActions({
        userId: "user-1",
        now,
        isSaving: false,
        syncAchievements,
        setIsSaving,
        setErrorMessage,
        setHabits,
      }),
    );

    await act(async () => {
      await result.current.toggleTodayCompletion("h2");
    });

    expect(toggleHabitCompletionForDateMock).toHaveBeenCalledWith(
      "user-1",
      "h2",
      toDateKey(now),
    );
    expect(setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(setErrorMessage).toHaveBeenCalledWith(null);
    expect(syncAchievements).toHaveBeenCalledTimes(1);
    expect(setIsSaving).toHaveBeenLastCalledWith(false);

    const updateHabitsCall = setHabits.mock.calls.find(
      (call): call is [(currentHabits: Habit[]) => Habit[]] => typeof call[0] === "function",
    );

    expect(updateHabitsCall).toBeDefined();

    const updater = updateHabitsCall?.[0];
    if (!updater) {
      throw new Error("Expected setHabits updater to be passed.");
    }

    const initialHabits = [createHabit("h1"), createHabit("h2", { name: "Old name" })];
    const nextHabits = updater(initialHabits);

    expect(nextHabits.map((habit) => habit.id)).toEqual(["h1", "h2"]);
    expect(nextHabits[0]).toEqual(initialHabits[0]);
    expect(nextHabits[1]).toEqual(updatedHabit);
  });

  it("does nothing when save is already in progress", async () => {
    const setIsSaving = jest.fn();
    const setErrorMessage = jest.fn();
    const setHabits = jest.fn();
    const syncAchievements = jest.fn();

    const { result } = renderHook(() =>
      useHomeScreenActions({
        userId: "user-1",
        now: new Date(2026, 5, 1, 9, 0, 0, 0),
        isSaving: true,
        syncAchievements,
        setIsSaving,
        setErrorMessage,
        setHabits,
      }),
    );

    await act(async () => {
      await result.current.toggleTodayCompletion("h2");
    });

    expect(toggleHabitCompletionForDateMock).not.toHaveBeenCalled();
    expect(setIsSaving).not.toHaveBeenCalled();
    expect(setErrorMessage).not.toHaveBeenCalled();
    expect(setHabits).not.toHaveBeenCalled();
    expect(syncAchievements).not.toHaveBeenCalled();
  });

  it("shows error message and toast when completion toggle fails", async () => {
    const setIsSaving = jest.fn();
    const setErrorMessage = jest.fn();
    const setHabits = jest.fn();
    const syncAchievements = jest.fn();

    toggleHabitCompletionForDateMock.mockRejectedValueOnce(new Error("storage failed"));

    const { result } = renderHook(() =>
      useHomeScreenActions({
        userId: "user-1",
        now: new Date(2026, 5, 1, 9, 0, 0, 0),
        isSaving: false,
        syncAchievements,
        setIsSaving,
        setErrorMessage,
        setHabits,
      }),
    );

    await act(async () => {
      await result.current.toggleTodayCompletion("h2");
    });

    expect(setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(setErrorMessage).toHaveBeenNthCalledWith(1, null);
    expect(setErrorMessage).toHaveBeenLastCalledWith("storage failed");
    expect(showErrorToastMock).toHaveBeenCalledWith(
      "Unable to update habit",
      "storage failed",
    );
    expect(setHabits).not.toHaveBeenCalled();
    expect(syncAchievements).not.toHaveBeenCalled();
    expect(setIsSaving).toHaveBeenLastCalledWith(false);
  });
});
