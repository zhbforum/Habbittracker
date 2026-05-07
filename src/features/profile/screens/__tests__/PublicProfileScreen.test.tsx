import { render } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";

import { useAppTheme } from "@/shared/theme";
import { createProfileBundle } from "@/test/fixtures/profile";

import { PublicProfileCard } from "../../components/PublicProfileCard";
import { PublicProfilePageHeader } from "../../components/PublicProfilePageHeader";
import { PublicProfileState } from "../../components/PublicProfileState";
import { usePublicProfileScreenController } from "../../hooks/usePublicProfileScreenController";
import PublicProfileScreen from "../PublicProfileScreen";

function mockSafeAreaView({ children }: { children: ReactNode }) {
  return children;
}

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: jest.fn(mockSafeAreaView),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../../hooks/usePublicProfileScreenController", () => ({
  usePublicProfileScreenController: jest.fn(),
}));

jest.mock("../PublicProfileScreen.styles", () => ({
  createPublicProfileScreenStyles: jest.fn(() => ({
    safeArea: {},
    content: {},
  })),
}));

jest.mock("../../components/PublicProfilePageHeader", () => ({
  PublicProfilePageHeader: jest.fn(() => null),
}));

jest.mock("../../components/PublicProfileState", () => ({
  PublicProfileState: jest.fn(() => null),
}));

jest.mock("../../components/PublicProfileCard", () => ({
  PublicProfileCard: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const usePublicProfileScreenControllerMock = jest.mocked(usePublicProfileScreenController);
const statusBarMock = jest.mocked(StatusBar);
const publicProfilePageHeaderMock = jest.mocked(PublicProfilePageHeader);
const publicProfileStateMock = jest.mocked(PublicProfileState);
const publicProfileCardMock = jest.mocked(PublicProfileCard);

type PublicProfileController = ReturnType<typeof usePublicProfileScreenController>;

function createController(
  overrides: Partial<PublicProfileController> = {},
): PublicProfileController {
  return {
    isLoading: false,
    errorMessage: null,
    profileData: createProfileBundle(),
    handleBackPress: jest.fn(),
    ...overrides,
  };
}

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("PublicProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#121212",
      },
      isDark: false,
    } as ReturnType<typeof useAppTheme>);

    usePublicProfileScreenControllerMock.mockReturnValue(createController());
  });

  it("Given light theme, When rendering screen, Then it uses dark status bar and passes back handler to header", () => {
    const controller = createController();
    usePublicProfileScreenControllerMock.mockReturnValue(controller);

    render(<PublicProfileScreen />);

    expect(statusBarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        style: "dark",
      }),
    );
    expect(getLastProps(publicProfilePageHeaderMock)).toEqual(
      expect.objectContaining({
        onBackPress: controller.handleBackPress,
      }),
    );
  });

  it("Given dark theme, When rendering screen, Then it uses light status bar", () => {
    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#000000",
      },
      isDark: true,
    } as ReturnType<typeof useAppTheme>);

    render(<PublicProfileScreen />);

    expect(statusBarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        style: "light",
      }),
    );
  });

  it("Given loading is false and profile is missing without error, When rendering state props, Then it marks view as not found", () => {
    usePublicProfileScreenControllerMock.mockReturnValue(
      createController({
        isLoading: false,
        errorMessage: null,
        profileData: null,
      }),
    );

    render(<PublicProfileScreen />);

    expect(getLastProps(publicProfileStateMock)).toEqual(
      expect.objectContaining({
        isLoading: false,
        errorMessage: null,
        isNotFound: true,
      }),
    );
    expect(publicProfileCardMock).not.toHaveBeenCalled();
  });

  it("Given error state, When rendering, Then it keeps not-found disabled and hides profile card", () => {
    usePublicProfileScreenControllerMock.mockReturnValue(
      createController({
        isLoading: false,
        errorMessage: "Failed to load",
        profileData: null,
      }),
    );

    render(<PublicProfileScreen />);

    expect(getLastProps(publicProfileStateMock)).toEqual(
      expect.objectContaining({
        isNotFound: false,
        errorMessage: "Failed to load",
      }),
    );
    expect(publicProfileCardMock).not.toHaveBeenCalled();
  });

  it("Given resolved profile data, When rendering, Then it shows profile card and forwards profile bundle", () => {
    const profileData = createProfileBundle();
    usePublicProfileScreenControllerMock.mockReturnValue(
      createController({
        isLoading: false,
        errorMessage: null,
        profileData,
      }),
    );

    render(<PublicProfileScreen />);

    expect(getLastProps(publicProfileCardMock)).toEqual(
      expect.objectContaining({
        profileData,
      }),
    );
  });
});
