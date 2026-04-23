import "react-native-url-polyfill/auto";
import {
  createClient,
  processLock,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { Platform } from "react-native";

import {
  getMissingSupabaseEnvKeys,
  supabaseRuntimeConfig,
} from "@/shared/config/env";
import { nativeSupabaseStorage } from "@/shared/api/supabase/storage";

let supabaseClient: SupabaseClient | null = null;

function createConfiguredSupabaseClient(): SupabaseClient {
  return createClient(
    supabaseRuntimeConfig.url as string,
    supabaseRuntimeConfig.anonKey as string,
    {
      auth: {
        ...(Platform.OS !== "web" ? { storage: nativeSupabaseStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    },
  );
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const missingEnvKeys = getMissingSupabaseEnvKeys();

  if (missingEnvKeys.length > 0) {
    throw new Error(`Missing Supabase env vars: ${missingEnvKeys.join(", ")}`);
  }

  supabaseClient = createConfiguredSupabaseClient();

  return supabaseClient;
}
