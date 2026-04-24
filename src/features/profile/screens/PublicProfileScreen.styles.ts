import { StyleSheet } from "react-native";

import { layout, type ThemeColors } from "@/shared/theme";

export function createPublicProfileScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 12,
      paddingBottom: 22,
      gap: 14,
    },
  });
}
