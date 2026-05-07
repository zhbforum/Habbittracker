import { StyleSheet } from "react-native";

import { layout, type ThemeColors } from "@/shared/theme";
import { createHabitsScreenStyles } from "../HabitsScreen.styles";

type HabitsScreenStyleColors = Pick<
  ThemeColors,
  "background" | "border" | "surface" | "textPrimary" | "textSecondary"
>;

const colors: HabitsScreenStyleColors = {
  background: "#101010",
  border: "#222222",
  surface: "#181818",
  textPrimary: "#ffffff",
  textSecondary: "#a3a3a3",
};

function createStyles() {
  return createHabitsScreenStyles(colors as ThemeColors);
}

describe("createHabitsScreenStyles", () => {
  it("creates safe area and content layout styles", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.safeArea)).toMatchObject({
      flex: 1,
      backgroundColor: colors.background,
    });

    expect(StyleSheet.flatten(styles.content)).toMatchObject({
      flex: 1,
    });
  });

  it("creates scroll content spacing styles", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.scrollContent)).toMatchObject({
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 12,
      paddingBottom: 110,
      gap: 14,
    });
  });

  it("creates groups shell styles from theme colors", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.groupsShell)).toMatchObject({
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
    });
  });

  it("creates habits shell styles from theme colors", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.habitsShell)).toMatchObject({
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    });
  });

  it("creates habits shell header layout styles", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.habitsShellHeader)).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });
  });

  it("creates habits shell typography styles from theme colors", () => {
    const styles = createStyles();

    expect(StyleSheet.flatten(styles.habitsShellTitle)).toMatchObject({
      color: colors.textPrimary,
      fontSize: 26,
      lineHeight: 32,
    });

    expect(StyleSheet.flatten(styles.habitsShellSubtitle)).toMatchObject({
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    });
  });
});
