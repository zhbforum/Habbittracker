import { getSupabaseClient } from "@/shared/api/supabase/client";
import { fetchLocalHabitStatsForUser } from "@entities/habit/api/habitStorage";

import { INITIAL_USER_STATS } from "../../model/constants";
import { HABITS_TABLE } from "../profileDb";
import { fetchCurrentUserStats, fetchPublicUserStats } from "../profileStats";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock("@entities/habit/api/habitStorage", () => ({
  fetchLocalHabitStatsForUser: jest.fn(),
}));

const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;
const fetchLocalHabitStatsForUserMock =
  fetchLocalHabitStatsForUser as jest.MockedFunction<typeof fetchLocalHabitStatsForUser>;

type MaybeSingleResult = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};

function createStatsSupabaseMock(args: {
  totalHabitsResult: { count: number | null; error: { message: string } | null };
  currentStreakResult: MaybeSingleResult;
  fallbackStreakResult: MaybeSingleResult;
}) {
  const totalHabitsEq = jest.fn().mockResolvedValue(args.totalHabitsResult);

  const currentStreakMaybeSingle = jest.fn().mockResolvedValue(args.currentStreakResult);
  const currentStreakLimit = jest.fn().mockReturnValue({
    maybeSingle: currentStreakMaybeSingle,
  });
  const currentStreakOrder = jest.fn().mockReturnValue({
    limit: currentStreakLimit,
  });
  const currentStreakEq = jest.fn().mockReturnValue({
    order: currentStreakOrder,
  });

  const fallbackStreakMaybeSingle = jest.fn().mockResolvedValue(args.fallbackStreakResult);
  const fallbackStreakLimit = jest.fn().mockReturnValue({
    maybeSingle: fallbackStreakMaybeSingle,
  });
  const fallbackStreakOrder = jest.fn().mockReturnValue({
    limit: fallbackStreakLimit,
  });
  const fallbackStreakEq = jest.fn().mockReturnValue({
    order: fallbackStreakOrder,
  });

  const select = jest.fn((columnName: string) => {
    if (columnName === "*") {
      return {
        eq: totalHabitsEq,
      };
    }

    if (columnName === "current_streak") {
      return {
        eq: currentStreakEq,
      };
    }

    if (columnName === "streak") {
      return {
        eq: fallbackStreakEq,
      };
    }

    throw new Error(`Unexpected column query: ${columnName}`);
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
    totalHabitsEq,
    currentStreakEq,
    currentStreakOrder,
    fallbackStreakEq,
    fallbackStreakOrder,
  };
}

describe("profileStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchLocalHabitStatsForUserMock.mockResolvedValue({
      totalHabits: 0,
      currentStreak: 0,
    });
  });

  it("Given remote and local stats, When fetching current user stats, Then it merges metrics using max values", async () => {
    const supabase = createStatsSupabaseMock({
      totalHabitsResult: { count: 3, error: null },
      currentStreakResult: { data: { current_streak: 4 }, error: null },
      fallbackStreakResult: { data: null, error: { message: "unused" } },
    });
    fetchLocalHabitStatsForUserMock.mockResolvedValue({
      totalHabits: 5,
      currentStreak: 2,
    });

    const result = await fetchCurrentUserStats("user-1");

    expect(result).toEqual({
      totalHabits: 5,
      currentStreak: 4,
    });
    expect(fetchLocalHabitStatsForUserMock).toHaveBeenCalledWith("user-1");
    expect(getSupabaseClientMock).toHaveBeenCalledTimes(2);
    expect(supabase.from).toHaveBeenNthCalledWith(1, HABITS_TABLE);
    expect(supabase.from).toHaveBeenNthCalledWith(2, HABITS_TABLE);
    expect(supabase.totalHabitsEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(supabase.currentStreakEq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("Given current_streak query fails, When fetching stats, Then it falls back to streak column", async () => {
    const supabase = createStatsSupabaseMock({
      totalHabitsResult: { count: 2, error: null },
      currentStreakResult: { data: null, error: { message: "column missing" } },
      fallbackStreakResult: { data: { streak: 6 }, error: null },
    });

    const result = await fetchPublicUserStats("user-2");

    expect(result).toEqual({
      totalHabits: 2,
      currentStreak: 6,
    });
    expect(supabase.from).toHaveBeenCalledWith(HABITS_TABLE);
    expect(supabase.totalHabitsEq).toHaveBeenCalledWith("user_id", "user-2");
    expect(supabase.currentStreakEq).toHaveBeenCalledWith("user_id", "user-2");
    expect(supabase.fallbackStreakEq).toHaveBeenCalledWith("user_id", "user-2");
    expect(supabase.currentStreakOrder).toHaveBeenCalledWith("current_streak", {
      ascending: false,
    });
    expect(supabase.fallbackStreakOrder).toHaveBeenCalledWith("streak", {
      ascending: false,
    });
  });

  it("Given invalid or negative streak values, When fetching stats, Then it returns non-negative rounded streak", async () => {
    const supabase = createStatsSupabaseMock({
      totalHabitsResult: { count: 1, error: null },
      currentStreakResult: { data: { current_streak: -2.7 }, error: null },
      fallbackStreakResult: { data: { streak: "invalid" }, error: null },
    });

    const result = await fetchPublicUserStats("user-3");

    expect(result).toEqual({
      totalHabits: 1,
      currentStreak: 0,
    });
    expect(supabase.totalHabitsEq).toHaveBeenCalledWith("user_id", "user-3");
    expect(supabase.currentStreakEq).toHaveBeenCalledWith("user_id", "user-3");
    expect(supabase.fallbackStreakEq).not.toHaveBeenCalled();
  });

  it("Given total habits query returns error, When fetching public stats, Then total habits falls back to zero", async () => {
    const supabase = createStatsSupabaseMock({
      totalHabitsResult: { count: null, error: { message: "count failed" } },
      currentStreakResult: { data: { current_streak: 5.6 }, error: null },
      fallbackStreakResult: { data: null, error: { message: "unused" } },
    });

    const result = await fetchPublicUserStats("user-4");

    expect(result).toEqual({
      totalHabits: 0,
      currentStreak: 6,
    });
    expect(supabase.totalHabitsEq).toHaveBeenCalledWith("user_id", "user-4");
  });

  it("Given remote stats fail for current user and local stats fail, When fetching current stats, Then it returns initial safe defaults", async () => {
    getSupabaseClientMock.mockImplementation(() => {
      throw new Error("supabase unavailable");
    });
    fetchLocalHabitStatsForUserMock.mockRejectedValueOnce(new Error("local unavailable"));

    const result = await fetchCurrentUserStats("user-5");

    expect(result).toEqual(INITIAL_USER_STATS);
  });

  it("Given remote stats fail for public profile, When fetching public stats, Then it returns initial safe defaults", async () => {
    getSupabaseClientMock.mockImplementation(() => {
      throw new Error("remote failed");
    });

    const result = await fetchPublicUserStats("user-6");

    expect(result).toEqual(INITIAL_USER_STATS);
  });
});
