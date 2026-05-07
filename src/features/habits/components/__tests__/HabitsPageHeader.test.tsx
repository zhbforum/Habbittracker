import { render, screen } from "@testing-library/react-native";

import { HabitsPageHeader } from "../HabitsPageHeader";

describe("HabitsPageHeader", () => {
  it("Given habits page header, When rendering title and subtitle, Then both texts are visible", () => {
    render(<HabitsPageHeader />);

    expect(screen.getByText("Habits")).toBeTruthy();
    expect(
      screen.getByText(
        "Build your routine, break harmful patterns, and track progress with streaks and heatmap.",
      ),
    ).toBeTruthy();
  });
});
