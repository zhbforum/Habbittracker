import type { ThemeColors } from "@shared/theme";

export function createHabitGroupEditorSheetGoalStyles(colors: ThemeColors) {
  return {
    goalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    goalStepButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    goalValueCard: {
      flex: 1,
      minHeight: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    goalValue: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    goalHint: {
      marginTop: 1,
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
    },
    goalInfo: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
  } as const;
}
