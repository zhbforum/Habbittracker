import { ActivityIndicator } from "react-native";
import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";

import { OnboardingScreen } from "@features/onboarding";
import { useAppTheme } from "@shared/theme";

import { useIndexScreenController } from "../../hooks/useIndexScreenController";
import IndexScreen from "../IndexScreen";

jest.mock("@shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../../hooks/useIndexScreenController", () => ({
  useIndexScreenController: jest.fn(),
}));

jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null),
}));

jest.mock("@features/onboarding", () => ({
  OnboardingScreen: jest.fn(() => null),
}));

const mockedUseAppTheme = jest.mocked(useAppTheme);
const mockedUseIndexScreenController = jest.mocked(useIndexScreenController);
const mockedRedirect = jest.mocked(Redirect);
const mockedOnboardingScreen = jest.mocked(OnboardingScreen);

describe("IndexScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAppTheme.mockReturnValue({
      colors: {
        background: "#ffffff",
        textPrimary: "#111111",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("renders loader while loading", () => {
    mockedUseIndexScreenController.mockReturnValue({
      isLoading: true,
      shouldShowOnboarding: false,
      redirectRoute: null,
    });

    const { UNSAFE_getByType } = render(<IndexScreen />);

    const loader = UNSAFE_getByType(ActivityIndicator);

    expect(loader.props.size).toBe("small");
    expect(loader.props.color).toBe("#111111");
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedOnboardingScreen).not.toHaveBeenCalled();
  });

  it("redirects when redirectRoute exists", () => {
    mockedUseIndexScreenController.mockReturnValue({
      isLoading: false,
      shouldShowOnboarding: true,
      redirectRoute: "/home",
    });

    render(<IndexScreen />);

    expect(mockedRedirect.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        href: "/home",
      }),
    );

    expect(mockedOnboardingScreen).not.toHaveBeenCalled();
  });

  it("renders onboarding when it should be shown", () => {
    mockedUseIndexScreenController.mockReturnValue({
      isLoading: false,
      shouldShowOnboarding: true,
      redirectRoute: null,
    });

    render(<IndexScreen />);

    expect(mockedOnboardingScreen).toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("renders nothing when no state matches", () => {
    mockedUseIndexScreenController.mockReturnValue({
      isLoading: false,
      shouldShowOnboarding: false,
      redirectRoute: null,
    });

    const { toJSON } = render(<IndexScreen />);

    expect(toJSON()).toBeNull();
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedOnboardingScreen).not.toHaveBeenCalled();
  });
});
