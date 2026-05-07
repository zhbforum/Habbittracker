import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupWithMetrics } from "@/test/fixtures/habits";
import { HabitGroupSummaryCard } from "../HabitGroupSummaryCard";

describe("HabitGroupSummaryCard", () => {
  it("Given active group summary, When rendering and pressing card, Then it shows metrics and forwards press action", () => {
    const onPress = jest.fn();
    const group = createHabitGroupWithMetrics("group-1", {
      name: "Morning routine",
      description: "Warmup + breathing",
      reminderStartTime: "07:00",
      reminderEndTime: "21:00",
      startDate: "2026-05-01",
      endDate: "2026-06-01",
      frequency: "weekly",
      weeklyWeekday: 2,
      dailyGoal: 3,
      metrics: {
        sessionPhase: "active",
        targetCount: 2,
        completedHabitsCount: 1,
        progressPercent: 50,
        remainingCount: 1,
        isWithinDateRange: true,
        isScheduledToday: true,
        isCompletedToday: false,
      } as never,
    });

    render(<HabitGroupSummaryCard group={group} onPress={onPress} />);

    expect(screen.getByText("Morning routine")).toBeTruthy();
    expect(screen.getByText("Warmup + breathing")).toBeTruthy();
    expect(screen.getByText("In window")).toBeTruthy();
    expect(screen.getByText("Goal 2")).toBeTruthy();
    expect(screen.getByText("7:00 AM - 9:00 PM")).toBeTruthy();
    expect(screen.getByText("Weekly (Tue)")).toBeTruthy();
    expect(screen.getByText("1/2 done")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();

    fireEvent.press(screen.getByText("Morning routine"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("Given group without description and finished progress, When rendering summary, Then it hides description and shows completion hint", () => {
    const group = createHabitGroupWithMetrics("group-2", {
      description: "",
      metrics: {
        sessionPhase: "after_end",
        targetCount: 1,
        completedHabitsCount: 1,
        progressPercent: 100,
        isCompletedToday: true,
        isWithinDateRange: true,
        isScheduledToday: true,
        remainingCount: 0,
      } as never,
    });

    render(<HabitGroupSummaryCard group={group} onPress={jest.fn()} />);

    expect(screen.queryByText("Warmup + breathing")).toBeNull();
    expect(screen.getByText("Window ended")).toBeTruthy();
    expect(screen.getByText("Daily goal reached for this group.")).toBeTruthy();
  });
});
