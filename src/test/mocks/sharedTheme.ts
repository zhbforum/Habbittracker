type SharedThemeModule = typeof import("@/shared/theme");

export function createSharedThemeMock(): SharedThemeModule {
  const actualTheme = jest.requireActual("@/shared/theme") as SharedThemeModule;

  return {
    ...actualTheme,
    useAppTheme: () => ({
      mode: "light",
      colors: actualTheme.lightColors,
      isDark: false,
      setMode: jest.fn(),
    }),
  };
}
