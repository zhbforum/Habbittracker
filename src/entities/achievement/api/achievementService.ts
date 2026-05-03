import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";

import { ACHIEVEMENT_DEFINITIONS } from "../model/catalog";
import { buildAchievementSignals } from "../model/engine";
import type {
  AchievementId,
  AchievementLedgerEntry,
  AchievementProgress,
  AchievementSummary,
} from "../model/types";
import {
  fetchCloudAchievementRowsForUser,
  fetchCloudLedgerForUser,
  fetchLocalLedgerForUser,
  mergeBaseLedger,
  persistLocalLedgerForUser,
  toLedgerMap,
  upsertCloudLedgerForUser,
} from "./achievementLedgerHelpers";
import {
  buildProgressList,
  sortAchievements,
  summarizeAchievements,
} from "./achievementPresentationHelpers";

export { fetchCloudAchievementRowsForUser };

export async function resolveAndSyncAchievementsForUser(userId: string): Promise<{
  achievements: AchievementProgress[];
  summary: AchievementSummary;
}> {
  const [habits, groups, localLedger, cloudLedger] = await Promise.all([
    fetchHabitsForUser(userId),
    fetchHabitGroupsForUser(userId),
    fetchLocalLedgerForUser(userId),
    fetchCloudLedgerForUser(userId).catch(() => ({} as Record<AchievementId, AchievementLedgerEntry>)),
  ]);

  const signals = buildAchievementSignals(habits, groups);
  const baseLedger = mergeBaseLedger(localLedger, cloudLedger);
  const nowIso = new Date().toISOString();

  const nextLedgerEntries: AchievementLedgerEntry[] = ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const existing = baseLedger[definition.id];
    const dynamicProgress = Math.max(0, Math.round(definition.resolveProgress(signals)));
    const progress = Math.max(existing.progress, dynamicProgress);
    const unlockedAt = existing.unlockedAt || (progress >= definition.target ? nowIso : null);

    return {
      achievementId: definition.id,
      progress,
      unlockedAt,
      updatedAt: nowIso,
    };
  });

  void persistLocalLedgerForUser(userId, nextLedgerEntries);
  void upsertCloudLedgerForUser(userId, nextLedgerEntries).catch(() => undefined);

  const sortedAchievements = sortAchievements(buildProgressList(toLedgerMap(nextLedgerEntries)));

  return {
    achievements: sortedAchievements,
    summary: summarizeAchievements(sortedAchievements),
  };
}

export async function fetchPublicAchievementsForUser(userId: string): Promise<{
  achievements: AchievementProgress[];
  summary: AchievementSummary;
}> {
  const cloudLedger = await fetchCloudLedgerForUser(userId).catch(
    () => ({} as Record<AchievementId, AchievementLedgerEntry>),
  );
  const fullList = sortAchievements(buildProgressList(cloudLedger));
  const unlockedOnly = fullList.filter((achievement) => achievement.isUnlocked);

  return {
    achievements: unlockedOnly,
    summary: summarizeAchievements(fullList),
  };
}
