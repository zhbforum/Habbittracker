import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { darkColors, lightColors, type ThemeColors, type ThemeMode } from "./colors";

const THEME_MODE_STORAGE_KEY = "habbittracker.theme.mode";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getColorsByMode(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? darkColors : lightColors;
}

async function persistThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {
    // Theme persistence is optional and should never block UX.
  }
}

async function readStoredThemeMode(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

async function syncSystemBackgroundColor(mode: ThemeMode): Promise<void> {
  try {
    await SystemUI.setBackgroundColorAsync(getColorsByMode(mode).background);
  } catch {
    // System background sync is best-effort.
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    void readStoredThemeMode().then((storedMode) => {
      if (storedMode) {
        setModeState(storedMode);
      }
    });
  }, []);

  useEffect(() => {
    void syncSystemBackgroundColor(mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void persistThemeMode(nextMode);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = getColorsByMode(mode);

    return {
      mode,
      colors,
      isDark: mode === "dark",
      setMode,
    };
  }, [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return context;
}

