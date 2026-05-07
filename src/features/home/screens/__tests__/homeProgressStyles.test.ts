import type { ThemeColors } from "@shared/theme";

import { createHomeProgressStyles } from "../homeProgressStyles";

const colors = {
  border: "#111111",
  surface: "#222222",
  surfaceSecondary: "#333333",
  cardShadow: "#444444",
  textPrimary: "#555555",
  textSecondary: "#666666",
  accentPrimary: "#777777",
} as unknown as ThemeColors;

describe("createHomeProgressStyles", () => {
  it("returns the full style contract used by the home progress card", () => {
    const styles = createHomeProgressStyles(colors);

    expect(Object.keys(styles).sort()).toEqual(
      [
        "progressCard",
        "progressHeaderRow",
        "progressTitle",
        "progressMeta",
        "progressIconWrap",
        "progressIconAuraOuter",
        "progressIconAuraInner",
        "progressStatusRow",
        "progressMessage",
        "progressPercent",
        "progressTrack",
        "progressFill",
      ].sort(),
    );
  });

  it("maps theme colors to card, text and progress elements", () => {
    const styles = createHomeProgressStyles(colors);

    expect(styles.progressCard).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surface,
      shadowColor: colors.cardShadow,
    });

    expect(styles.progressTitle).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.progressMeta).toMatchObject({
      color: colors.textSecondary,
    });

    expect(styles.progressMessage).toMatchObject({
      color: colors.textSecondary,
    });

    expect(styles.progressPercent).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.progressIconWrap).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
    });

    expect(styles.progressTrack).toMatchObject({
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
    });

    expect(styles.progressFill).toMatchObject({
      backgroundColor: colors.accentPrimary,
    });
  });

  it("keeps the progress card layout and progress bar geometry stable", () => {
    const styles = createHomeProgressStyles(colors);

    expect(styles.progressCard).toMatchObject({
      marginTop: 4,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      elevation: 6,
    });

    expect(styles.progressHeaderRow).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    });

    expect(styles.progressStatusRow).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    });

    expect(styles.progressTrack).toMatchObject({
      height: 14,
      width: "100%",
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
    });

    expect(styles.progressFill).toMatchObject({
      height: "100%",
      borderRadius: 999,
      width: 0,
    });
  });

  it("configures the progress icon aura as a hidden overlay by default", () => {
    const styles = createHomeProgressStyles(colors);

    expect(styles.progressIconWrap).toMatchObject({
      position: "relative",
      width: 50,
      height: 50,
      borderRadius: 25,
      overflow: "visible",
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.progressIconAuraOuter).toMatchObject({
      position: "absolute",
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 27,
      backgroundColor: "#F3A73B14",
      shadowColor: "#F3A73B",
      shadowOpacity: 0.28,
      shadowRadius: 9,
      elevation: 5,
      opacity: 0,
    });

    expect(styles.progressIconAuraInner).toMatchObject({
      position: "absolute",
      top: 8,
      left: 8,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#F3A73B24",
      opacity: 0,
    });
  });
});
