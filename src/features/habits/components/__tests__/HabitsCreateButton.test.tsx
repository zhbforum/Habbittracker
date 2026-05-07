import { fireEvent, render, screen } from "@testing-library/react-native";

import { HabitsCreateButton } from "../HabitsCreateButton";

describe("HabitsCreateButton", () => {
  it("Given floating action button, When pressing New habit action, Then it calls onPress callback", () => {
    const onPress = jest.fn();

    render(<HabitsCreateButton onPress={onPress} />);

    fireEvent.press(screen.getByText("New habit"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
