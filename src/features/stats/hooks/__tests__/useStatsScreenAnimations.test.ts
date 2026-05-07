import { renderHook } from "@testing-library/react-native";
import { Animated } from "react-native";
import React, { type PropsWithChildren } from "react";

import type { StatsSummaryRange } from "@features/stats/model/types";
import type { DayDetailsFilter } from "@features/stats/model/view";

import { useStatsScreenAnimations } from "../useStatsScreenAnimations";

function createImmediateAnimation(): Animated.CompositeAnimation {
  return {
    start: (callback?: Animated.EndCallback) => {
      callback?.({ finished: true });
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as unknown as Animated.CompositeAnimation;
}

describe("useStatsScreenAnimations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("Given initial render, When hook mounts, Then it starts staggered entrance animation for header, calendar and details", () => {
    const timingSpy = jest.spyOn(Animated, "timing").mockImplementation(
      () => createImmediateAnimation(),
    );
    const staggerSpy = jest.spyOn(Animated, "stagger").mockImplementation(
      () => createImmediateAnimation(),
    );

    renderHook(() =>
      useStatsScreenAnimations({
        monthLabel: "May 2026",
        summaryRange: "month",
        selectedDayDateKey: "2026-05-09",
        detailsFilter: "all",
      }),
    );

    expect(staggerSpy).toHaveBeenCalledTimes(1);
    expect(staggerSpy.mock.calls[0]?.[0]).toBe(80);
    expect(timingSpy).toHaveBeenCalledTimes(3);

    const durations = timingSpy.mock.calls
      .map(([, config]) => config.duration)
      .filter((duration): duration is number => typeof duration === "number")
      .sort((left, right) => left - right);
    expect(durations).toEqual([280, 300, 320]);
    expect(timingSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        toValue: 1,
        useNativeDriver: true,
      }),
    );
  });

  it("Given unchanged state keys across subsequent rerenders, When hook rerenders, Then transition animations remain skipped", () => {
    const timingSpy = jest.spyOn(Animated, "timing").mockImplementation(
      () => createImmediateAnimation(),
    );
    const springSpy = jest.spyOn(Animated, "spring").mockImplementation(
      () => createImmediateAnimation(),
    );
    const parallelSpy = jest.spyOn(Animated, "parallel").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "stagger").mockImplementation(
      () => createImmediateAnimation(),
    );

    const animationState = {
      monthLabel: "May 2026",
      summaryRange: "month" as StatsSummaryRange,
      selectedDayDateKey: "2026-05-09",
      detailsFilter: "all" as DayDetailsFilter,
    };

    const { rerender } = renderHook(() => useStatsScreenAnimations(animationState));
    timingSpy.mockClear();
    springSpy.mockClear();
    parallelSpy.mockClear();

    rerender({});
    rerender({});

    expect(parallelSpy).not.toHaveBeenCalled();
    expect(timingSpy).not.toHaveBeenCalled();
    expect(springSpy).not.toHaveBeenCalled();
  });

  it("Given stats keys change, When rerendering, Then it runs summary/day/month transitions with expected animation configs", () => {
    const timingSpy = jest.spyOn(Animated, "timing").mockImplementation(
      () => createImmediateAnimation(),
    );
    const springSpy = jest.spyOn(Animated, "spring").mockImplementation(
      () => createImmediateAnimation(),
    );
    const parallelSpy = jest.spyOn(Animated, "parallel").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "stagger").mockImplementation(
      () => createImmediateAnimation(),
    );

    const animationState = {
      monthLabel: "May 2026",
      summaryRange: "month" as StatsSummaryRange,
      selectedDayDateKey: "2026-05-09",
      detailsFilter: "all" as DayDetailsFilter,
    };

    const { rerender } = renderHook(() => useStatsScreenAnimations(animationState));
    timingSpy.mockClear();
    springSpy.mockClear();
    parallelSpy.mockClear();

    animationState.summaryRange = "year";
    rerender({});

    animationState.detailsFilter = "completed";
    rerender({});

    animationState.monthLabel = "June 2026";
    rerender({});

    expect(parallelSpy).toHaveBeenCalledTimes(4);

    const durations = timingSpy.mock.calls
      .map(([, config]) => config.duration)
      .filter((duration): duration is number => typeof duration === "number")
      .sort((left, right) => left - right);
    expect(durations).toEqual([200, 210, 210, 220]);

    const springStiffnesses = springSpy.mock.calls
      .map(([, config]) => config.stiffness)
      .filter((stiffness): stiffness is number => typeof stiffness === "number")
      .sort((left, right) => left - right);
    expect(springStiffnesses).toEqual([190, 195, 195, 200]);
    expect(timingSpy).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      expect.objectContaining({
        useNativeDriver: true,
      }),
    );
  });

  it("Given strict-mode mount cycle, When effects run twice with same keys, Then content transition animations stay skipped", () => {
    jest.spyOn(Animated, "timing").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "spring").mockImplementation(
      () => createImmediateAnimation(),
    );
    const parallelSpy = jest.spyOn(Animated, "parallel").mockImplementation(
      () => createImmediateAnimation(),
    );
    jest.spyOn(Animated, "stagger").mockImplementation(
      () => createImmediateAnimation(),
    );

    const wrapper = ({ children }: PropsWithChildren) =>
      React.createElement(React.StrictMode, null, children);

    renderHook(
      () =>
        useStatsScreenAnimations({
          monthLabel: "May 2026",
          summaryRange: "month",
          selectedDayDateKey: "2026-05-09",
          detailsFilter: "all",
        }),
      { wrapper },
    );

    expect(parallelSpy).not.toHaveBeenCalled();
  });
});
