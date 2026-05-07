import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupFormValues, createHabitWithMetrics } from "@/test/fixtures/habits";

import { HabitGroupHabitSelectorList } from "../HabitGroupHabitSelectorList";
import { HabitGroupEditorGoalSection } from "../HabitGroupEditorGoalSection";

jest.mock("../HabitGroupHabitSelectorList", () => ({
  HabitGroupHabitSelectorList: jest.fn(() => null),
}));

const habitGroupHabitSelectorListMock = jest.mocked(HabitGroupHabitSelectorList);

const styles = {
  fieldLabel: {},
  goalRow: {},
  goalStepButton: {},
  goalValueCard: {},
  goalValue: {},
  goalHint: {},
  disabledButton: {},
  goalInfo: {},
  habitsSelectionWrap: {},
} as const;

const colors = {
  textPrimary: "#111111",
} as const;

describe("HabitGroupEditorGoalSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given selected habits and goal controls, When pressing step buttons, Then it respects bounds and forwards valid goal changes", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      habitIds: ["habit-1", "habit-2"],
      dailyGoal: 1,
    });

    render(
      <HabitGroupEditorGoalSection
        values={values}
        availableHabits={[createHabitWithMetrics("habit-1"), createHabitWithMetrics("habit-2")]}
        colors={colors as never}
        styles={styles as never}
        onToggleHabit={jest.fn()}
        onFieldChange={onFieldChange}
      />,
    );

    expect(screen.getByText("Goal can be up to selected habits: 2")).toBeTruthy();

    fireEvent.press(screen.getByTestId("group-goal-decrease"));
    fireEvent.press(screen.getByTestId("group-goal-increase"));

    expect(onFieldChange).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenCalledWith("dailyGoal", 2);
  });

  it("Given no selected habits, When pressing plus button, Then it stays disabled and does not emit goal changes", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      habitIds: [],
      dailyGoal: 1,
    });

    render(
      <HabitGroupEditorGoalSection
        values={values}
        availableHabits={[]}
        colors={colors as never}
        styles={styles as never}
        onToggleHabit={jest.fn()}
        onFieldChange={onFieldChange}
      />,
    );

    fireEvent.press(screen.getByTestId("group-goal-increase"));

    expect(onFieldChange).not.toHaveBeenCalled();
    expect(habitGroupHabitSelectorListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedHabitIds: [],
      }),
      undefined,
    );
  });
});
