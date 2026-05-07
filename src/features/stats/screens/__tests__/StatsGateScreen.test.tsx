import { ActivityIndicator, StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { AuthScreen } from "@features/auth";
import { useAuthSession } from "@/shared/auth";
import { useAppTheme } from "@/shared/theme";
import StatsScreen from "../StatsScreen";
import StatsGateScreen from "../StatsGateScreen";

jest.mock("@features/auth", () => ({
  AuthScreen: jest.fn(() => null),
}));

jest.mock("@/shared/auth", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../StatsScreen", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const useAuthSessionMock = jest.mocked(useAuthSession);
const useAppThemeMock = jest.mocked(useAppTheme);
const AuthScreenMock = jest.mocked(AuthScreen);
const StatsScreenMock = jest.mocked(StatsScreen);

const colors = {
  background: "#141414",
  textPrimary: "#f1f1f1",
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

describe("StatsGateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme();
    mockAuthSession();
  });

  it("Given screen mount, When rendering gate screen, Then it reads theme and auth session state once", () => {
    render(<StatsGateScreen />);

    expect(useAppThemeMock).toHaveBeenCalledTimes(1);
    expect(useAuthSessionMock).toHaveBeenCalledTimes(1);
  });

  it("Given loading auth session, When rendering gate screen, Then it shows centered loader with themed colors", () => {
    mockAuthSession({
      isLoading: true,
      user: null,
    });

    const { UNSAFE_getByType } = render(<StatsGateScreen />);
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
    expect(StatsScreenMock).not.toHaveBeenCalled();
  });

  it("Given missing user, When auth loading is finished, Then it renders AuthScreen", () => {
    mockAuthSession({
      isLoading: false,
      user: null,
    });

    render(<StatsGateScreen />);

    expect(AuthScreenMock).toHaveBeenCalledTimes(1);
    expect(StatsScreenMock).not.toHaveBeenCalled();
  });

  it("Given authenticated user, When auth loading is finished, Then it renders StatsScreen with current user", () => {
    const user = {
      id: "user-1",
      email: "stats@example.com",
    } as NonNullable<ReturnType<typeof useAuthSession>["user"]>;

    mockAuthSession({
      isLoading: false,
      user,
    });

    render(<StatsGateScreen />);

    expect(AuthScreenMock).not.toHaveBeenCalled();
    expect(StatsScreenMock).toHaveBeenCalledTimes(1);
    expect(StatsScreenMock.mock.calls[0]?.[0]).toEqual({
      user,
    });
  });
});
