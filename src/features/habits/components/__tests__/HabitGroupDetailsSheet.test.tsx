import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import {
  createHabitGroupWithMetrics,
  createHabitWithMetrics,
} from "@/test/fixtures/habits";
import type { HabitMetrics, HabitWithMetrics } from "@features/habits/model/types";
import { HabitGroupDetailsSheet } from "../HabitGroupDetailsSheet";

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
    bestStreak: completedToday ? 1 : 0,
    weeklyPerformance: [],
    weeklyCompletedCount: completedToday ? 1 : 0,
    weeklyScheduledCount: 1,
    heatmap: [],
  };
}

describe("HabitGroupDetailsSheet", () => {
  it("returns null when group is missing", () => {
    const { toJSON } = render(
      <HabitGroupDetailsSheet
        isVisible
        group={null}
        habits={[]}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders group details with members and forwards edit/delete actions", async () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const group = createHabitGroupWithMetrics("group-1", {
      name: "Morning routine",
      description: "Start the day focused",
      iconId: "focus",
      reminderStartTime: "07:00",
      reminderEndTime: "21:00",
      dailyGoal: 2,
      habitIds: ["habit-1", "habit-2"],
      metrics: {
        totalHabitsCount: 2,
        scheduledHabitsCount: 2,
        completedHabitsCount: 1,
        isScheduledToday: true,
        isWithinDateRange: true,
        targetCount: 2,
        remainingCount: 1,
        progressPercent: 50,
        isCompletedToday: false,
        sessionPhase: "active",
      },
    });
    const habits: HabitWithMetrics[] = [
      createHabitWithMetrics("habit-1", {
        name: "Read books",
        iconId: "reading",
        metrics: createMetrics(true),
      }),
      createHabitWithMetrics("habit-2", {
        name: "Drink water",
        iconId: "water",
        metrics: createMetrics(false),
      }),
      createHabitWithMetrics("habit-3", {
        name: "Walk",
        iconId: "walk",
        metrics: createMetrics(true),
      }),
    ];

    render(
      <HabitGroupDetailsSheet
        isVisible
        group={group}
        habits={habits}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Morning routine")).toBeTruthy();
    expect(screen.getByText("Start the day focused")).toBeTruthy();
    expect(screen.getByText("Read books")).toBeTruthy();
    expect(screen.getByText("Drink water")).toBeTruthy();
    expect(screen.getByText("Completed today")).toBeTruthy();
    expect(screen.getByText("Pending today")).toBeTruthy();
    expect(screen.getByText(/^Created /)).toBeTruthy();

    fireEvent.press(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith("group-1");

    fireEvent.press(screen.getAllByText("Delete")[0]);
    await screen.findByText("This group will be removed. Habits inside it will remain intact.");
    fireEvent.press(screen.getAllByText("Delete")[1]);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("group-1");
    });
  });

  it("shows empty member state when group has no matching habits", () => {
    const group = createHabitGroupWithMetrics("group-1", {
      habitIds: ["missing-habit-id"],
    });

    render(
      <HabitGroupDetailsSheet
        isVisible
        group={group}
        habits={[createHabitWithMetrics("habit-1")]}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.getByText("This group has no habits yet. Edit the group to include habits."),
    ).toBeTruthy();
  });
});
