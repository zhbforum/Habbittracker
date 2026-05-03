import { StyleSheet } from "react-native";

import { layout, type ThemeColors } from "@/shared/theme";

export function createHabitsScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      paddingBottom: 110,
      gap: 14,
    },
    groupsShell: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    habitsShell: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    habitsShellHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    habitsShellTitle: {
      color: colors.textPrimary,
      fontSize: 26,
      lineHeight: 32,
    },
    habitsShellSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  });
}
