import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import { Pressable, Text } from "react-native";

import { darkColors, lightColors } from "../colors";
import { ThemeProvider, useAppTheme } from "../provider";

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}));

const setBackgroundColorAsyncMock = jest.mocked(SystemUI.setBackgroundColorAsync);
const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

function ThemeProbe() {
  const { mode, colors, isDark, setMode } = useAppTheme();

  return (
    <>
      <Text testID="theme-mode">{mode}</Text>
      <Text testID="theme-background">{colors.background}</Text>
      <Text testID="theme-is-dark">{String(isDark)}</Text>
      <Pressable onPress={() => setMode("dark")}>
        <Text>set-dark</Text>
      </Pressable>
      <Pressable onPress={() => setMode("light")}>
        <Text>set-light</Text>
      </Pressable>
    </>
  );
}

describe("ThemeProvider / useAppTheme", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when useAppTheme is used outside ThemeProvider", () => {
    expect(() => render(<ThemeProbe />)).toThrow("useAppTheme must be used inside ThemeProvider");
  });

  it("starts with light mode and syncs system background", async () => {
    getItemMock.mockResolvedValueOnce(null);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-mode").props.children).toBe("light");
    expect(screen.getByTestId("theme-background").props.children).toBe(lightColors.background);
    expect(screen.getByTestId("theme-is-dark").props.children).toBe("false");

    await waitFor(() => {
      expect(setBackgroundColorAsyncMock).toHaveBeenCalledWith(lightColors.background);
    });
  });

  it("hydrates dark mode from storage", async () => {
    getItemMock.mockResolvedValueOnce("dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme-mode").props.children).toBe("dark");
    });

    expect(screen.getByTestId("theme-background").props.children).toBe(darkColors.background);
    expect(screen.getByTestId("theme-is-dark").props.children).toBe("true");
    expect(setBackgroundColorAsyncMock).toHaveBeenLastCalledWith(darkColors.background);
  });

  it("updates mode and persists selection", async () => {
    getItemMock.mockResolvedValueOnce(null);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByText("set-dark"));

    await waitFor(() => {
      expect(screen.getByTestId("theme-mode").props.children).toBe("dark");
    });

    expect(setItemMock).toHaveBeenCalledWith("habbittracker.theme.mode", "dark");
    expect(setBackgroundColorAsyncMock).toHaveBeenLastCalledWith(darkColors.background);
  });
});
