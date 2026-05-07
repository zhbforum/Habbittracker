import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseClient } from "@/shared/api/supabase/client";

import { ACHIEVEMENT_DEFINITIONS } from "../../model/catalog";
import type { AchievementLedgerEntry } from "../../model/types";
import {
  fetchCloudAchievementRowsForUser,
  fetchCloudLedgerForUser,
  fetchLocalLedgerForUser,
  mergeBaseLedger,
  persistLocalLedgerForUser,
  toLedgerMap,
  upsertCloudLedgerForUser,
} from "../achievementLedgerHelpers";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

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

function createCloudLedgerSupabaseMock(args: {
  queryResult: { data: Record<string, unknown>[] | null; error: { message: string } | null };
}) {
  const eq = jest.fn().mockResolvedValue(args.queryResult);
  const select = jest.fn().mockReturnValue({
    eq,
  });
  const from = jest.fn().mockReturnValue({
    select,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    select,
    eq,
  };
}

function createCloudRowsSupabaseMock(args: {
  queryResult: { data: Record<string, unknown>[] | null; error: { message: string } | null };
}) {
  const returns = jest.fn().mockResolvedValue(args.queryResult);
  const eq = jest.fn().mockReturnValue({
    returns,
  });
  const select = jest.fn().mockReturnValue({
    eq,
  });
  const from = jest.fn().mockReturnValue({
    select,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    select,
    eq,
    returns,
  };
}

function createUpsertSupabaseMock(args: {
  upsertResult: { error: { message: string } | null };
}) {
  const upsert = jest.fn().mockResolvedValue(args.upsertResult);
  const from = jest.fn().mockReturnValue({
    upsert,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    upsert,
  };
}

describe("achievementLedgerHelpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns empty ledger for corrupted local payload", async () => {
    getItemMock.mockResolvedValueOnce("{broken-json");

    await expect(fetchLocalLedgerForUser("user-1")).resolves.toEqual({});
  });

  it("returns empty ledger when local payload is missing", async () => {
    getItemMock.mockResolvedValueOnce(null);

    await expect(fetchLocalLedgerForUser("user-no-payload")).resolves.toEqual({});
    expect(getItemMock).toHaveBeenCalledWith("habbittracker.achievements.user-no-payload");
  });

  it("returns empty ledger when local payload is not an array", async () => {
    getItemMock.mockResolvedValueOnce(JSON.stringify({ first_habit: { progress: 1 } }));

    await expect(fetchLocalLedgerForUser("user-object-payload")).resolves.toEqual({});
  });

  it("normalizes local ledger entries and filters unknown achievement ids", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-10T11:30:00.000Z"));

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
        updatedAt: "2026-08-10T11:30:00.000Z",
      }),
    );
  });

  it("queries cloud ledger with expected table and user id, then normalizes rows", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-01T08:15:00.000Z"));
    const supabase = createCloudLedgerSupabaseMock({
      queryResult: {
        data: [
          {
            achievement_id: "first_habit",
            progress: 1.6,
            unlocked_at: "2026-08-01T10:00:00.000Z",
            updated_at: null,
          },
          {
            achievement_id: "completions_25",
            progress: -3,
            unlocked_at: null,
            updated_at: "2026-08-15T10:00:00.000Z",
          },
          {
            achievement_id: "unknown_id",
            progress: 9,
            unlocked_at: "2026-08-20T10:00:00.000Z",
            updated_at: "2026-08-20T10:00:00.000Z",
          },
        ],
        error: null,
      },
    });

    const ledger = await fetchCloudLedgerForUser("user-cloud-1");

    expect(supabase.from).toHaveBeenCalledWith("user_achievements");
    expect(supabase.select).toHaveBeenCalledWith(
      "achievement_id,progress,unlocked_at,updated_at",
    );
    expect(supabase.eq).toHaveBeenCalledWith("user_id", "user-cloud-1");

    expect(Object.keys(ledger)).toEqual(["first_habit", "completions_25"]);
    expect(ledger.first_habit).toEqual({
      achievementId: "first_habit",
      progress: 2,
      unlockedAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-09-01T08:15:00.000Z",
    });
    expect(ledger.completions_25).toEqual({
      achievementId: "completions_25",
      progress: 0,
      unlockedAt: null,
      updatedAt: "2026-08-15T10:00:00.000Z",
    });
  });

  it("returns empty cloud ledger when query fails", async () => {
    createCloudLedgerSupabaseMock({
      queryResult: {
        data: null,
        error: { message: "cloud fetch failed" },
      },
    });

    await expect(fetchCloudLedgerForUser("user-cloud-error")).resolves.toEqual({});
  });

  it("normalizes cloud rows with invalid id/progress types", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-03T10:30:00.000Z"));
    createCloudLedgerSupabaseMock({
      queryResult: {
        data: [
          {
            achievement_id: 42,
            progress: 3,
            unlocked_at: null,
            updated_at: "2026-09-01T00:00:00.000Z",
          },
          {
            achievement_id: "streak_3",
            progress: "not-a-number",
            unlocked_at: "",
            updated_at: null,
          },
        ],
        error: null,
      },
    });

    const ledger = await fetchCloudLedgerForUser("user-cloud-typed");

    expect(Object.keys(ledger)).toEqual(["streak_3"]);
    expect(ledger.streak_3).toEqual({
      achievementId: "streak_3",
      progress: 0,
      unlockedAt: null,
      updatedAt: "2026-09-03T10:30:00.000Z",
    });
  });

  it("upserts cloud ledger rows with user id and conflict key", async () => {
    const supabase = createUpsertSupabaseMock({
      upsertResult: { error: null },
    });
    const entries = [
      createLedgerEntry("first_habit", {
        progress: 1,
        unlockedAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      }),
      createLedgerEntry("streak_3", {
        progress: 3,
        unlockedAt: null,
        updatedAt: "2026-07-02T00:00:00.000Z",
      }),
    ];

    await upsertCloudLedgerForUser("user-upsert-1", entries);

    expect(supabase.from).toHaveBeenCalledWith("user_achievements");
    expect(supabase.upsert).toHaveBeenCalledWith(
      [
        {
          user_id: "user-upsert-1",
          achievement_id: "first_habit",
          progress: 1,
          unlocked_at: "2026-07-01T00:00:00.000Z",
          updated_at: "2026-07-01T00:00:00.000Z",
        },
        {
          user_id: "user-upsert-1",
          achievement_id: "streak_3",
          progress: 3,
          unlocked_at: null,
          updated_at: "2026-07-02T00:00:00.000Z",
        },
      ],
      {
        onConflict: "user_id,achievement_id",
      },
    );
  });

  it("throws when cloud upsert returns error", async () => {
    createUpsertSupabaseMock({
      upsertResult: { error: { message: "upsert failed" } },
    });

    await expect(
      upsertCloudLedgerForUser("user-upsert-error", [createLedgerEntry("first_habit")]),
    ).rejects.toMatchObject({
      message: "upsert failed",
    });
  });

  it("persists local ledger entries using user-scoped storage key", async () => {
    const entries = [
      createLedgerEntry("first_habit", {
        progress: 2,
        unlockedAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-02T00:00:00.000Z",
      }),
    ];

    await expect(persistLocalLedgerForUser("user-persist-1", entries)).resolves.toBeUndefined();
    expect(setItemMock).toHaveBeenCalledWith(
      "habbittracker.achievements.user-persist-1",
      JSON.stringify(entries),
    );
  });

  it("fetches raw cloud achievement rows with expected query chain", async () => {
    const supabase = createCloudRowsSupabaseMock({
      queryResult: {
        data: [
          {
            achievement_id: "first_habit",
            progress: 1,
            unlocked_at: "2026-07-01T00:00:00.000Z",
            updated_at: "2026-07-02T00:00:00.000Z",
          },
        ],
        error: null,
      },
    });

    const rows = await fetchCloudAchievementRowsForUser("public-user-77");

    expect(supabase.from).toHaveBeenCalledWith("user_achievements");
    expect(supabase.select).toHaveBeenCalledWith(
      "achievement_id,progress,unlocked_at,updated_at",
    );
    expect(supabase.eq).toHaveBeenCalledWith("user_id", "public-user-77");
    expect(supabase.returns).toHaveBeenCalledTimes(1);
    expect(rows).toEqual([
      {
        achievement_id: "first_habit",
        progress: 1,
        unlocked_at: "2026-07-01T00:00:00.000Z",
        updated_at: "2026-07-02T00:00:00.000Z",
      },
    ]);
  });

  it("returns empty cloud rows when query fails", async () => {
    createCloudRowsSupabaseMock({
      queryResult: {
        data: null,
        error: { message: "cloud rows unavailable" },
      },
    });

    await expect(fetchCloudAchievementRowsForUser("public-user-error")).resolves.toEqual([]);
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
