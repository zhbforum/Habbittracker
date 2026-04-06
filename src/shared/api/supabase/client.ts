import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const missingEnvKeys = getMissingSupabaseEnvKeys();

  if (missingEnvKeys.length > 0) {
    throw new Error(`Missing Supabase env vars: ${missingEnvKeys.join(", ")}`);
  }

  supabaseClient = createClient(
    supabaseRuntimeConfig.url as string,
    supabaseRuntimeConfig.anonKey as string,
    {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    },
  );

  return supabaseClient;
}