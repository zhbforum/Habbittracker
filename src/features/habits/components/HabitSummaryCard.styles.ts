import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

export function createHabitSummaryCardStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 12,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    cardPressable: {
      gap: 12,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    identityTextWrap: {
      flex: 1,
    },
    habitName: {
      color: colors.textPrimary,
      fontSize: 19,
      lineHeight: 24,
    },
    metaText: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    metaChip: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaChipLabel: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    metaChipValue: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
    },
    completeButton: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    completeButtonDone: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    completeButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    completeButtonTextDone: {
      color: colors.successText,
    },
  });
}
