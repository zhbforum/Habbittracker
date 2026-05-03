import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

export function createProfileThemeSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(8, 14, 28, 0.46)",
      paddingHorizontal: 20,
    },
    sheet: {
      width: "100%",
      maxWidth: 440,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    menuSection: {
      marginTop: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      overflow: "hidden",
    },
    menuRow: {
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    menuRowTextWrap: {
      flex: 1,
    },
    menuRowTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    menuRowCaption: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionTitle: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    optionsList: {
      marginTop: 10,
      gap: 10,
    },
    optionCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    optionCardActive: {
      borderColor: colors.accentText,
    },
    optionTextWrap: {
      flex: 1,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    optionCaption: {
      marginTop: 4,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    signOutButton: {
      marginTop: 18,
      borderRadius: 12,
      backgroundColor: "#C54D4D",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    signOutButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 22,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}

export type ProfileThemeSheetStyles = ReturnType<typeof createProfileThemeSheetStyles>;
