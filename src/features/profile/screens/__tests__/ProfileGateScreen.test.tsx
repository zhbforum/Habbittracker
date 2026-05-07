import { ActivityIndicator, StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { AuthScreen } from "@features/auth";
import { useAuthSession } from "@/shared/auth";
import { useAppTheme } from "@/shared/theme";
import { UserProfileScreen } from "../UserProfileScreen";
import ProfileGateScreen from "../ProfileGateScreen";

jest.mock("@features/auth", () => ({
  AuthScreen: jest.fn(() => null),
}));

jest.mock("@/shared/auth", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../UserProfileScreen", () => ({
  UserProfileScreen: jest.fn(() => null),
}));

const useAuthSessionMock = jest.mocked(useAuthSession);
const useAppThemeMock = jest.mocked(useAppTheme);
const AuthScreenMock = jest.mocked(AuthScreen);
const UserProfileScreenMock = jest.mocked(UserProfileScreen);

const colors = {
  background: "#111111",
  textPrimary: "#ffffff",
};

function mockTheme() {
  useAppThemeMock.mockReturnValue({
    colors,
  } as ReturnType<typeof useAppTheme>);
}

function mockAuthSession(overrides: Partial<ReturnType<typeof useAuthSession>> = {}) {
  useAuthSessionMock.mockReturnValue({
    isLoading: false,
    user: null,
    ...overrides,
  } as ReturnType<typeof useAuthSession>);
}

describe("ProfileGateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme();
    mockAuthSession();
  });

  it("Given gate render, When profile screen mounts, Then it reads theme and auth session", () => {
    render(<ProfileGateScreen />);

    expect(useAppThemeMock).toHaveBeenCalledTimes(1);
    expect(useAuthSessionMock).toHaveBeenCalledTimes(1);
  });

  it("Given loading auth session, When rendering gate screen, Then it shows themed loading indicator", () => {
    mockAuthSession({
      isLoading: true,
      user: null,
    });

    const { UNSAFE_getByType } = render(<ProfileGateScreen />);
    const loaderWrap = UNSAFE_getByType(View);
    const loader = UNSAFE_getByType(ActivityIndicator);

    expect(StyleSheet.flatten(loaderWrap.props.style)).toMatchObject({
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    });
    expect(loader.props.size).toBe("small");
    expect(loader.props.color).toBe(colors.textPrimary);
    expect(AuthScreenMock).not.toHaveBeenCalled();
    expect(UserProfileScreenMock).not.toHaveBeenCalled();
  });

  it("Given unauthenticated session, When gate finishes loading, Then it renders AuthScreen", () => {
    mockAuthSession({
      isLoading: false,
      user: null,
    });

    render(<ProfileGateScreen />);

    expect(AuthScreenMock).toHaveBeenCalledTimes(1);
    expect(UserProfileScreenMock).not.toHaveBeenCalled();
  });

  it("Given authenticated session, When gate finishes loading, Then it renders UserProfileScreen with user", () => {
    const user = {
      id: "user-1",
      email: "profile@example.com",
    } as NonNullable<ReturnType<typeof useAuthSession>["user"]>;

    mockAuthSession({
      isLoading: false,
      user,
    });

    render(<ProfileGateScreen />);

    expect(AuthScreenMock).not.toHaveBeenCalled();
    expect(UserProfileScreenMock).toHaveBeenCalledTimes(1);
    expect(UserProfileScreenMock.mock.calls[0]?.[0]).toEqual({
      user,
    });
  });
});
