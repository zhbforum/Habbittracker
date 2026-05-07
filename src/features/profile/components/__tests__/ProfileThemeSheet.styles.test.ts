import { createProfileThemeSheetStyles } from "../ProfileThemeSheet.styles";

describe("createProfileThemeSheetStyles", () => {
  it("Given theme colors, When creating profile theme sheet styles, Then it maps key colors into style tokens", () => {
    const colors = {
      border: "#cccccc",
      surface: "#ffffff",
      cardShadow: "#101010",
      textPrimary: "#111111",
      surfaceSecondary: "#f3f3f3",
      textSecondary: "#676767",
      textMuted: "#8a8a8a",
      accentText: "#42bf8b",
    };

    const styles = createProfileThemeSheetStyles(colors as never);

    expect(styles.overlay.backgroundColor).toBe("rgba(8, 14, 28, 0.46)");
    expect(styles.sheet.borderColor).toBe(colors.border);
    expect(styles.sheet.backgroundColor).toBe(colors.surface);
    expect(styles.optionCardActive.borderColor).toBe(colors.accentText);
    expect(styles.signOutButton.backgroundColor).toBe("#C54D4D");
  });
});
