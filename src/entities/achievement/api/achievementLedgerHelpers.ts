import AsyncStorage from "@react-native-async-storage/async-storage";

import { getSupabaseClient } from "@/shared/api/supabase/client";

import { ACHIEVEMENT_DEFINITIONS } from "../model/catalog";
import type {
  AchievementId,
  AchievementLedgerEntry,
} from "../model/types";

const ACHIEVEMENTS_STORAGE_KEY_PREFIX = "habbittracker.achievements";
const USER_ACHIEVEMENTS_TABLE = "user_achievements";
const USER_ACHIEVEMENTS_SELECT = "achievement_id,progress,unlocked_at,updated_at";

export type AchievementCloudRow = {
  achievement_id: string;
  progress: number | null;
  unlocked_at: string | null;
  updated_at: string | null;
};

type AchievementCloudUpsert = {
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked_at: string | null;
  updated_at: string;
};

function createAchievementsStorageKey(userId: string): string {
  return `${ACHIEVEMENTS_STORAGE_KEY_PREFIX}.${userId}`;
}

function isAchievementId(value: string): value is AchievementId {
  return ACHIEVEMENT_DEFINITIONS.some((definition) => definition.id === value);
}

function normalizeLedgerEntry(
  raw: Partial<AchievementLedgerEntry> | null | undefined,
): AchievementLedgerEntry | null {
  if (!raw || typeof raw.achievementId !== "string" || !isAchievementId(raw.achievementId)) {
    return null;
  }

  const progress =
    typeof raw.progress === "number" && Number.isFinite(raw.progress)
      ? Math.max(0, Math.round(raw.progress))
      : 0;
  const unlockedAt = typeof raw.unlockedAt === "string" && raw.unlockedAt.trim().length > 0
    ? raw.unlockedAt
    : null;
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt.trim().length > 0
      ? raw.updatedAt
      : new Date().toISOString();

  return {
    achievementId: raw.achievementId,
    progress,
    unlockedAt,
    updatedAt,
  };
}

export function toLedgerMap(
  entries: AchievementLedgerEntry[],
): Record<AchievementId, AchievementLedgerEntry> {
  return entries.reduce<Record<AchievementId, AchievementLedgerEntry>>((map, entry) => {
    map[entry.achievementId] = entry;
    return map;
  }, {} as Record<AchievementId, AchievementLedgerEntry>);
}

export async function fetchLocalLedgerForUser(
  userId: string,
): Promise<Record<AchievementId, AchievementLedgerEntry>> {
  try {
    const payload = await AsyncStorage.getItem(createAchievementsStorageKey(userId));

    if (!payload) {
      return {} as Record<AchievementId, AchievementLedgerEntry>;
    }

    const parsed = JSON.parse(payload) as unknown;

    if (!Array.isArray(parsed)) {
      return {} as Record<AchievementId, AchievementLedgerEntry>;
    }

    const normalizedEntries = parsed
      .map((rawEntry) => normalizeLedgerEntry(rawEntry as Partial<AchievementLedgerEntry>))
      .filter((entry): entry is AchievementLedgerEntry => entry !== null);

    return toLedgerMap(normalizedEntries);
  } catch {
    return {} as Record<AchievementId, AchievementLedgerEntry>;
  }
}

export async function persistLocalLedgerForUser(
  userId: string,
  entries: AchievementLedgerEntry[],
): Promise<void> {
  await AsyncStorage.setItem(createAchievementsStorageKey(userId), JSON.stringify(entries));
}

export async function fetchCloudLedgerForUser(
  userId: string,
): Promise<Record<AchievementId, AchievementLedgerEntry>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(USER_ACHIEVEMENTS_TABLE)
    .select(USER_ACHIEVEMENTS_SELECT)
    .eq("user_id", userId);

  if (error || !Array.isArray(data)) {
    return {} as Record<AchievementId, AchievementLedgerEntry>;
  }

  const entries = data
    .map((row) => {
      const normalizedId = typeof row.achievement_id === "string" ? row.achievement_id : "";

      if (!isAchievementId(normalizedId)) {
        return null;
      }

      return normalizeLedgerEntry({
        achievementId: normalizedId,
        progress: typeof row.progress === "number" ? row.progress : 0,
        unlockedAt: row.unlocked_at,
        updatedAt: row.updated_at ?? new Date().toISOString(),
      });
    })
    .filter((entry): entry is AchievementLedgerEntry => entry !== null);

  return toLedgerMap(entries);
}

export async function upsertCloudLedgerForUser(
  userId: string,
  entries: AchievementLedgerEntry[],
): Promise<void> {
  const supabase = getSupabaseClient();

  const rows: AchievementCloudUpsert[] = entries.map((entry) => ({
    user_id: userId,
    achievement_id: entry.achievementId,
    progress: entry.progress,
    unlocked_at: entry.unlockedAt,
    updated_at: entry.updatedAt,
  }));

  const { error } = await supabase.from(USER_ACHIEVEMENTS_TABLE).upsert(rows, {
    onConflict: "user_id,achievement_id",
  });

  if (error) {
    throw error;
  }
}

export function mergeBaseLedger(
  localLedger: Record<AchievementId, AchievementLedgerEntry>,
  cloudLedger: Record<AchievementId, AchievementLedgerEntry>,
): Record<AchievementId, AchievementLedgerEntry> {
  const nowIso = new Date().toISOString();
  const merged = {} as Record<AchievementId, AchievementLedgerEntry>;

  ACHIEVEMENT_DEFINITIONS.forEach((definition) => {
    const localEntry = localLedger[definition.id];
    const cloudEntry = cloudLedger[definition.id];
    const progress = Math.max(localEntry?.progress ?? 0, cloudEntry?.progress ?? 0);
    const unlockedAt = localEntry?.unlockedAt || cloudEntry?.unlockedAt || null;

    merged[definition.id] = {
      achievementId: definition.id,
      progress,
      unlockedAt,
      updatedAt: localEntry?.updatedAt || cloudEntry?.updatedAt || nowIso,
    };
  });

  return merged;
}

export async function fetchCloudAchievementRowsForUser(userId: string): Promise<AchievementCloudRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(USER_ACHIEVEMENTS_TABLE)
    .select(USER_ACHIEVEMENTS_SELECT)
    .eq("user_id", userId)
    .returns<AchievementCloudRow[]>();

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data;
}
