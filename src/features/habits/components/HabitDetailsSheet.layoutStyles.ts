import type { ThemeColors } from "@shared/theme";

export function createHabitDetailsSheetLayoutStyles(colors: ThemeColors) {
  return {
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(8, 14, 28, 0.46)",
    },
    sheet: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      maxHeight: "92%",
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    handle: {
      width: 46,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 10,
    },
    content: {
      gap: 12,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    identityWrap: {
      flex: 1,
    },
    habitName: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    metaLine: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    metaGrid: {
      flexDirection: "row",
      gap: 10,
    },
    metaCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    metaTitle: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    metaValue: {
      marginTop: 6,
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    streakRow: {
      flexDirection: "row",
      gap: 10,
    },
    streakCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    streakLabel: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
    },
    streakValue: {
      marginTop: 6,
      color: colors.textPrimary,
      fontSize: 26,
      lineHeight: 32,
    },
  } as const;
}
