import { fireEvent, render, screen } from "@testing-library/react-native";

import { HabitWeekdaySelector } from "../HabitWeekdaySelector";

describe("HabitWeekdaySelector", () => {
  it("Given weekday row, When pressing one of weekday buttons, Then it forwards selected weekday", () => {
    const onToggleWeekday = jest.fn();
    render(<HabitWeekdaySelector selectedWeekdays={[1, 3]} onToggleWeekday={onToggleWeekday} />);
    fireEvent.press(screen.getByTestId("habit-weekday-3"));

    expect(onToggleWeekday).toHaveBeenCalledWith(3);
  });
});
