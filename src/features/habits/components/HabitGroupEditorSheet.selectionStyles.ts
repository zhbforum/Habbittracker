import type { ThemeColors } from "@shared/theme";

export function createHabitGroupEditorSheetSelectionStyles(colors: ThemeColors) {
  return {
    habitsSelectionWrap: {
      gap: 8,
    },
    noHabitsCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      minHeight: 66,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    noHabitsText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
    habitSelectCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      minHeight: 56,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    habitSelectCardActive: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    habitIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    habitIdentityWrap: {
      flex: 1,
    },
    habitName: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    habitMeta: {
      marginTop: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    checkWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    checkWrapActive: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
  } as const;
}
