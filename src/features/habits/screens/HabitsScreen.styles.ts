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
  });
}
