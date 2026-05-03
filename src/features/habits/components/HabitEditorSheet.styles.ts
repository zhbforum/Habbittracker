import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

export function createHabitEditorSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    sheet: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    handle: {
      width: 46,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 10,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    formScroll: {
      flex: 1,
    },
    formContent: {
      paddingTop: 14,
      paddingBottom: 10,
      gap: 14,
    },
    errorBanner: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    errorBannerText: {
      color: colors.errorText,
      fontSize: 13,
      lineHeight: 18,
    },
    fieldLabel: {
      marginBottom: 8,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    input: {
      minHeight: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    goalInputsRow: {
      flexDirection: "row",
      gap: 10,
    },
    goalInputColumn: {
      flex: 1,
    },
    actionsRow: {
      marginTop: 8,
      paddingTop: 8,
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}

export type HabitEditorSheetStyles = ReturnType<typeof createHabitEditorSheetStyles>;
