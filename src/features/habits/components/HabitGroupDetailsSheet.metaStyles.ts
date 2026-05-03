import type { ThemeColors } from "@shared/theme";

export function createHabitGroupDetailsSheetMetaStyles(colors: ThemeColors) {
  return {
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
      gap: 6,
    },
    metaTitle: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    inlineMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaValue: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    metaSubtle: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
  } as const;
}
