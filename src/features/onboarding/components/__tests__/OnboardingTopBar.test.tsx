import { fireEvent, render, screen } from "@testing-library/react-native";

import { OnboardingTopBar } from "../OnboardingTopBar";

describe("OnboardingTopBar", () => {
  it("Given hidden back button and hidden skip, When rendering top bar, Then it shows no pressable actions", () => {
    render(
      <OnboardingTopBar
        showSkip={false}
        backButtonVariant="hidden"
        onBackPress={jest.fn()}
        onSkipPress={jest.fn()}
      />,
    );

    expect(screen.queryByText("Skip")).toBeNull();
  });

  it("Given plain back button and visible skip, When pressing controls, Then it calls back and skip actions", () => {
    const onBackPress = jest.fn();
    const onSkipPress = jest.fn();
    const { UNSAFE_getByProps } = render(
      <OnboardingTopBar
        showSkip
        backButtonVariant="plain"
        onBackPress={onBackPress}
        onSkipPress={onSkipPress}
      />,
    );

    expect(screen.getByText("Skip")).toBeTruthy();

    fireEvent.press(UNSAFE_getByProps({ onPress: onBackPress }));
    fireEvent.press(screen.getByText("Skip"));

    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(onSkipPress).toHaveBeenCalledTimes(1);
  });
});
