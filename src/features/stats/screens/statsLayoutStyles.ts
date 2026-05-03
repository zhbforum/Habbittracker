import { layout, type ThemeColors } from "@shared/theme";

export function createStatsLayoutStyles(colors: ThemeColors) {
  return {
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 12,
      paddingBottom: 120,
      gap: 12,
    },
    errorBanner: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 8,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 13,
      lineHeight: 18,
    },
    retryButton: {
      alignSelf: "flex-start",
      minHeight: 30,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    retryButtonText: {
      color: colors.errorText,
      fontSize: 12,
      lineHeight: 16,
    },
  } as const;
}
