type SupabaseRuntimeConfig = {
  url: string | null;
  anonKey: string | null;
};

function readRuntimeValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const supabaseRuntimeConfig: SupabaseRuntimeConfig = {
  url: readRuntimeValue(process.env.EXPO_PUBLIC_SUPABASE_URL),
  anonKey: readRuntimeValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
};

export function getMissingSupabaseEnvKeys(): string[] {
  const missing: string[] = [];

  if (!supabaseRuntimeConfig.url) {
    missing.push("EXPO_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseRuntimeConfig.anonKey) {
    missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  return missing;
}
