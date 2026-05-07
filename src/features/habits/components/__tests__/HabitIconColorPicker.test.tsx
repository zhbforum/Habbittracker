import { fireEvent, render, screen } from "@testing-library/react-native";

import { HABIT_ICON_COLOR_OPTIONS } from "@features/habits/model/icons";
import { HabitIconColorPicker } from "../HabitIconColorPicker";

describe("HabitIconColorPicker", () => {
  it("Given color options, When selecting another color, Then it calls onSelectColor with selected id", () => {
    const onSelectColor = jest.fn();
    render(<HabitIconColorPicker selectedColorId="emerald" onSelectColor={onSelectColor} />);

    fireEvent.press(
      screen.getByTestId(`habit-icon-color-${HABIT_ICON_COLOR_OPTIONS[3]?.id}`),
    );

    expect(onSelectColor).toHaveBeenCalledWith(HABIT_ICON_COLOR_OPTIONS[3]?.id);
  });
});
