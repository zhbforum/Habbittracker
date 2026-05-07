import { fireEvent, render, screen } from "@testing-library/react-native";

import { HabitSegmentedControl } from "../HabitSegmentedControl";

describe("HabitSegmentedControl", () => {
  it("Given options and selected value, When pressing another option, Then it calls onSelect with chosen value", () => {
    const onSelect = jest.fn();

    render(
      <HabitSegmentedControl
        options={[
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" },
        ]}
        selectedValue="daily"
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByText("Weekly"));

    expect(onSelect).toHaveBeenCalledWith("weekly");
  });

  it("Given compact size variant, When rendering segmented control, Then it still renders and handles selection", () => {
    const onSelect = jest.fn();

    render(
      <HabitSegmentedControl
        options={[
          { label: "Helpful", value: "positive" },
          { label: "Harmful", value: "negative" },
        ]}
        selectedValue="positive"
        onSelect={onSelect}
        size="compact"
      />,
    );

    fireEvent.press(screen.getByText("Harmful"));

    expect(onSelect).toHaveBeenCalledWith("negative");
  });
});
