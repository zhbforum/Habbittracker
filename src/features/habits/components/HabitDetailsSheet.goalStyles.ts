import type { ThemeColors } from "@shared/theme";

export function createHabitDetailsSheetGoalStyles(colors: ThemeColors) {
  return {
    goalCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    goalHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    goalTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    goalCaption: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    goalProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    goalProgressValue: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 18,
    },
    goalProgressPercent: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    goalProgressTrack: {
      width: "100%",
      height: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.surface,
    },
    goalProgressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accentPrimary,
    },
    progressButton: {
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    progressButtonDone: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    progressButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    progressButtonTextDone: {
      color: colors.successText,
    },
  } as const;
}
