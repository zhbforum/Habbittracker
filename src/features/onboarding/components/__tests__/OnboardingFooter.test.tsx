import { fireEvent, render, screen } from "@testing-library/react-native";

import { PaginationDots } from "../PaginationDots";
import { OnboardingFooter } from "../OnboardingFooter";

jest.mock("../PaginationDots", () => ({
  PaginationDots: jest.fn(() => null),
}));

const paginationDotsMock = jest.mocked(PaginationDots);

describe("OnboardingFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given primary action with arrow and secondary action, When rendering footer and pressing buttons, Then it maps labels and callbacks", () => {
    const onPrimaryPress = jest.fn();
    const onSecondaryActionPress = jest.fn();

    render(
      <OnboardingFooter
        activeIndex={1}
        totalSlides={3}
        primaryAction={{ label: "Next", kind: "next", showArrow: true }}
        secondaryAction={{ label: "Skip intro", kind: "finish" }}
        onPrimaryPress={onPrimaryPress}
        onSecondaryActionPress={onSecondaryActionPress}
      />,
    );

    expect(screen.getByText("Next")).toBeTruthy();
    expect(screen.getByText(">")).toBeTruthy();
    expect(screen.getByText("Skip intro")).toBeTruthy();
    expect(paginationDotsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 3,
        activeIndex: 1,
      }),
      undefined,
    );

    fireEvent.press(screen.getByText("Next"));
    fireEvent.press(screen.getByText("Skip intro"));

    expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    expect(onSecondaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("Given primary action without arrow and no secondary action, When rendering footer, Then it hides optional controls", () => {
    render(
      <OnboardingFooter
        activeIndex={0}
        totalSlides={2}
        primaryAction={{ label: "Get started", kind: "finish", showArrow: false }}
        onPrimaryPress={jest.fn()}
        onSecondaryActionPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Get started")).toBeTruthy();
    expect(screen.queryByText(">")).toBeNull();
    expect(screen.queryByText("Skip intro")).toBeNull();
  });
});
