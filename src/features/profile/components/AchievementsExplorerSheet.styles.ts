import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

export function createAchievementsExplorerSheetStyles(
  colors: ThemeColors,
  sheetBottomPadding: number,
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(8, 14, 28, 0.42)",
    },
    sheet: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingBottom: sheetBottomPadding,
      height: "90%",
      gap: 12,
    },
    handle: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 4,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    headerTextWrap: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    filtersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    filterButton: {
      flex: 1,
      minHeight: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    filterButtonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    filterButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    filterButtonTextActive: {
      color: colors.textPrimary,
    },
    scrollWrap: {
      flex: 1,
      minHeight: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: 16,
    },
  });
}
