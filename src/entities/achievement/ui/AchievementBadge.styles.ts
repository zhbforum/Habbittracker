import { StyleSheet } from "react-native";

import type { ThemeColors } from "@/shared/theme";

export function createAchievementBadgeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexBasis: "48%",
      minHeight: 112,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    },
    cardLocked: {
      opacity: 0.72,
    },
    iconFrame: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 17,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
    progressLabel: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
    },
  });
}
