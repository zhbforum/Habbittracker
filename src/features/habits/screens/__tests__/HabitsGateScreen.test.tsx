import { ActivityIndicator, StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { AuthScreen } from "@features/auth";
import { useAuthSession } from "@/shared/auth";
import { useAppTheme } from "@/shared/theme";
import { HabitsScreen } from "../HabitsScreen";
import HabitsGateScreen from "../HabitsGateScreen";

jest.mock("@features/auth", () => ({
  AuthScreen: jest.fn(() => null),
}));

jest.mock("@/shared/auth", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../HabitsScreen", () => ({
  HabitsScreen: jest.fn(() => null),
}));

const useAuthSessionMock = jest.mocked(useAuthSession);
const useAppThemeMock = jest.mocked(useAppTheme);
const AuthScreenMock = jest.mocked(AuthScreen);
const HabitsScreenMock = jest.mocked(HabitsScreen);

const colors = {
  background: "#101010",
  textPrimary: "#ffffff",
};

function mockTheme() {
  useAppThemeMock.mockReturnValue({
    colors,
  } as ReturnType<typeof useAppTheme>);
}

function mockAuthSession(
  overrides: Partial<ReturnType<typeof useAuthSession>> = {},
) {
  useAuthSessionMock.mockReturnValue({
    isLoading: false,
    user: null,
    ...overrides,
  } as ReturnType<typeof useAuthSession>);
}

describe("HabitsGateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockTheme();
    mockAuthSession();
  });

  it("uses theme and auth session hooks", () => {
    render(<HabitsGateScreen />);

    expect(useAppThemeMock).toHaveBeenCalledTimes(1);
    expect(useAuthSessionMock).toHaveBeenCalledTimes(1);
  });

  it("renders centered loader while auth session is loading", () => {
    mockAuthSession({
      isLoading: true,
      user: null,
    });

    const { UNSAFE_getByType } = render(<HabitsGateScreen />);

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
    expect(HabitsScreenMock).not.toHaveBeenCalled();
  });

  it("renders AuthScreen when user is not authenticated", () => {
    mockAuthSession({
      isLoading: false,
      user: null,
    });

    render(<HabitsGateScreen />);

    expect(AuthScreenMock).toHaveBeenCalledTimes(1);
    expect(HabitsScreenMock).not.toHaveBeenCalled();
  });

  it("renders HabitsScreen with current user when authenticated", () => {
    const user = {
      id: "user-1",
      email: "test@example.com",
    } as NonNullable<ReturnType<typeof useAuthSession>["user"]>;

    mockAuthSession({
      isLoading: false,
      user,
    });

    render(<HabitsGateScreen />);

    expect(AuthScreenMock).not.toHaveBeenCalled();
    expect(HabitsScreenMock).toHaveBeenCalledTimes(1);
    expect(HabitsScreenMock.mock.calls[0]?.[0]).toEqual({
      user,
    });
  });
});
