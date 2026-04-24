import { StyleSheet } from "react-native";

import { layout, type ThemeColors } from "@/shared/theme";

export function createUserProfileScreenStyles(colors: ThemeColors) {
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
      paddingBottom: 28,
      gap: 14,
    },
    errorBanner: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    errorBannerText: {
      color: colors.errorText,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
