import { FlatList } from "react-native";
import { render } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";

import { useAppTheme } from "@/shared/theme";

import { OnboardingFooter } from "../../components/OnboardingFooter";
import { OnboardingSlideCard } from "../../components/OnboardingSlideCard";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { useOnboardingScreenController } from "../../hooks/useOnboardingScreenController";
import { onboardingSlides } from "../../model/slides";
import OnboardingScreen from "../OnboardingScreen";

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock("@/shared/theme", () => ({
  layout: {
    maxContentWidth: 480,
    horizontalPadding: 20,
  },
  useAppTheme: jest.fn(),
}));

jest.mock("../../hooks/useOnboardingScreenController", () => ({
  useOnboardingScreenController: jest.fn(),
}));

jest.mock("../../components/OnboardingTopBar", () => ({
  OnboardingTopBar: jest.fn(() => null),
}));

jest.mock("../../components/OnboardingSlideCard", () => ({
  OnboardingSlideCard: jest.fn(() => null),
}));

jest.mock("../../components/OnboardingFooter", () => ({
  OnboardingFooter: jest.fn(() => null),
}));

const mockedStatusBar = jest.mocked(StatusBar);
const mockedUseAppTheme = jest.mocked(useAppTheme);
const mockedUseOnboardingScreenController = jest.mocked(
  useOnboardingScreenController,
);
const mockedOnboardingTopBar = jest.mocked(OnboardingTopBar);
const mockedOnboardingSlideCard = jest.mocked(OnboardingSlideCard);
const mockedOnboardingFooter = jest.mocked(OnboardingFooter);

const themeColors = {
  background: "#ffffff",
  textPrimary: "#111111",
};

function mockTheme(isDark = false) {
  mockedUseAppTheme.mockReturnValue({
    colors: themeColors,
    isDark,
  } as ReturnType<typeof useAppTheme>);
}

function mockController(
  overrides: Partial<ReturnType<typeof useOnboardingScreenController>> = {},
) {
  const controller = {
    activeIndex: 1,
    slideWidth: 320,
    topBar: {
      showSkip: true,
      backButtonVariant: "back",
    },
    primaryAction: {
      label: "Continue",
    },
    secondaryAction: {
      label: "Maybe later",
    },
    carouselRef: {
      current: null,
    },
    handleScrollEnd: jest.fn(),
    goToPreviousSlide: jest.fn(),
    finishOnboarding: jest.fn(),
    handlePrimaryPress: jest.fn(),
    handleSecondaryActionPress: jest.fn(),
    ...overrides,
  } as ReturnType<typeof useOnboardingScreenController>;

  mockedUseOnboardingScreenController.mockReturnValue(controller);

  return controller;
}

describe("OnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme();
  });

  it("renders onboarding layout and passes controller state to child components", () => {
    const controller = mockController();

    render(<OnboardingScreen />);

    expect(mockedStatusBar.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        style: "dark",
      }),
    );

    expect(mockedOnboardingTopBar.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        showSkip: controller.topBar.showSkip,
        backButtonVariant: controller.topBar.backButtonVariant,
        onBackPress: controller.goToPreviousSlide,
        onSkipPress: controller.finishOnboarding,
      }),
    );

    expect(mockedOnboardingFooter.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        activeIndex: controller.activeIndex,
        totalSlides: onboardingSlides.length,
        primaryAction: controller.primaryAction,
        secondaryAction: controller.secondaryAction,
        onPrimaryPress: controller.handlePrimaryPress,
        onSecondaryActionPress: controller.handleSecondaryActionPress,
      }),
    );
  });

  it("uses light status bar style in dark theme", () => {
    mockTheme(true);
    mockController();

    render(<OnboardingScreen />);

    expect(mockedStatusBar.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        style: "light",
      }),
    );
  });

  it("configures carousel props and helpers", () => {
    const controller = mockController();

    const { UNSAFE_getByType } = render(<OnboardingScreen />);
    const flatList = UNSAFE_getByType(FlatList);

    expect(flatList.props.data).toBe(onboardingSlides);
    expect(flatList.props.horizontal).toBe(true);
    expect(flatList.props.pagingEnabled).toBe(true);
    expect(flatList.props.bounces).toBe(false);
    expect(flatList.props.showsHorizontalScrollIndicator).toBe(false);
    expect(flatList.props.onMomentumScrollEnd).toBe(controller.handleScrollEnd);

    expect(flatList.props.keyExtractor(onboardingSlides[0])).toBe(
      onboardingSlides[0].id,
    );

    expect(flatList.props.getItemLayout(null, 2)).toEqual({
      length: controller.slideWidth,
      offset: controller.slideWidth * 2,
      index: 2,
    });

    const slideElement = flatList.props.renderItem({
      item: onboardingSlides[0],
      index: 0,
      separators: {
        highlight: jest.fn(),
        unhighlight: jest.fn(),
        updateProps: jest.fn(),
      },
    });

    expect(slideElement.props).toEqual(
      expect.objectContaining({
        slide: onboardingSlides[0],
        slideWidth: controller.slideWidth,
      }),
    );

    expect(mockedOnboardingSlideCard).toHaveBeenCalled();
  });
});
