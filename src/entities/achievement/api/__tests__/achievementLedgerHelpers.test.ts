import AsyncStorage from "@react-native-async-storage/async-storage";

import { ACHIEVEMENT_DEFINITIONS } from "../../model/catalog";
import type { AchievementLedgerEntry } from "../../model/types";
import {
  fetchLocalLedgerForUser,
  mergeBaseLedger,
  toLedgerMap,
} from "../achievementLedgerHelpers";

const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;

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

describe("achievementLedgerHelpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty ledger for corrupted local payload", async () => {
    getItemMock.mockResolvedValueOnce("{broken-json");

    await expect(fetchLocalLedgerForUser("user-1")).resolves.toEqual({});
  });

  it("normalizes local ledger entries and filters unknown achievement ids", async () => {
    getItemMock.mockResolvedValueOnce(
      JSON.stringify([
        {
          achievementId: "first_habit",
          progress: -10,
          unlockedAt: "",
          updatedAt: "",
        },
        {
          achievementId: "unknown_id",
          progress: 999,
          unlockedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      ]),
    );

    const ledger = await fetchLocalLedgerForUser("user-1");

    expect(Object.keys(ledger)).toEqual(["first_habit"]);
    expect(ledger.first_habit).toEqual(
      expect.objectContaining({
        achievementId: "first_habit",
        progress: 0,
        unlockedAt: null,
        updatedAt: expect.any(String),
      }),
    );
  });

  it("merges local and cloud ledgers using max progress and unlocked-at precedence", () => {
    const local = toLedgerMap([
      createLedgerEntry("first_habit", {
        progress: 1,
        unlockedAt: "2026-05-01T00:00:00.000Z",
      }),
      createLedgerEntry("completions_25", {
        progress: 20,
        unlockedAt: null,
      }),
    ]);
    const cloud = toLedgerMap([
      createLedgerEntry("first_habit", {
        progress: 2,
        unlockedAt: "2026-05-02T00:00:00.000Z",
      }),
      createLedgerEntry("completions_25", {
        progress: 30,
        unlockedAt: "2026-05-03T00:00:00.000Z",
      }),
    ]);

    const merged = mergeBaseLedger(local, cloud);

    expect(Object.keys(merged)).toHaveLength(ACHIEVEMENT_DEFINITIONS.length);
    expect(merged.first_habit).toEqual(
      expect.objectContaining({
        progress: 2,
        unlockedAt: "2026-05-01T00:00:00.000Z",
      }),
    );
    expect(merged.completions_25).toEqual(
      expect.objectContaining({
        progress: 30,
        unlockedAt: "2026-05-03T00:00:00.000Z",
      }),
    );
  });
});
