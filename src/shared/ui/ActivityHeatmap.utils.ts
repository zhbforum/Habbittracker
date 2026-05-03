import type { ThemeColors } from "@/shared/theme";

export function getActivityHeatmapIntensityColor(
  level: 0 | 1 | 2 | 3,
  colors: ThemeColors,
): string {
  if (level === 3) {
    return colors.successText;
  }

  if (level === 2) {
    return colors.accentText;
  }

  if (level === 1) {
    return colors.textMuted;
  }

  return "transparent";
}
