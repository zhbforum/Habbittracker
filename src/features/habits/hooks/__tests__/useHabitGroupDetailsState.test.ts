import { act, renderHook } from "@testing-library/react-native";

import { createHabitGroupWithMetrics, createHabitWithMetrics } from "@/test/fixtures/habits";
import type { HabitGroupWithMetrics } from "@features/habits/model/types";
import { useHabitGroupDetailsState } from "../useHabitGroupDetailsState";

describe("useHabitGroupDetailsState", () => {
  it("filters member habits by group ids", () => {
    const habits = [
      createHabitWithMetrics("h1"),
      createHabitWithMetrics("h2"),
      createHabitWithMetrics("h3"),
    ];
    const group = createHabitGroupWithMetrics("group-1", { habitIds: ["h1", "h3"] });

    const { result } = renderHook(() =>
      useHabitGroupDetailsState({
        isVisible: true,
        group,
        habits,
      }),
    );

    expect(result.current.memberHabits.map((habit) => habit.id)).toEqual(["h1", "h3"]);
  });

  it("opens and closes delete dialog, then resets when hidden", () => {
    const habits = [createHabitWithMetrics("h1")];
    const group = createHabitGroupWithMetrics("group-1", { habitIds: ["h1"] });

    const { result, rerender } = renderHook(
      (props: { isVisible: boolean; group: HabitGroupWithMetrics | null }) =>
        useHabitGroupDetailsState({
          ...props,
          habits,
        }),
      {
        initialProps: { isVisible: true, group },
      },
    );

    act(() => {
      result.current.openDeleteDialog();
    });
    expect(result.current.isDeleteDialogOpen).toBe(true);

    act(() => {
      result.current.closeDeleteDialog();
    });
    expect(result.current.isDeleteDialogOpen).toBe(false);

    act(() => {
      result.current.openDeleteDialog();
    });
    expect(result.current.isDeleteDialogOpen).toBe(true);

    rerender({ isVisible: false, group });
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it("confirms delete with group id", () => {
    const habits = [createHabitWithMetrics("h1")];
    const group = createHabitGroupWithMetrics("group-1", { habitIds: ["h1"] });
    const onDelete = jest.fn();

    const { result } = renderHook(() =>
      useHabitGroupDetailsState({
        isVisible: true,
        group,
        habits,
      }),
    );

    act(() => {
      result.current.openDeleteDialog();
      result.current.confirmDelete(onDelete);
    });

    expect(onDelete).toHaveBeenCalledWith("group-1");
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });
});
