import { StyleSheet } from "react-native";

import { lightColors } from "@/shared/theme/colors";
import { createAchievementBadgeStyles } from "../AchievementBadge.styles";

describe("createAchievementBadgeStyles", () => {
  it("Given theme colors, When creating badge styles, Then it maps card and typography style contract", () => {
    const styles = createAchievementBadgeStyles(lightColors);

    expect(StyleSheet.flatten(styles.card)).toEqual(
      expect.objectContaining({
        borderColor: lightColors.border,
        backgroundColor: lightColors.surface,
      }),
    );
    expect(StyleSheet.flatten(styles.cardLocked)).toEqual(
      expect.objectContaining({
        opacity: 0.72,
      }),
    );
    expect(StyleSheet.flatten(styles.title)).toEqual(
      expect.objectContaining({
        color: lightColors.textPrimary,
      }),
    );
    expect(StyleSheet.flatten(styles.description)).toEqual(
      expect.objectContaining({
        color: lightColors.textSecondary,
      }),
    );
    expect(StyleSheet.flatten(styles.progressLabel)).toEqual(
      expect.objectContaining({
        color: lightColors.textMuted,
      }),
    );
  });
});
