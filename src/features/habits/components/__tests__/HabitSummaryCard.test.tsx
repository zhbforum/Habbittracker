import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";

import { HabitSummaryCard } from "../HabitSummaryCard";

describe("HabitSummaryCard", () => {
  it("Given check-in habit card, When pressing card and completion button, Then it forwards both actions", () => {
    const onPress = jest.fn();
    const onToggleToday = jest.fn();
    const habit = createHabitWithMetrics("habit-1", {
      name: "Hydration",
      kind: "positive",
      frequency: "weekly",
      weeklyWeekday: 1,
      reminderTime: "08:00",
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
      metrics: {
        completedToday: false,
        currentStreak: 2,
        bestStreak: 7,
      } as never,
    });

    render(<HabitSummaryCard habit={habit} onPress={onPress} onToggleToday={onToggleToday} />);

    expect(screen.getByText("Hydration")).toBeTruthy();
    expect(screen.getByText("Weekly on Mon")).toBeTruthy();
    expect(screen.getByText("8:00 AM")).toBeTruthy();
    expect(screen.getByText("1 times/day")).toBeTruthy();
    expect(screen.getByText("2d current")).toBeTruthy();
    expect(screen.getByText("7d best")).toBeTruthy();

    fireEvent.press(screen.getByText("Hydration"));
    fireEvent.press(screen.getByText("Mark done"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onToggleToday).toHaveBeenCalledTimes(1);
  });

  it("Given value-based habit with completed goal and reminder off, When rendering card, Then it shows value chip and reached-state action", () => {
    const habit = createHabitWithMetrics("habit-2", {
      goal: {
        metric: "value",
        period: "day",
        target: 2,
        unit: "cups",
      },
      reminderTime: "",
      metrics: {
        completedToday: true,
        todayLoggedValue: 1.75,
      } as never,
    });

    render(<HabitSummaryCard habit={habit} onPress={jest.fn()} onToggleToday={jest.fn()} />);

    expect(screen.getByText("Off")).toBeTruthy();
    expect(screen.getByText("1.75 cups")).toBeTruthy();
    expect(screen.getByText("Goal reached")).toBeTruthy();
  });
});
