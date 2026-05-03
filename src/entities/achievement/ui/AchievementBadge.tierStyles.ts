import type { AchievementTier } from "../model/types";

type TierPalette = {
  tint: string;
  surface: string;
  border: string;
  surfaceLocked: string;
  borderLocked: string;
  tintLocked: string;
};

function getLightTierStyle(tier: AchievementTier): TierPalette {
  if (tier === "legend") {
    return {
      tint: "#8D6C1A",
      surface: "#FBF4DD",
      border: "#E4CF8D",
      surfaceLocked: "#EFF5EC",
      borderLocked: "#C7D9C0",
      tintLocked: "#7A8F76",
    };
  }

  if (tier === "gold") {
    return {
      tint: "#8A6B27",
      surface: "#F8F0DD",
      border: "#DEC596",
      surfaceLocked: "#EFF5EC",
      borderLocked: "#C7D9C0",
      tintLocked: "#7A8F76",
    };
  }

  if (tier === "silver") {
    return {
      tint: "#4D667A",
      surface: "#EAF0F5",
      border: "#C2D0DD",
      surfaceLocked: "#EFF5EC",
      borderLocked: "#C7D9C0",
      tintLocked: "#7A8F76",
    };
  }

  if (tier === "bronze") {
    return {
      tint: "#855B3A",
      surface: "#F4EAE0",
      border: "#DDBFA7",
      surfaceLocked: "#EFF5EC",
      borderLocked: "#C7D9C0",
      tintLocked: "#7A8F76",
    };
  }

  return {
    tint: "#2F7A3E",
    surface: "#E7F5DF",
    border: "#B7D9AC",
    surfaceLocked: "#EFF5EC",
    borderLocked: "#C7D9C0",
    tintLocked: "#7A8F76",
  };
}

function getDarkTierStyle(tier: AchievementTier): TierPalette {
  if (tier === "legend") {
    return {
      tint: "#D9B14D",
      surface: "#2C2615",
      border: "#CDA64C",
      surfaceLocked: "#233021",
      borderLocked: "#3A4D35",
      tintLocked: "#8FAA8B",
    };
  }

  if (tier === "gold") {
    return {
      tint: "#C39A3A",
      surface: "#2D261A",
      border: "#B88B2E",
      surfaceLocked: "#233021",
      borderLocked: "#3A4D35",
      tintLocked: "#8FAA8B",
    };
  }

  if (tier === "silver") {
    return {
      tint: "#A8B3C0",
      surface: "#252C35",
      border: "#95A2B3",
      surfaceLocked: "#233021",
      borderLocked: "#3A4D35",
      tintLocked: "#8FAA8B",
    };
  }

  if (tier === "bronze") {
    return {
      tint: "#B6834F",
      surface: "#2C241C",
      border: "#9F6D3C",
      surfaceLocked: "#233021",
      borderLocked: "#3A4D35",
      tintLocked: "#8FAA8B",
    };
  }

  return {
    tint: "#79A46A",
    surface: "#1F2D1D",
    border: "#6D9560",
    surfaceLocked: "#233021",
    borderLocked: "#3A4D35",
    tintLocked: "#8FAA8B",
  };
}

export function getAchievementTierStyle(tier: AchievementTier, isDark: boolean): TierPalette {
  return isDark ? getDarkTierStyle(tier) : getLightTierStyle(tier);
}
