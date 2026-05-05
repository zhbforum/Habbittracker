import { fireEvent, render } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";

import { HabitsContentState } from "../HabitsContentState";

const mockText = Text;
const mockView = View;

jest.mock("../HabitEmptyState", () => ({
  HabitEmptyState: ({ onCreatePress }: { onCreatePress: () => void }) => {
    const MockText = mockText;
    return <MockText onPress={onCreatePress}>Create first habit</MockText>;
  },
}));

jest.mock("../HabitSummaryCard", () => ({
  HabitSummaryCard: ({
    habit,
    onPress,
    onToggleToday,
  }: {
    habit: { id: string; name: string };
    onPress: () => void;
    onToggleToday: () => void;
  }) => {
    const MockText = mockText;
    const MockView = mockView;
    return (
      <MockView>
        <MockText onPress={onPress}>{`Open ${habit.name}`}</MockText>
        <MockText onPress={onToggleToday}>{`Toggle ${habit.id}`}</MockText>
      </MockView>
    );
  },
}));

describe("HabitsContentState", () => {
  it("shows loading state while habits are being fetched", () => {
    const screen = render(
      <HabitsContentState
        isLoading
        errorMessage={null}
        habits={[]}
        onRetry={jest.fn()}
        onCreatePress={jest.fn()}
        onOpenHabit={jest.fn()}
        onToggleToday={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading habits...")).toBeTruthy();
  });

  it("shows error banner and retries on press", () => {
    const onRetry = jest.fn();
    const screen = render(
      <HabitsContentState
        isLoading={false}
        errorMessage="Unable to load habits"
        habits={[]}
        onRetry={onRetry}
        onCreatePress={jest.fn()}
        onOpenHabit={jest.fn()}
        onToggleToday={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Retry"));

    expect(screen.getByText("Unable to load habits")).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows empty state and delegates create action when list is empty", () => {
    const onCreatePress = jest.fn();
    const screen = render(
      <HabitsContentState
        isLoading={false}
        errorMessage={null}
        habits={[]}
        onRetry={jest.fn()}
        onCreatePress={onCreatePress}
        onOpenHabit={jest.fn()}
        onToggleToday={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Create first habit"));

    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });

  it("renders habits and delegates open/toggle actions with habit ids", () => {
    const onOpenHabit = jest.fn();
    const onToggleToday = jest.fn();
    const habits = [
      createHabitWithMetrics("habit-1", { name: "Drink water" }),
      createHabitWithMetrics("habit-2", { name: "Walk" }),
    ];
    const screen = render(
      <HabitsContentState
        isLoading={false}
        errorMessage={null}
        habits={habits}
        onRetry={jest.fn()}
        onCreatePress={jest.fn()}
        onOpenHabit={onOpenHabit}
        onToggleToday={onToggleToday}
      />,
    );

    fireEvent.press(screen.getByText("Open Drink water"));
    fireEvent.press(screen.getByText("Toggle habit-2"));

    expect(onOpenHabit).toHaveBeenCalledWith("habit-1");
    expect(onToggleToday).toHaveBeenCalledWith("habit-2");
  });
});
