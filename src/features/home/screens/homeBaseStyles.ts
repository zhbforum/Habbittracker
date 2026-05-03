import { layout, type ThemeColors } from "@shared/theme";

export function createHomeBaseStyles(colors: ThemeColors) {
  return {
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      width: "100%",
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 18,
      paddingBottom: 120,
      alignSelf: "center",
      maxWidth: layout.maxContentWidth,
      gap: 14,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    headerTextWrap: {
      flex: 1,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 36,
      lineHeight: 46,
    },
    subtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    fab: {
      position: "absolute",
      right: layout.horizontalPadding,
      bottom: 18,
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  } as const;
}
