import { StyleSheet } from "react-native";

import { layout, type ThemeColors } from "@/shared/theme";

export function createAuthScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 8,
      paddingBottom: 24,
    },
    panel: {
      width: "100%",
      maxWidth: layout.maxContentWidth,
      alignSelf: "center",
    },
    signUpPanel: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 14,
    },
    oauthRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
}
