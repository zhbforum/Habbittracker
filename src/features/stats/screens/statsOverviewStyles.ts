import type { ThemeColors } from "@shared/theme";

export function createStatsOverviewStyles(colors: ThemeColors) {
  return {
    headerBlock: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 29,
      lineHeight: 36,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    summaryRangeRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryRangeButton: {
      flex: 1,
      minHeight: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    summaryRangeButtonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    summaryRangeButtonText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    summaryRangeButtonTextActive: {
      color: colors.textPrimary,
    },
    summaryRangeMetaText: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    summaryCard: {
      flexBasis: "48%",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 84,
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "center",
      gap: 4,
    },
    summaryInlineValue: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    summaryValue: {
      color: colors.textPrimary,
      fontSize: 22,
      lineHeight: 28,
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    insightsRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    insightChip: {
      minHeight: 30,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    insightChipText: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    },
  } as const;
}
