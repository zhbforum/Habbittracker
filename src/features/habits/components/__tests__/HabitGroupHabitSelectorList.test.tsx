import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";

import { HabitGroupHabitSelectorList } from "../HabitGroupHabitSelectorList";

const styles = {
  noHabitsCard: {},
  noHabitsText: {},
  habitSelectCard: {},
  habitSelectCardActive: {},
  habitIconWrap: {},
  habitIdentityWrap: {},
  habitName: {},
  habitMeta: {},
  checkWrap: {},
  checkWrapActive: {},
} as const;

const colors = {
  successText: "#00AA00",
} as const;

describe("HabitGroupHabitSelectorList", () => {
  it("Given no available habits, When rendering selector list, Then it shows empty helper card", () => {
    render(
      <HabitGroupHabitSelectorList
        availableHabits={[]}
        selectedHabitIds={[]}
        styles={styles as never}
        colors={colors as never}
        onToggleHabit={jest.fn()}
      />,
    );

    expect(screen.getByText("Add habits first to build a group.")).toBeTruthy();
  });

  it("Given available habits, When pressing member card, Then it calls onToggleHabit and shows completion meta", () => {
    const onToggleHabit = jest.fn();
    const availableHabits = [
      createHabitWithMetrics("habit-1", {
        name: "Read",
        metrics: { completedToday: true } as never,
      }),
      createHabitWithMetrics("habit-2", {
        name: "Walk",
        metrics: { completedToday: false } as never,
      }),
    ];

    render(
      <HabitGroupHabitSelectorList
        availableHabits={availableHabits}
        selectedHabitIds={["habit-1"]}
        styles={styles as never}
        colors={colors as never}
        onToggleHabit={onToggleHabit}
      />,
    );

    expect(screen.getByText("Completed today")).toBeTruthy();
    expect(screen.getByText("Not done yet")).toBeTruthy();

    fireEvent.press(screen.getByText("Walk"));

    expect(onToggleHabit).toHaveBeenCalledWith("habit-2");
  });
});
