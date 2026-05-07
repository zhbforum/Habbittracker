import { ActivityIndicator, StyleSheet } from "react-native";
import { render } from "@testing-library/react-native";
import type { User } from "@supabase/supabase-js";

import HomeGateScreen from "../HomeGateScreen";

const mockColors = {
  background: "#111111",
  textPrimary: "#222222",
} as const;

const mockUser = {
  id: "user-1",
  email: "alex@example.com",
} as User;

const mockUseAppTheme = jest.fn();
const mockUseAuthSession = jest.fn();

const mockAuthScreen = jest.fn();
const mockHomeScreen = jest.fn();

jest.mock("@/shared/theme", () => ({
  useAppTheme: () => mockUseAppTheme(),
}));

jest.mock("@/shared/auth", () => ({
  useAuthSession: () => mockUseAuthSession(),
}));

jest.mock("@features/auth", () => ({
  AuthScreen: (props: unknown) => {
    mockAuthScreen(props);
    return null;
  },
}));

jest.mock("../HomeScreen", () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockHomeScreen(props);
    return null;
  },
}));

describe("HomeGateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAppTheme.mockReturnValue({
      colors: mockColors,
    });

    mockUseAuthSession.mockReturnValue({
      isLoading: false,
      user: mockUser,
    });
  });

  it("uses app theme and auth session state", () => {
    render(<HomeGateScreen />);

    expect(mockUseAppTheme).toHaveBeenCalledTimes(1);
    expect(mockUseAuthSession).toHaveBeenCalledTimes(1);
  });

  it("creates loader styles from theme colors", () => {
    mockUseAuthSession.mockReturnValue({
      isLoading: true,
      user: null,
    });

    const createSpy = jest.spyOn(StyleSheet, "create");

    render(<HomeGateScreen />);

    expect(createSpy).toHaveBeenCalledWith({
      loaderWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mockColors.background,
      },
    });

    createSpy.mockRestore();
  });

  it("renders loading indicator while auth session is loading", () => {
    mockUseAuthSession.mockReturnValue({
      isLoading: true,
      user: null,
    });

    const { UNSAFE_getByType } = render(<HomeGateScreen />);

    const loader = UNSAFE_getByType(ActivityIndicator);

    expect(loader.props.size).toBe("small");
    expect(loader.props.color).toBe(mockColors.textPrimary);

    expect(mockAuthScreen).not.toHaveBeenCalled();
    expect(mockHomeScreen).not.toHaveBeenCalled();
  });

  it("renders AuthScreen when auth session is resolved without user", () => {
    mockUseAuthSession.mockReturnValue({
      isLoading: false,
      user: null,
    });

    render(<HomeGateScreen />);

    expect(mockAuthScreen).toHaveBeenCalledTimes(1);
    expect(mockHomeScreen).not.toHaveBeenCalled();
  });

  it("renders HomeScreen with user when auth session has user", () => {
    mockUseAuthSession.mockReturnValue({
      isLoading: false,
      user: mockUser,
    });

    render(<HomeGateScreen />);

    expect(mockHomeScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUser,
      }),
    );

    expect(mockAuthScreen).not.toHaveBeenCalled();
  });
});