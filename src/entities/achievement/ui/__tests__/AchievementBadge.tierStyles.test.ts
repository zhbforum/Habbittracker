import { getAchievementTierStyle } from "../AchievementBadge.tierStyles";

describe("getAchievementTierStyle", () => {
  it("Given light theme tiers, When resolving palette, Then it returns tier-specific light colors", () => {
    expect(getAchievementTierStyle("legend", false)).toEqual(
      expect.objectContaining({
        tint: "#8D6C1A",
        surface: "#FBF4DD",
      }),
    );
    expect(getAchievementTierStyle("gold", false)).toEqual(
      expect.objectContaining({
        tint: "#8A6B27",
      }),
    );
    expect(getAchievementTierStyle("silver", false)).toEqual(
      expect.objectContaining({
        tint: "#4D667A",
      }),
    );
    expect(getAchievementTierStyle("bronze", false)).toEqual(
      expect.objectContaining({
        tint: "#855B3A",
      }),
    );
    expect(getAchievementTierStyle("starter", false)).toEqual(
      expect.objectContaining({
        tint: "#2F7A3E",
      }),
    );
  });

  it("Given dark theme tiers, When resolving palette, Then it returns tier-specific dark colors", () => {
    expect(getAchievementTierStyle("legend", true)).toEqual(
      expect.objectContaining({
        tint: "#D9B14D",
      }),
    );
    expect(getAchievementTierStyle("gold", true)).toEqual(
      expect.objectContaining({
        tint: "#C39A3A",
      }),
    );
    expect(getAchievementTierStyle("silver", true)).toEqual(
      expect.objectContaining({
        tint: "#A8B3C0",
      }),
    );
    expect(getAchievementTierStyle("bronze", true)).toEqual(
      expect.objectContaining({
        tint: "#B6834F",
      }),
    );
    expect(getAchievementTierStyle("starter", true)).toEqual(
      expect.objectContaining({
        tint: "#79A46A",
      }),
    );
  });
});
