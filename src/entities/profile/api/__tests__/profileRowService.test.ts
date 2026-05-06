import { createSupabaseUser } from "@/test/fixtures/auth";
import { getSupabaseClient } from "@/shared/api/supabase/client";

import { PROFILES_TABLE, type ProfileRow } from "../profileDb";
import { ensureCurrentUserProfileRow, isUsernameAvailable } from "../profileRowService";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

function createProfileRow(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "user-1",
    username: "alex",
    username_updated_at: "2026-06-01T10:00:00.000Z",
    bio: "Keep going.",
    avatar_url: "https://example.com/avatar.png",
    full_name: "Alex Doe",
    theme_preference: "light",
    ...overrides,
  };
}

type EnsureProfileSupabaseMock = {
  from: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  selectByIdEq: jest.Mock;
  maybeSingle: jest.Mock;
  updateEq: jest.Mock;
};

function createEnsureProfileSupabaseMock(args: {
  selectResult: { data: ProfileRow | null; error: { message: string } | null };
  insertResult?: { data: ProfileRow | null; error: { message: string } | null };
  updateResult?: { data: ProfileRow | null; error: { message: string } | null };
}): EnsureProfileSupabaseMock {
  const maybeSingle = jest.fn().mockResolvedValue(args.selectResult);
  const selectByIdEq = jest.fn().mockReturnValue({
    maybeSingle,
  });
  const select = jest.fn().mockReturnValue({
    eq: selectByIdEq,
  });

  const insertSingle = jest
    .fn()
    .mockResolvedValue(args.insertResult ?? { data: null, error: null });
  const insertSelect = jest.fn().mockReturnValue({
    single: insertSingle,
  });
  const insert = jest.fn().mockReturnValue({
    select: insertSelect,
  });

  const updateSingle = jest
    .fn()
    .mockResolvedValue(args.updateResult ?? { data: null, error: null });
  const updateSelect = jest.fn().mockReturnValue({
    single: updateSingle,
  });
  const updateEq = jest.fn().mockReturnValue({
    select: updateSelect,
  });
  const update = jest.fn().mockReturnValue({
    eq: updateEq,
  });

  const from = jest.fn().mockReturnValue({
    select,
    insert,
    update,
  });

  getSupabaseClientMock.mockReturnValue({
    from,
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    insert,
    update,
    selectByIdEq,
    maybeSingle,
    updateEq,
  };
}

type UsernameAvailabilitySupabaseMock = {
  from: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
};

function createUsernameAvailabilitySupabaseMock(args: {
  queryResult: { count: number | null; error: { message: string } | null };
}): UsernameAvailabilitySupabaseMock {
  const query = Promise.resolve(args.queryResult) as Promise<{
    count: number | null;
    error: { message: string } | null;
  }> & {
    neq: jest.Mock;
  };

  query.neq = jest.fn().mockReturnValue(query);

  const eq = jest.fn().mockReturnValue(query);
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
    neq: query.neq,
  };
}

describe("profileRowService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ensureCurrentUserProfileRow", () => {
    it("Given existing profile with name and avatar, When ensuring current user profile row, Then it returns profile without insert/update", async () => {
      const user = createSupabaseUser({ id: "user-existing" });
      const existingProfile = createProfileRow({
        id: user.id,
      });
      const supabase = createEnsureProfileSupabaseMock({
        selectResult: { data: existingProfile, error: null },
      });

      const result = await ensureCurrentUserProfileRow(user);

      expect(result).toEqual(existingProfile);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.selectByIdEq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.insert).not.toHaveBeenCalled();
      expect(supabase.update).not.toHaveBeenCalled();
    });

    it("Given missing profile row, When ensuring current user profile row, Then it inserts and returns created profile", async () => {
      const insertedProfile = createProfileRow({
        id: "user-create",
        username: null,
        username_updated_at: null,
        full_name: "Create User",
        avatar_url: "https://cdn.example.com/avatar.jpg",
      });
      const user = createSupabaseUser({
        id: "user-create",
        email: "fallback@example.com",
        user_metadata: {
          full_name: "Create User",
          avatar_url: "https://cdn.example.com/avatar.jpg",
        },
      });
      const supabase = createEnsureProfileSupabaseMock({
        selectResult: { data: null, error: null },
        insertResult: { data: insertedProfile, error: null },
      });

      const result = await ensureCurrentUserProfileRow(user);

      expect(result).toEqual(insertedProfile);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.selectByIdEq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.insert).toHaveBeenCalledWith({
        id: "user-create",
        full_name: "Create User",
        avatar_url: "https://cdn.example.com/avatar.jpg",
        theme_preference: "light",
      });
      expect(supabase.update).not.toHaveBeenCalled();
    });

    it("Given existing profile without provider name and avatar, When ensuring row, Then it backfills missing fields", async () => {
      const user = createSupabaseUser({
        id: "user-backfill",
        email: "alice@example.com",
        user_metadata: {
          full_name: "Alice Doe",
          avatar_url: "https://cdn.example.com/alice.jpg",
        },
      });
      const currentProfile = createProfileRow({
        id: user.id,
        full_name: null,
        avatar_url: null,
      });
      const backfilledProfile = createProfileRow({
        id: user.id,
        full_name: "Alice Doe",
        avatar_url: "https://cdn.example.com/alice.jpg",
      });
      const supabase = createEnsureProfileSupabaseMock({
        selectResult: { data: currentProfile, error: null },
        updateResult: { data: backfilledProfile, error: null },
      });

      const result = await ensureCurrentUserProfileRow(user);

      expect(result).toEqual(backfilledProfile);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.selectByIdEq).toHaveBeenCalledWith("id", user.id);
      expect(supabase.update).toHaveBeenCalledWith({
        avatar_url: "https://cdn.example.com/alice.jpg",
        full_name: "Alice Doe",
      });
      expect(supabase.updateEq).toHaveBeenCalledWith("id", user.id);
    });

    it("Given backfill update fails, When ensuring row, Then it returns original profile row", async () => {
      const user = createSupabaseUser({
        id: "user-fallback",
        email: "fallback@example.com",
        user_metadata: {
          full_name: "Fallback User",
          avatar_url: "https://cdn.example.com/fallback.jpg",
        },
      });
      const currentProfile = createProfileRow({
        id: user.id,
        full_name: null,
        avatar_url: null,
      });
      const supabase = createEnsureProfileSupabaseMock({
        selectResult: { data: currentProfile, error: null },
        updateResult: { data: null, error: { message: "update failed" } },
      });

      const result = await ensureCurrentUserProfileRow(user);

      expect(result).toEqual(currentProfile);
      expect(supabase.update).toHaveBeenCalledWith({
        avatar_url: "https://cdn.example.com/fallback.jpg",
        full_name: "Fallback User",
      });
      expect(supabase.updateEq).toHaveBeenCalledWith("id", user.id);
    });

    it("Given profile query fails, When ensuring row, Then it throws Supabase error message", async () => {
      const user = createSupabaseUser({ id: "user-error" });
      createEnsureProfileSupabaseMock({
        selectResult: { data: null, error: { message: "profile read failed" } },
      });

      await expect(ensureCurrentUserProfileRow(user)).rejects.toThrow(
        "profile read failed",
      );
    });

    it("Given insert fails for missing profile, When ensuring row, Then it throws initialization error", async () => {
      const user = createSupabaseUser({ id: "user-insert-error" });
      createEnsureProfileSupabaseMock({
        selectResult: { data: null, error: null },
        insertResult: { data: null, error: { message: "insert failed" } },
      });

      await expect(ensureCurrentUserProfileRow(user)).rejects.toThrow("insert failed");
    });
  });

  describe("isUsernameAvailable", () => {
    it("Given empty normalized username, When checking availability, Then it returns false without querying Supabase", async () => {
      const result = await isUsernameAvailable("   ");

      expect(result).toBe(false);
      expect(getSupabaseClientMock).not.toHaveBeenCalled();
    });

    it("Given free username, When checking availability, Then it returns true and uses normalized username", async () => {
      const supabase = createUsernameAvailabilitySupabaseMock({
        queryResult: { count: 0, error: null },
      });

      const result = await isUsernameAvailable("  Alex_User  ");

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(supabase.eq).toHaveBeenCalledWith("username", "alex_user");
      expect(supabase.neq).not.toHaveBeenCalled();
    });

    it("Given taken username, When checking availability, Then it returns false", async () => {
      const supabase = createUsernameAvailabilitySupabaseMock({
        queryResult: { count: 2, error: null },
      });

      await expect(isUsernameAvailable("alex")).resolves.toBe(false);
      expect(supabase.from).toHaveBeenCalledWith(PROFILES_TABLE);
      expect(supabase.eq).toHaveBeenCalledWith("username", "alex");
    });

    it("Given exclude user id, When checking availability, Then it excludes current user from query", async () => {
      const supabase = createUsernameAvailabilitySupabaseMock({
        queryResult: { count: 0, error: null },
      });

      const result = await isUsernameAvailable("alex", "user-1");

      expect(result).toBe(true);
      expect(supabase.neq).toHaveBeenCalledWith("id", "user-1");
    });

    it("Given username availability query fails, When checking availability, Then it throws Supabase error", async () => {
      createUsernameAvailabilitySupabaseMock({
        queryResult: { count: null, error: { message: "username query failed" } },
      });

      await expect(isUsernameAvailable("alex")).rejects.toThrow("username query failed");
    });
  });
});
