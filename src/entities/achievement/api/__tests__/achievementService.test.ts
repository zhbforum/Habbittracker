import { createHabit, createHabitGroup } from "@/test/fixtures/habits";

import type { AchievementLedgerEntry } from "../../model/types";
import { ACHIEVEMENT_DEFINITIONS } from "../../model/catalog";
import {
  fetchPublicAchievementsForUser,
  resolveAndSyncAchievementsForUser,
} from "../achievementService";
import {
  fetchCloudLedgerForUser,
  fetchLocalLedgerForUser,
  persistLocalLedgerForUser,
  toLedgerMap,
  upsertCloudLedgerForUser,
} from "../achievementLedgerHelpers";

import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";

jest.mock("@entities/habit/api/habitStorage", () => ({
  fetchHabitsForUser: jest.fn(),
}));

jest.mock("@entities/habit/api/habitGroupStorage", () => ({
  fetchHabitGroupsForUser: jest.fn(),
}));

jest.mock("../achievementLedgerHelpers", () => {
  const actual = jest.requireActual("../achievementLedgerHelpers");

  return {
    ...actual,
    fetchLocalLedgerForUser: jest.fn(),
    fetchCloudLedgerForUser: jest.fn(),
    persistLocalLedgerForUser: jest.fn(),
    upsertCloudLedgerForUser: jest.fn(),
  };
});

const fetchHabitsForUserMock = fetchHabitsForUser as jest.MockedFunction<typeof fetchHabitsForUser>;
const fetchHabitGroupsForUserMock =
  fetchHabitGroupsForUser as jest.MockedFunction<typeof fetchHabitGroupsForUser>;
const fetchLocalLedgerForUserMock =
  fetchLocalLedgerForUser as jest.MockedFunction<typeof fetchLocalLedgerForUser>;
const fetchCloudLedgerForUserMock =
  fetchCloudLedgerForUser as jest.MockedFunction<typeof fetchCloudLedgerForUser>;
const persistLocalLedgerForUserMock =
  persistLocalLedgerForUser as jest.MockedFunction<typeof persistLocalLedgerForUser>;
const upsertCloudLedgerForUserMock =
  upsertCloudLedgerForUser as jest.MockedFunction<typeof upsertCloudLedgerForUser>;

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

describe("achievementService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-11T09:00:00.000Z"));

    fetchHabitsForUserMock.mockResolvedValue([]);
    fetchHabitGroupsForUserMock.mockResolvedValue([]);
    fetchLocalLedgerForUserMock.mockResolvedValue({} as ReturnType<typeof toLedgerMap>);
    fetchCloudLedgerForUserMock.mockResolvedValue({} as ReturnType<typeof toLedgerMap>);
    persistLocalLedgerForUserMock.mockResolvedValue(undefined);
    upsertCloudLedgerForUserMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("merges ledger baseline with dynamic signals and preserves higher existing progress", async () => {
    const userId = "user-1";
    const habits = [
      createHabit("h1", {
        completions: {
          "2026-05-09": { completedAt: "2026-05-09T09:00:00.000Z", value: null },
          "2026-05-10": { completedAt: "2026-05-10T09:00:00.000Z", value: null },
        },
      }),
    ];
    const groups = [createHabitGroup("g1", { habitIds: ["h1"], dailyGoal: 1 })];
    const localLedger = toLedgerMap([
      createLedgerEntry("completions_25", {
        progress: 30,
        unlockedAt: "2026-05-01T00:00:00.000Z",
      }),
    ]);

    fetchHabitsForUserMock.mockResolvedValueOnce(habits);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce(groups);
    fetchLocalLedgerForUserMock.mockResolvedValueOnce(localLedger);
    fetchCloudLedgerForUserMock.mockResolvedValueOnce({} as ReturnType<typeof toLedgerMap>);

    const result = await resolveAndSyncAchievementsForUser(userId);

    expect(result.achievements).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
    expect(result.summary.total).toBe(ACHIEVEMENT_DEFINITIONS.length);

    const firstHabit = result.achievements.find((achievement) => achievement.id === "first_habit");
    const firstCheck = result.achievements.find((achievement) => achievement.id === "first_check");
    const completions25 = result.achievements.find(
      (achievement) => achievement.id === "completions_25",
    );

    expect(firstHabit).toEqual(
      expect.objectContaining({
        progress: 1,
        target: 1,
        isUnlocked: true,
        unlockedAt: "2026-05-11T09:00:00.000Z",
      }),
    );
    expect(firstCheck).toEqual(
      expect.objectContaining({
        progress: 1,
        isUnlocked: true,
        unlockedAt: "2026-05-11T09:00:00.000Z",
      }),
    );
    expect(completions25).toEqual(
      expect.objectContaining({
        progress: 25,
        isUnlocked: true,
        unlockedAt: "2026-05-01T00:00:00.000Z",
      }),
    );

    expect(persistLocalLedgerForUserMock).toHaveBeenCalledTimes(1);
    expect(upsertCloudLedgerForUserMock).toHaveBeenCalledTimes(1);
    expect(persistLocalLedgerForUserMock).toHaveBeenCalledWith(
      userId,
      expect.arrayContaining([
        expect.objectContaining({
          achievementId: "first_habit",
          progress: 1,
          unlockedAt: "2026-05-11T09:00:00.000Z",
        }),
      ]),
    );
  });

  it("falls back to local ledger when cloud ledger fetch fails", async () => {
    const userId = "user-2";
    fetchHabitsForUserMock.mockResolvedValueOnce([createHabit("h1")]);
    fetchHabitGroupsForUserMock.mockResolvedValueOnce([]);
    fetchCloudLedgerForUserMock.mockRejectedValueOnce(new Error("cloud down"));

    const result = await resolveAndSyncAchievementsForUser(userId);

    expect(result.achievements).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
    expect(result.summary.total).toBe(ACHIEVEMENT_DEFINITIONS.length);
    expect(result.summary.unlocked).toBeGreaterThanOrEqual(1);
    expect(fetchCloudLedgerForUserMock).toHaveBeenCalledWith(userId);
  });

  it("returns only unlocked public achievements while preserving full summary totals", async () => {
    const userId = "public-user";
    const cloudLedger = toLedgerMap([
      createLedgerEntry("first_habit", {
        progress: 1,
        unlockedAt: "2026-05-01T00:00:00.000Z",
      }),
      createLedgerEntry("completions_25", {
        progress: 10,
        unlockedAt: null,
      }),
    ]);

    fetchCloudLedgerForUserMock.mockResolvedValueOnce(cloudLedger);

    const result = await fetchPublicAchievementsForUser(userId);

    expect(result.achievements).toHaveLength(1);
    expect(result.achievements[0]).toEqual(
      expect.objectContaining({
        id: "first_habit",
        isUnlocked: true,
      }),
    );
    expect(result.summary.total).toBe(ACHIEVEMENT_DEFINITIONS.length);
    expect(result.summary.unlocked).toBe(1);
  });
});
