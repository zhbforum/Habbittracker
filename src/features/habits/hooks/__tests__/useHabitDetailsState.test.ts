import { act, renderHook } from "@testing-library/react-native";

import type { HabitWithMetrics } from "@features/habits/model/types";
import { useHabitDetailsState } from "../useHabitDetailsState";

function createHabit(todayLoggedValue: number): HabitWithMetrics {
  return {
    id: "habit-1",
    userId: "user-1",
    name: "Drink water",
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "value",
      period: "day",
      target: 2,
      unit: "cups",
    },
    completions: {},
    metrics: {
      completedToday: todayLoggedValue >= 2,
      todayLoggedValue,
      goalProgress: {
        period: "day",
        target: 2,
        currentValue: todayLoggedValue,
        remainingValue: Math.max(2 - todayLoggedValue, 0),
        progressPercent: todayLoggedValue >= 2 ? 100 : 50,
        periodLabel: "Today",
      },
      currentStreak: 1,
      bestStreak: 2,
      weeklyPerformance: [],
      weeklyCompletedCount: 0,
      weeklyScheduledCount: 0,
      heatmap: [],
    },
  };
}

describe("useHabitDetailsState", () => {
  it("syncs today input from visible habit", () => {
    const onSetTodayProgressValue = jest.fn();
    const habit = createHabit(3);

    const { result } = renderHook(() =>
      useHabitDetailsState({
        isVisible: true,
        habit,
        onSetTodayProgressValue,
      }),
    );

    expect(result.current.todayValueInput).toBe("3");
  });

  it("clears local state when sheet becomes hidden", () => {
    const onSetTodayProgressValue = jest.fn();
    const habit = createHabit(3);

    const { result, rerender } = renderHook(
      (props: { isVisible: boolean; habit: HabitWithMetrics | null }) =>
        useHabitDetailsState({
          ...props,
          onSetTodayProgressValue,
        }),
      {
        initialProps: { isVisible: true, habit },
      },
    );

    act(() => {
      result.current.openDeleteDialog();
      result.current.setTodayValueInput("9");
    });

    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.todayValueInput).toBe("9");

    rerender({ isVisible: false, habit });

    expect(result.current.isDeleteDialogOpen).toBe(false);
    expect(result.current.todayValueInput).toBe("");
  });

  it("submits numeric value and supports comma decimals", () => {
    const onSetTodayProgressValue = jest.fn();
    const habit = createHabit(0);

    const { result } = renderHook(() =>
      useHabitDetailsState({
        isVisible: true,
        habit,
        onSetTodayProgressValue,
      }),
    );

    act(() => {
      result.current.setTodayValueInput("2,5");
    });
    act(() => {
      result.current.submitTodayValue();
    });

    expect(onSetTodayProgressValue).toHaveBeenCalledWith("habit-1", 2.5);
  });

  it("does not submit invalid numeric input", () => {
    const onSetTodayProgressValue = jest.fn();
    const habit = createHabit(0);

    const { result } = renderHook(() =>
      useHabitDetailsState({
        isVisible: true,
        habit,
        onSetTodayProgressValue,
      }),
    );

    act(() => {
      result.current.setTodayValueInput("not-a-number");
    });
    act(() => {
      result.current.submitTodayValue();
    });

    expect(onSetTodayProgressValue).not.toHaveBeenCalled();
  });

  it("clears today value and confirms delete action", () => {
    const onSetTodayProgressValue = jest.fn();
    const onDelete = jest.fn();
    const habit = createHabit(2);

    const { result } = renderHook(() =>
      useHabitDetailsState({
        isVisible: true,
        habit,
        onSetTodayProgressValue,
      }),
    );

    act(() => {
      result.current.openDeleteDialog();
      result.current.clearTodayValue();
      result.current.confirmDelete(onDelete);
    });

    expect(result.current.todayValueInput).toBe("");
    expect(onSetTodayProgressValue).toHaveBeenCalledWith("habit-1", 0);
    expect(onDelete).toHaveBeenCalledWith("habit-1");
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });
});
