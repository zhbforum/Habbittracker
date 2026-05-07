import { createAchievementsExplorerSheetStyles } from "../AchievementsExplorerSheet.styles";

describe("createAchievementsExplorerSheetStyles", () => {
  it("Given colors and bottom inset padding, When creating sheet styles, Then layout reflects theme tokens and computed padding", () => {
    const colors = {
      border: "#d2d2d2",
      surface: "#ffffff",
      textPrimary: "#111111",
      textSecondary: "#6a6a6a",
      surfaceSecondary: "#f3f3f3",
      accentText: "#46c593",
      accentSecondary: "#dff7ec",
    };

    const styles = createAchievementsExplorerSheetStyles(colors as never, 28);

    expect(styles.overlay.backgroundColor).toBe("rgba(8, 14, 28, 0.42)");
    expect(styles.sheet.borderColor).toBe(colors.border);
    expect(styles.sheet.paddingBottom).toBe(28);
    expect(styles.filterButtonActive.backgroundColor).toBe(colors.accentSecondary);
    expect(styles.filterButtonTextActive.color).toBe(colors.textPrimary);
  });
});
