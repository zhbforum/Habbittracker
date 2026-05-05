import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";
import { HabitDetailsSheet } from "../HabitDetailsSheet";

const weeklyPerformance = [
  {
    dateKey: "2026-06-01",
    label: "Mon",
    dayOfMonthLabel: "1",
    scheduled: true,
    completed: true,
  },
];

const heatmap = [
  {
    weekLabel: "2026-w22",
    cells: [
      {
        dateKey: "2026-06-01",
        scheduled: true,
        completed: true,
        level: 3 as const,
      },
    ],
  },
];

describe("HabitDetailsSheet", () => {
  it("returns null when habit is missing", () => {
    const { toJSON } = render(
      <HabitDetailsSheet
        isVisible
        habit={null}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleToday={jest.fn()}
        onSetTodayProgressValue={jest.fn()}
      />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders check-in habit details and forwards toggle/edit actions", () => {
    const onToggleToday = jest.fn();
    const onEdit = jest.fn();
    const habit = createHabitWithMetrics("habit-1", {
      name: "Read books",
      iconId: "reading",
      goal: {
        metric: "checkins",
        period: "day",
        target: 1,
        unit: "times",
      },
      metrics: {
        completedToday: false,
        todayLoggedValue: 0,
        goalProgress: {
          period: "day",
          target: 1,
          currentValue: 0,
          remainingValue: 1,
          progressPercent: 0,
          periodLabel: "Today",
        },
        currentStreak: 2,
        bestStreak: 7,
        weeklyPerformance,
        weeklyCompletedCount: 1,
        weeklyScheduledCount: 1,
        heatmap,
      },
    });

    render(
      <HabitDetailsSheet
        isVisible
        habit={habit}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={onEdit}
        onDelete={jest.fn()}
        onToggleToday={onToggleToday}
        onSetTodayProgressValue={jest.fn()}
      />,
    );

    expect(screen.getByText("Read books")).toBeTruthy();
    expect(screen.getByText("Weekly performance")).toBeTruthy();
    expect(screen.getByText("Activity Heatmap")).toBeTruthy();
    expect(screen.queryByPlaceholderText("0 times")).toBeNull();

    fireEvent.press(screen.getByText("Mark done"));
    fireEvent.press(screen.getByText("Edit"));

    expect(onToggleToday).toHaveBeenCalledWith("habit-1");
    expect(onEdit).toHaveBeenCalledWith("habit-1");
  });

  it("handles value-goal save/clear and delete confirmation flow", async () => {
    const onSetTodayProgressValue = jest.fn();
    const onDelete = jest.fn();
    const habit = createHabitWithMetrics("habit-1", {
      name: "Read books",
      iconId: "reading",
      goal: {
        metric: "value",
        period: "day",
        target: 2,
        unit: "cups",
      },
      metrics: {
        completedToday: true,
        currentStreak: 2,
        bestStreak: 7,
        weeklyPerformance,
        weeklyCompletedCount: 1,
        weeklyScheduledCount: 1,
        heatmap,
        todayLoggedValue: 1.5,
        goalProgress: {
          period: "day",
          target: 2,
          currentValue: 1.5,
          remainingValue: 0.5,
          progressPercent: 75,
          periodLabel: "Today",
        },
      },
    });

    render(
      <HabitDetailsSheet
        isVisible
        habit={habit}
        isSaving={false}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onToggleToday={jest.fn()}
        onSetTodayProgressValue={onSetTodayProgressValue}
      />,
    );

    await screen.findByDisplayValue("1.5");
    fireEvent.changeText(screen.getByPlaceholderText("0 cups"), "2,5");
    fireEvent.press(screen.getByText("Save"));
    fireEvent.press(screen.getByText("Clear"));

    expect(onSetTodayProgressValue).toHaveBeenCalledWith("habit-1", 2.5);
    expect(onSetTodayProgressValue).toHaveBeenCalledWith("habit-1", 0);

    fireEvent.press(screen.getAllByText("Delete")[0]);
    await screen.findByText("This habit and all activity history will be removed.");
    fireEvent.press(screen.getAllByText("Delete")[1]);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("habit-1");
    });
  });
});
