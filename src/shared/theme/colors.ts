export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textPlaceholder: string;
  accentPrimary: string;
  accentSecondary: string;
  accentText: string;
  border: string;
  cardShadow: string;
  successSurface: string;
  successBorder: string;
  successText: string;
  errorSurface: string;
  errorBorder: string;
  errorText: string;
};

export const lightColors: ThemeColors = {
  background: "#F4FAF1",
  surface: "#FFFFFF",
  surfaceSecondary: "#EAF5E5",
  textPrimary: "#1A2F1F",
  textSecondary: "#426046",
  textMuted: "#68816B",
  textPlaceholder: "#8AA18C",
  accentPrimary: "#BDE88B",
  accentSecondary: "#DDF3C2",
  accentText: "#2F7A3E",
  border: "#CFE4C8",
  cardShadow: "rgba(32, 64, 36, 0.08)",
  successSurface: "#E5F7DA",
  successBorder: "#9FD08C",
  successText: "#246938",
  errorSurface: "#FFEFEA",
  errorBorder: "#F2C2B7",
  errorText: "#A93A2F",
};

export const darkColors: ThemeColors = {
  background: "#0D131E",
  surface: "#161F2D",
  surfaceSecondary: "#202B3D",
  textPrimary: "#E7EEF8",
  textSecondary: "#AAB8CC",
  textMuted: "#7D8AA0",
  textPlaceholder: "#68778F",
  accentPrimary: "#4F7C5A",
  accentSecondary: "#284336",
  accentText: "#9ED1AB",
  border: "#2D3C55",
  cardShadow: "rgba(0, 0, 0, 0.28)",
  successSurface: "#153326",
  successBorder: "#2B694B",
  successText: "#A4E5B9",
  errorSurface: "#3A1E22",
  errorBorder: "#7F3A41",
  errorText: "#FFB4BA",
};

export const colors = lightColors;
