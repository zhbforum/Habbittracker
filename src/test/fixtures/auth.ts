import type { User } from "@supabase/supabase-js";

export function createSupabaseUser(overrides: Partial<User> = {}): User {
  const base: User = {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-06-01T10:00:00.000Z",
  };

  return {
    ...base,
    ...overrides,
    app_metadata: {
      ...base.app_metadata,
      ...(overrides.app_metadata ?? {}),
    },
    user_metadata: {
      ...base.user_metadata,
      ...(overrides.user_metadata ?? {}),
    },
  };
}
