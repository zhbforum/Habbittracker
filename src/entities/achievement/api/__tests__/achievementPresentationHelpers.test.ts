import type { AchievementLedgerEntry, AchievementProgress } from "../../model/types";
import { ACHIEVEMENT_DEFINITIONS } from "../../model/catalog";
import { toLedgerMap } from "../achievementLedgerHelpers";
import {
  buildProgressList,
  sortAchievements,
  summarizeAchievements,
} from "../achievementPresentationHelpers";

function createLedgerEntry(
  achievementId: AchievementLedgerEntry["achievementId"],
  overrides: Partial<AchievementLedgerEntry> = {},
): AchievementLedgerEntry {
  return {
    achievementId,
    progress: 0,
    unlockedAt: null,
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("achievementPresentationHelpers", () => {
  it("builds full progress list and caps progress by definition target", () => {
    const ledger = toLedgerMap([
      createLedgerEntry("completions_25", { progress: 200, unlockedAt: "2026-05-03T00:00:00.000Z" }),
      createLedgerEntry("first_habit", { progress: 1, unlockedAt: "2026-05-01T00:00:00.000Z" }),
    ]);

    const progressList = buildProgressList(ledger);
    const completions25 = progressList.find((item) => item.id === "completions_25");

    expect(progressList).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
    expect(completions25).toEqual(
      expect.objectContaining({
        progress: 25,
        target: 25,
        isUnlocked: true,
      }),
    );
  });

  it("sorts unlocked achievements first, then locked by tier and target", () => {
    const input: AchievementProgress[] = [
      {
        id: "completions_1000",
        title: "A",
        description: "A",
        tier: "legend",
        iconName: "a",
        progress: 0,
        target: 1000,
        unlockedAt: null,
        isUnlocked: false,
      },
      {
        id: "first_habit",
        title: "B",
        description: "B",
        tier: "starter",
        iconName: "b",
        progress: 1,
        target: 1,
        unlockedAt: "2026-05-02T00:00:00.000Z",
        isUnlocked: true,
      },
      {
        id: "first_check",
        title: "C",
        description: "C",
        tier: "starter",
        iconName: "c",
        progress: 1,
        target: 1,
        unlockedAt: "2026-05-01T00:00:00.000Z",
        isUnlocked: true,
      },
      {
        id: "completions_25",
        title: "D",
        description: "D",
        tier: "bronze",
        iconName: "d",
        progress: 10,
        target: 25,
        unlockedAt: null,
        isUnlocked: false,
      },
    ];

    const sorted = sortAchievements(input);

    expect(sorted.map((item) => item.id)).toEqual([
      "first_check",
      "first_habit",
      "completions_25",
      "completions_1000",
    ]);
  });

  it("summarizes unlocked and total counts", () => {
    const achievements: AchievementProgress[] = [
      {
        id: "first_habit",
        title: "First Habit",
        description: "Create your first habit.",
        tier: "starter",
        iconName: "sprout",
        progress: 1,
        target: 1,
        unlockedAt: "2026-05-01T00:00:00.000Z",
        isUnlocked: true,
      },
      {
        id: "completions_25",
        title: "25 Completions",
        description: "Complete habits 25 times.",
        tier: "bronze",
        iconName: "checkbox-multiple-marked",
        progress: 12,
        target: 25,
        unlockedAt: null,
        isUnlocked: false,
      },
    ];

    expect(summarizeAchievements(achievements)).toEqual({
      total: 2,
      unlocked: 1,
    });
  });
});
