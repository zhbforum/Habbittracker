import { StyleSheet } from "react-native";

import type { ThemeColors } from "@/shared/theme";

export function createActivityHeatmapStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 21,
    },
    hint: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
    },
    scrollContent: {
      paddingRight: 8,
    },
    weeksRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 4,
    },
    weekColumn: {
      gap: 4,
      alignItems: "center",
    },
    monthLabelWrap: {
      minHeight: 14,
      justifyContent: "center",
    },
    monthLabel: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 13,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cell: {
      width: 14,
      height: 14,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    cellToday: {
      borderColor: colors.accentText,
    },
    cellSelected: {
      borderColor: colors.textPrimary,
      borderWidth: 1.5,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    legendDotsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
    },
  });
}
