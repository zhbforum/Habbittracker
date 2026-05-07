import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHomeHabitsStyles } from "../homeHabitsStyles";

const colors = {
  textPrimary: "#111111",
  textSecondary: "#222222",
  textMuted: "#333333",
  accentText: "#444444",

  border: "#555555",
  surface: "#666666",
  surfaceSecondary: "#777777",
  cardShadow: "#888888",

  errorBorder: "#990000",
  errorSurface: "#ffeeee",
  errorText: "#cc0000",

  successBorder: "#009900",
  successSurface: "#eeffee",
} as unknown as ThemeColors;

describe("createHomeHabitsStyles", () => {
  it("returns the full style contract used by the home habits section", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(Object.keys(styles).sort()).toEqual(
      [
        "sectionHeader",
        "sectionTitle",
        "sectionAction",
        "errorBanner",
        "errorBannerText",
        "retryButton",
        "retryButtonText",
        "loaderCard",
        "loaderText",
        "emptyCard",
        "emptyTitle",
        "emptySubtitle",
        "emptyActionButton",
        "emptyActionText",
        "listWrap",
        "habitCard",
        "habitCardGlow",
        "habitMainPress",
        "habitIconWrap",
        "habitIdentityWrap",
        "habitName",
        "streakWrap",
        "streakText",
        "habitGoalText",
        "completeCircle",
        "completeCircleDone",
      ].sort(),
    );
  });

  it("maps theme colors to section header, loading and empty states", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(styles.sectionTitle).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.sectionAction).toMatchObject({
      color: colors.accentText,
    });

    expect(styles.loaderCard).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surface,
    });

    expect(styles.loaderText).toMatchObject({
      color: colors.textSecondary,
    });

    expect(styles.emptyCard).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surface,
    });

    expect(styles.emptyTitle).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.emptySubtitle).toMatchObject({
      color: colors.textSecondary,
    });

    expect(styles.emptyActionButton).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    });

    expect(styles.emptyActionText).toMatchObject({
      color: colors.textPrimary,
    });
  });

  it("maps error colors to the error banner and retry action", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(styles.errorBanner).toMatchObject({
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
    });

    expect(styles.errorBannerText).toMatchObject({
      color: colors.errorText,
    });

    expect(styles.retryButton).toMatchObject({
      borderColor: colors.errorBorder,
      backgroundColor: colors.surface,
    });

    expect(styles.retryButtonText).toMatchObject({
      color: colors.errorText,
    });
  });

  it("keeps the habits list and habit card layout stable", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(styles.sectionHeader).toMatchObject({
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });

    expect(styles.listWrap).toMatchObject({
      gap: 12,
    });

    expect(styles.habitCard).toMatchObject({
      position: "relative",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: colors.cardShadow,
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 4,
    });

    expect(styles.habitMainPress).toMatchObject({
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    });

    expect(styles.habitIdentityWrap).toMatchObject({
      flex: 1,
      gap: 3,
    });
  });

  it("keeps habit identity, icon and completion styles consistent", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(styles.habitIconWrap).toMatchObject({
      width: 56,
      height: 56,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.habitName).toMatchObject({
      color: colors.textPrimary,
      fontSize: 20,
      lineHeight: 26,
    });

    expect(styles.streakWrap).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    });

    expect(styles.streakText).toMatchObject({
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 18,
    });

    expect(styles.habitGoalText).toMatchObject({
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    });

    expect(styles.completeCircle).toMatchObject({
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.completeCircleDone).toMatchObject({
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    });
  });

  it("configures the habit card glow as a hidden absolute success overlay", () => {
    const styles = createHomeHabitsStyles(colors);

    expect(styles.habitCardGlow).toMatchObject({
      ...StyleSheet.absoluteFillObject,
      borderRadius: 18,
      backgroundColor: colors.successSurface,
      opacity: 0,
    });
  });
});