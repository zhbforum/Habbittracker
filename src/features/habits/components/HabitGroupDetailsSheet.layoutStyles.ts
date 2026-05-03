import type { ThemeColors } from "@shared/theme";

export function createHabitGroupDetailsSheetLayoutStyles(colors: ThemeColors) {
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
    groupIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    groupIdentityWrap: {
      flex: 1,
    },
    groupName: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    groupDescription: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    progressLabel: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    progressHint: {
      color: colors.textSecondary,
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
    createdLabel: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    actionsRow: {
      marginTop: 8,
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 46,
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
    dangerButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerButtonText: {
      color: colors.errorText,
      fontSize: 15,
      lineHeight: 20,
    },
  } as const;
}
