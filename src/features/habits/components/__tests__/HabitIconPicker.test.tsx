import { fireEvent, render, screen } from "@testing-library/react-native";

import { HABIT_ICON_OPTIONS } from "@features/habits/model/icons";
import { HabitIconPicker } from "../HabitIconPicker";

describe("HabitIconPicker", () => {
  it("Given icon grid, When pressing icon card, Then it calls onSelectIcon with icon id", () => {
    const onSelectIcon = jest.fn();
    render(
      <HabitIconPicker
        selectedIconId="water"
        selectedIconColorId="emerald"
        onSelectIcon={onSelectIcon}
      />,
    );

    fireEvent.press(screen.getByTestId(`habit-icon-${HABIT_ICON_OPTIONS[4]?.id}`));

    expect(onSelectIcon).toHaveBeenCalledWith(HABIT_ICON_OPTIONS[4]?.id);
  });
});
