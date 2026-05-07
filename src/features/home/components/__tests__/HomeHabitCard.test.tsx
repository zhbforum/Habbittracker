import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated } from "react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";

import { HomeHabitCard } from "../HomeHabitCard";

const mockHabitIcon = jest.fn(() => null);
const mockCheck = jest.fn((_: unknown) => null);
const mockFlame = jest.fn((_: unknown) => null);
const mockParallelStart = jest.fn();
const mockParallel = jest.fn(() => ({ start: mockParallelStart }));
const mockTiming = jest.fn(() => ({ start: jest.fn() }));
const mockSpring = jest.fn(() => ({ start: jest.fn() }));
const mockSequence = jest.fn(() => ({ start: jest.fn() }));

jest.mock("@entities/habit/model/icons", () => ({
  getHabitIconById: jest.fn(() => mockHabitIcon),
  getHabitIconColorById: jest.fn(() => "#00AA77"),
}));

jest.mock("lucide-react-native", () => ({
  Check: (props: unknown) => {
    mockCheck(props);
    return null;
  },
  Flame: (props: unknown) => {
    mockFlame(props);
    return null;
  },
}));

describe("HomeHabitCard", () => {
  const styles = {
    habitCard: {},
    habitCardGlow: {},
    habitMainPress: {},
    habitIconWrap: {},
    habitIdentityWrap: {},
    habitName: {},
    streakWrap: {},
    streakText: {},
    habitGoalText: {},
    completeCircle: {},
    completeCircleDone: {},
  };

  const colors = {
    accentText: "#FFAA00",
    successText: "#22AA66",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Animated, "parallel").mockImplementation(mockParallel as never);
    jest.spyOn(Animated, "timing").mockImplementation(mockTiming as never);
    jest.spyOn(Animated, "spring").mockImplementation(mockSpring as never);
    jest.spyOn(Animated, "sequence").mockImplementation(mockSequence as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Given habit card, When pressing main and completion controls, Then it calls open and toggle callbacks and renders progress labels", () => {
    const onOpenHabit = jest.fn();
    const onToggleTodayCompletion = jest.fn();
    const baseHabit = createHabitWithMetrics("habit-1");
    const habit = {
      ...baseHabit,
      name: "Morning Read",
      goal: {
        ...baseHabit.goal,
        unit: "times",
      },
      metrics: {
        ...baseHabit.metrics,
        currentStreak: 3,
        completedToday: false,
        goalProgress: {
          ...baseHabit.metrics.goalProgress,
          currentValue: 1.235,
          target: 2,
          periodLabel: "Today",
        },
      },
    };

    const { UNSAFE_getByProps } = render(
      <HomeHabitCard
        habit={habit}
        colors={colors as never}
        styles={styles as never}
        isSaving={false}
        onOpenHabit={onOpenHabit}
        onToggleTodayCompletion={onToggleTodayCompletion}
      />,
    );

    fireEvent.press(screen.getByText("Morning Read"));
    fireEvent.press(UNSAFE_getByProps({ disabled: false }));

    expect(screen.getByText("Morning Read")).toBeTruthy();
    expect(screen.getByText("3 day streak")).toBeTruthy();
    expect(screen.getByText("Goal: 1.24/2 times (today)")).toBeTruthy();
    expect(onOpenHabit).toHaveBeenCalledWith("habit-1");
    expect(onToggleTodayCompletion).toHaveBeenCalledWith("habit-1");
    expect(mockFlame).toHaveBeenCalled();
    expect(mockCheck).toHaveBeenCalled();
  });

  it("Given saving state, When pressing completion control, Then toggle press is blocked by disabled button", () => {
    const onToggleTodayCompletion = jest.fn();
    const baseHabit = createHabitWithMetrics("habit-2");
    const habit = {
      ...baseHabit,
      metrics: {
        ...baseHabit.metrics,
        completedToday: true,
      },
    };

    const { UNSAFE_getByProps } = render(
      <HomeHabitCard
        habit={habit}
        colors={colors as never}
        styles={styles as never}
        isSaving
        onOpenHabit={jest.fn()}
        onToggleTodayCompletion={onToggleTodayCompletion}
      />,
    );

    expect(UNSAFE_getByProps({ disabled: true }).props.disabled).toBe(true);
    expect(onToggleTodayCompletion).not.toHaveBeenCalled();
  });

  it("Given completion flips from false to true, When rerendering card, Then completion animation sequence is started", () => {
    const baseHabit = createHabitWithMetrics("habit-3");
    const habit = {
      ...baseHabit,
      metrics: {
        ...baseHabit.metrics,
        completedToday: false,
      },
    };

    const { rerender } = render(
      <HomeHabitCard
        habit={habit}
        colors={colors as never}
        styles={styles as never}
        isSaving={false}
        onOpenHabit={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
      />,
    );

    rerender(
      <HomeHabitCard
        habit={{
          ...habit,
          metrics: {
            ...habit.metrics,
            completedToday: true,
          },
        }}
        colors={colors as never}
        styles={styles as never}
        isSaving={false}
        onOpenHabit={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
      />,
    );

    expect(mockParallel).toHaveBeenCalled();
    expect(mockParallelStart).toHaveBeenCalled();
  });

  it("Given completion flips from true to false, When rerendering card, Then uncheck animation path executes", () => {
    const baseHabit = createHabitWithMetrics("habit-4");
    const habit = {
      ...baseHabit,
      metrics: {
        ...baseHabit.metrics,
        completedToday: true,
      },
    };

    const { rerender } = render(
      <HomeHabitCard
        habit={habit}
        colors={colors as never}
        styles={styles as never}
        isSaving={false}
        onOpenHabit={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
      />,
    );

    rerender(
      <HomeHabitCard
        habit={{
          ...habit,
          metrics: {
            ...habit.metrics,
            completedToday: false,
          },
        }}
        colors={colors as never}
        styles={styles as never}
        isSaving={false}
        onOpenHabit={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
      />,
    );

    expect(mockParallel).toHaveBeenCalled();
    expect(mockTiming).toHaveBeenCalled();
  });
});
