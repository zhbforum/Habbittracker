import { act, renderHook } from "@testing-library/react-native";

import { createHabit, createHabitGroup } from "@/test/fixtures/habits";
import {
  callGroupsUpdater,
  callHabitsUpdater,
  clearHabitReminderNotificationsMock,
  createArgs,
  deleteHabitForUserMock,
  removeHabitFromGroupsForUserMock,
  setHabitProgressForDateMock,
  showErrorToastMock,
  showInfoToastMock,
  showSuccessToastMock,
  useHabitItemMutationActions,
} from "../testUtils/useHabitItemMutationActionsTestSetup";

describe("useHabitItemMutationActions (delete and progress)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
    clearHabitReminderNotificationsMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deletes habit and updates affected groups", async () => {
    deleteHabitForUserMock.mockResolvedValue(undefined);
    removeHabitFromGroupsForUserMock.mockResolvedValue(undefined);

    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    await act(async () => {
      await result.current.handleDeleteHabit("habit-1");
    });

    expect(deleteHabitForUserMock).toHaveBeenCalledWith("user-1", "habit-1");
    expect(removeHabitFromGroupsForUserMock).toHaveBeenCalledWith("user-1", "habit-1");
    expect(callHabitsUpdater(args, [createHabit("habit-1"), createHabit("habit-2")])).toEqual([
      createHabit("habit-2"),
    ]);

    const groupWithHabit = createHabitGroup("group-1", {
      habitIds: ["habit-1", "habit-2"],
      dailyGoal: 2,
      updatedAt: "old",
    });
    const groupWithoutHabit = createHabitGroup("group-2", {
      habitIds: ["habit-3"],
      dailyGoal: 1,
      updatedAt: "unchanged",
    });

    const nextGroups = callGroupsUpdater(args, [groupWithHabit, groupWithoutHabit]);
    expect(nextGroups).toEqual([
      {
        ...groupWithHabit,
        habitIds: ["habit-2"],
        dailyGoal: 1,
        updatedAt: "2026-05-10T12:00:00.000Z",
      },
      groupWithoutHabit,
    ]);

    expect(args.editorState.clearHabitReferencesAfterDelete).toHaveBeenCalledWith("habit-1");
    expect(args.syncAchievements).toHaveBeenCalledTimes(1);
    expect(clearHabitReminderNotificationsMock).toHaveBeenCalledWith("user-1", "habit-1");
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Habit deleted",
      "Habit and its history were removed.",
    );
  });

  it("handles progress update failure", async () => {
    setHabitProgressForDateMock.mockRejectedValue(new Error("progress failed"));
    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    await act(async () => {
      await result.current.setTodayProgressValue("habit-1", 2.5);
    });

    expect(args.setErrorMessage).toHaveBeenLastCalledWith("progress failed");
    expect(showErrorToastMock).toHaveBeenCalledWith("Unable to update progress", "progress failed");
  });

  it("keeps delete successful when reminder cleanup fails", async () => {
    deleteHabitForUserMock.mockResolvedValue(undefined);
    removeHabitFromGroupsForUserMock.mockResolvedValue(undefined);
    clearHabitReminderNotificationsMock.mockRejectedValue(new Error("cleanup failed"));

    const args = createArgs();
    const { result } = renderHook(() => useHabitItemMutationActions(args));

    await act(async () => {
      await result.current.handleDeleteHabit("habit-1");
    });

    expect(showInfoToastMock).toHaveBeenCalledWith(
      "Reminder cleanup skipped",
      "cleanup failed",
    );
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Habit deleted",
      "Habit and its history were removed.",
    );
  });
});
