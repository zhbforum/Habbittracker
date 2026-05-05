import { fireEvent, render, screen } from "@testing-library/react-native";

import { HabitEmptyState } from "../HabitEmptyState";

describe("HabitEmptyState", () => {
  it("renders empty state copy and handles create action", () => {
    const onCreatePress = jest.fn();

    render(<HabitEmptyState onCreatePress={onCreatePress} />);

    expect(screen.getByText("Start your first habit")).toBeTruthy();
    expect(
      screen.getByText(
        "Build momentum with one meaningful action today. You can add helpful or harmful habits and track both with streaks and heatmap.",
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Create habit"));
    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });
});
