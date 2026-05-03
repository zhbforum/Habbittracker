import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

export function createHabitGroupSummaryCardStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 4,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    groupIdentityWrap: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      flex: 1,
    },
    groupIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    groupTitleWrap: {
      flex: 1,
    },
    groupName: {
      color: colors.textPrimary,
      fontSize: 19,
      lineHeight: 24,
    },
    groupDescription: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    phaseBadge: {
      minHeight: 26,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    phaseBadgeSuccess: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    phaseBadgeText: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    phaseBadgeTextSuccess: {
      color: colors.successText,
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    metricChip: {
      minHeight: 30,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metricChipText: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    progressCaption: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    progressPercent: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
    },
    progressTrack: {
      width: "100%",
      height: 10,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accentPrimary,
    },
    progressFillDone: {
      backgroundColor: colors.successText,
    },
    progressHint: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
