import { renderHook } from "@testing-library/react-native";

import { useHabitsScreenRouteParams } from "../useHabitsScreenRouteParams";

type RouteParamsProps = {
  createParam: string | undefined;
  habitIdParam: string | undefined;
  groupIdParam: string | undefined;
};

describe("useHabitsScreenRouteParams", () => {
  it("opens create flow only once for create=1", () => {
    const openCreateHabit = jest.fn();
    const openHabitDetails = jest.fn();
    const openGroupDetails = jest.fn();

    const { rerender } = renderHook(
      (props: RouteParamsProps) =>
        useHabitsScreenRouteParams({
          ...props,
          openCreateHabit,
          openHabitDetails,
          openGroupDetails,
        }),
      {
        initialProps: { createParam: "1", habitIdParam: undefined, groupIdParam: undefined },
      },
    );

    expect(openCreateHabit).toHaveBeenCalledTimes(1);

    rerender({ createParam: "1", habitIdParam: undefined, groupIdParam: undefined });
    expect(openCreateHabit).toHaveBeenCalledTimes(1);

    rerender({ createParam: "0", habitIdParam: undefined, groupIdParam: undefined });
    rerender({ createParam: "1", habitIdParam: undefined, groupIdParam: undefined });
    expect(openCreateHabit).toHaveBeenCalledTimes(1);
  });

  it("opens habit details for each new habit id only once", () => {
    const openCreateHabit = jest.fn();
    const openHabitDetails = jest.fn();
    const openGroupDetails = jest.fn();

    const { rerender } = renderHook(
      (props: RouteParamsProps) =>
        useHabitsScreenRouteParams({
          ...props,
          openCreateHabit,
          openHabitDetails,
          openGroupDetails,
        }),
      {
        initialProps: { createParam: undefined, habitIdParam: "habit-1", groupIdParam: undefined },
      },
    );

    expect(openHabitDetails).toHaveBeenCalledWith("habit-1");
    expect(openHabitDetails).toHaveBeenCalledTimes(1);

    rerender({ createParam: undefined, habitIdParam: "habit-1", groupIdParam: undefined });
    expect(openHabitDetails).toHaveBeenCalledTimes(1);

    rerender({ createParam: undefined, habitIdParam: "habit-2", groupIdParam: undefined });
    expect(openHabitDetails).toHaveBeenCalledWith("habit-2");
    expect(openHabitDetails).toHaveBeenCalledTimes(2);
  });

  it("opens group details for each new group id only once", () => {
    const openCreateHabit = jest.fn();
    const openHabitDetails = jest.fn();
    const openGroupDetails = jest.fn();

    const { rerender } = renderHook(
      (props: RouteParamsProps) =>
        useHabitsScreenRouteParams({
          ...props,
          openCreateHabit,
          openHabitDetails,
          openGroupDetails,
        }),
      {
        initialProps: { createParam: undefined, habitIdParam: undefined, groupIdParam: "group-1" },
      },
    );

    expect(openGroupDetails).toHaveBeenCalledWith("group-1");
    expect(openGroupDetails).toHaveBeenCalledTimes(1);

    rerender({ createParam: undefined, habitIdParam: undefined, groupIdParam: "group-1" });
    expect(openGroupDetails).toHaveBeenCalledTimes(1);

    rerender({ createParam: undefined, habitIdParam: undefined, groupIdParam: "group-2" });
    expect(openGroupDetails).toHaveBeenCalledWith("group-2");
    expect(openGroupDetails).toHaveBeenCalledTimes(2);
  });
});
