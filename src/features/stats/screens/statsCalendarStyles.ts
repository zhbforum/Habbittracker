import type { ThemeColors } from "@shared/theme";

export function createStatsCalendarStyles(colors: ThemeColors) {
  return {
    calendarCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    calendarHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    monthNavButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabelWrap: {
      flex: 1,
      alignItems: "center",
      gap: 5,
    },
    monthTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
    todayButton: {
      minHeight: 28,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    todayButtonText: {
      color: colors.accentText,
      fontSize: 12,
      lineHeight: 16,
    },
    monthContentWrap: {
      gap: 10,
    },
    weekdayRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    weekdayLabel: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    calendarGrid: {
      gap: 6,
    },
    weekRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dayCell: {
      flex: 1,
      minHeight: 54,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    dayCellOutsideMonth: {
      opacity: 0.46,
    },
    dayCellToday: {
      borderColor: colors.accentText,
    },
    dayCellSelected: {
      backgroundColor: colors.accentSecondary,
      borderColor: colors.accentText,
    },
    dayLabel: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 16,
    },
    dayLabelOutsideMonth: {
      color: colors.textMuted,
    },
    dayLabelSelected: {
      color: colors.textPrimary,
    },
    dayMarksRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      minHeight: 10,
    },
    dayMarkDot: {
      width: 7,
      height: 7,
      borderRadius: 99,
    },
    dayMarkRing: {
      width: 7,
      height: 7,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: colors.textMuted,
      backgroundColor: "transparent",
    },
    dayMarkRingDone: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentText,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 2,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
    },
  } as const;
}
