import type { ThemeColors } from "@shared/theme";

export function createHabitGroupDetailsSheetMemberStyles(colors: ThemeColors) {
  return {
    memberSection: {
      gap: 8,
    },
    memberTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 21,
    },
    emptyMemberCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    emptyMemberText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    memberCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      minHeight: 52,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    memberIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    memberIdentityWrap: {
      flex: 1,
    },
    memberName: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    memberMeta: {
      marginTop: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
  } as const;
}
