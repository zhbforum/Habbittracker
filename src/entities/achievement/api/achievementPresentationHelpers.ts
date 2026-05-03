import { ACHIEVEMENT_DEFINITIONS } from "../model/catalog";
import type {
  AchievementId,
  AchievementLedgerEntry,
  AchievementProgress,
  AchievementSummary,
} from "../model/types";

export function buildProgressList(
  ledger: Record<AchievementId, AchievementLedgerEntry>,
): AchievementProgress[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const ledgerEntry = ledger[definition.id];
    const progress = Math.max(0, ledgerEntry?.progress ?? 0);
    const unlockedAt = ledgerEntry?.unlockedAt ?? null;

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      tier: definition.tier,
      iconName: definition.iconName,
      progress: Math.min(progress, definition.target),
      target: definition.target,
      unlockedAt,
      isUnlocked: Boolean(unlockedAt),
    };
  });
}

export function sortAchievements(achievements: AchievementProgress[]): AchievementProgress[] {
  const tierRank: Record<AchievementProgress["tier"], number> = {
    starter: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    legend: 4,
  };

  return [...achievements].sort((left, right) => {
    if (left.isUnlocked !== right.isUnlocked) {
      return left.isUnlocked ? -1 : 1;
    }

    if (left.isUnlocked && right.isUnlocked) {
      return (left.unlockedAt || "").localeCompare(right.unlockedAt || "");
    }

    const tierDiff = tierRank[left.tier] - tierRank[right.tier];

    if (tierDiff !== 0) {
      return tierDiff;
    }

    return left.target - right.target;
  });
}

export function summarizeAchievements(achievements: AchievementProgress[]): AchievementSummary {
  const unlocked = achievements.filter((achievement) => achievement.isUnlocked).length;

  return {
    total: achievements.length,
    unlocked,
  };
}
