import { layout, type ThemeColors } from "@shared/theme";

import { createHomeBaseStyles } from "../homeBaseStyles";

const colors = {
  background: "#111111",
  textPrimary: "#222222",
  textSecondary: "#333333",
  border: "#444444",
  accentPrimary: "#555555",
  cardShadow: "#666666",
} as unknown as ThemeColors;

describe("createHomeBaseStyles", () => {
  it("returns the full style contract used by the home screen base layout", () => {
    const styles = createHomeBaseStyles(colors);

    expect(Object.keys(styles).sort()).toEqual(
      [
        "safeArea",
        "content",
        "scrollContent",
        "header",
        "headerTextWrap",
        "title",
        "subtitle",
        "fab",
      ].sort(),
    );
  });

  it("maps theme colors to screen background, text and floating action button", () => {
    const styles = createHomeBaseStyles(colors);

    expect(styles.safeArea).toMatchObject({
      backgroundColor: colors.background,
    });

    expect(styles.title).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.subtitle).toMatchObject({
      color: colors.textSecondary,
    });

    expect(styles.fab).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      shadowColor: colors.cardShadow,
    });
  });

  it("keeps the root screen layout stable", () => {
    const styles = createHomeBaseStyles(colors);

    expect(styles.safeArea).toMatchObject({
      flex: 1,
    });

    expect(styles.content).toMatchObject({
      flex: 1,
    });

    expect(styles.header).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    });

    expect(styles.headerTextWrap).toMatchObject({
      flex: 1,
    });
  });

  it("uses shared layout tokens for scroll content spacing and max width", () => {
    const styles = createHomeBaseStyles(colors);

    expect(styles.scrollContent).toMatchObject({
      width: "100%",
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 18,
      paddingBottom: 120,
      alignSelf: "center",
      maxWidth: layout.maxContentWidth,
      gap: 14,
    });
  });

  it("keeps home title typography stable", () => {
    const styles = createHomeBaseStyles(colors);

    expect(styles.title).toMatchObject({
      fontSize: 36,
      lineHeight: 46,
    });

    expect(styles.subtitle).toMatchObject({
      marginTop: 6,
      fontSize: 16,
      lineHeight: 22,
    });
  });

  it("keeps the floating action button anchored and visually consistent", () => {
    const styles = createHomeBaseStyles(colors);

    expect(styles.fab).toMatchObject({
      position: "absolute",
      right: layout.horizontalPadding,
      bottom: 18,
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 1,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
