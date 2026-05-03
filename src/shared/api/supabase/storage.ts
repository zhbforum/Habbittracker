import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportedStorage } from "@supabase/supabase-js";

import {
  deleteSecureStoreItem,
  readSecureStoreItem,
  writeSecureStoreItem,
} from "./storageSecureStore";

async function readAsyncStorageItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function removeAsyncStorageItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Keep storage cleanup non-fatal for auth flows
  }
}

async function migrateAsyncStorageValue(key: string, value: string): Promise<void> {
  const storedInSecureStore = await writeSecureStoreItem(key, value);

  if (!storedInSecureStore) {
    return;
  }

  await removeAsyncStorageItem(key);
}

export const nativeSupabaseStorage: SupportedStorage = {
  async getItem(key) {
    const secureStoreValue = await readSecureStoreItem(key);

    if (secureStoreValue !== null) {
      return secureStoreValue;
    }

    const asyncStorageValue = await readAsyncStorageItem(key);

    if (asyncStorageValue !== null) {
      void migrateAsyncStorageValue(key, asyncStorageValue);
    }

    return asyncStorageValue;
  },
  async setItem(key, value) {
    const storedInSecureStore = await writeSecureStoreItem(key, value);

    if (storedInSecureStore) {
      await removeAsyncStorageItem(key);
      return;
    }

    await deleteSecureStoreItem(key);
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key) {
    await Promise.allSettled([removeAsyncStorageItem(key), deleteSecureStoreItem(key)]);
  },
};
