import { render } from "@testing-library/react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { lightColors, useAppTheme } from "@/shared/theme";
import AuthCallbackScreen from "../callback";

jest.mock("@/shared/theme", () => {
  const actualTheme = jest.requireActual("@/shared/theme");

  return {
    ...actualTheme,
    useAppTheme: jest.fn(),
  };
});

const useAppThemeMock = useAppTheme as jest.MockedFunction<typeof useAppTheme>;

function createThemeState(overrides: Partial<typeof lightColors> = {}) {
  return {
    mode: "light" as const,
    isDark: false,
    colors: {
      ...lightColors,
      ...overrides,
    },
    setMode: jest.fn(),
  };
}

describe("AuthCallbackScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given themed colors, When rendering callback screen, Then it shows centered loader with theme-based styles", () => {
    useAppThemeMock.mockReturnValue(
      createThemeState({
        background: "#0b1020",
        textPrimary: "#f1f5f9",
      }),
    );

    const { UNSAFE_getByType } = render(<AuthCallbackScreen />);

    const loader = UNSAFE_getByType(ActivityIndicator);
    const container = UNSAFE_getByType(View);
    const containerStyle = StyleSheet.flatten(container.props.style);

    expect(loader.props.size).toBe("small");
    expect(loader.props.color).toBe("#f1f5f9");
    expect(containerStyle).toEqual(
      expect.objectContaining({
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b1020",
      }),
    );
  });

  it("Given theme changes, When callback screen rerenders, Then loader and background use updated colors", () => {
    useAppThemeMock
      .mockReturnValueOnce(
        createThemeState({
          background: "#111827",
          textPrimary: "#34d399",
        }),
      )
      .mockReturnValueOnce(
        createThemeState({
          background: "#f9fafb",
          textPrimary: "#1d4ed8",
        }),
      );

    const { UNSAFE_getByType, rerender } = render(<AuthCallbackScreen />);

    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBe("#34d399");
    expect(StyleSheet.flatten(UNSAFE_getByType(View).props.style).backgroundColor).toBe(
      "#111827",
    );

    rerender(<AuthCallbackScreen />);

    expect(UNSAFE_getByType(ActivityIndicator).props.color).toBe("#1d4ed8");
    expect(StyleSheet.flatten(UNSAFE_getByType(View).props.style).backgroundColor).toBe(
      "#f9fafb",
    );
    expect(useAppThemeMock).toHaveBeenCalledTimes(2);
  });
});
