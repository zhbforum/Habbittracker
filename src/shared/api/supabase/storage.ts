import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportedStorage } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

let secureStoreAvailabilityPromise: Promise<boolean> | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (!secureStoreAvailabilityPromise) {
    secureStoreAvailabilityPromise = SecureStore.isAvailableAsync().catch(() => false);
  }

  return secureStoreAvailabilityPromise;
}

async function deleteSecureStoreItem(key: string): Promise<void> {
  if (!(await canUseSecureStore())) {
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
  } catch {
    // Keep storage operations non-fatal for auth flows
  }
}

async function writeSecureStoreItem(
  key: string,
  value: string,
): Promise<boolean> {
  if (!(await canUseSecureStore())) {
    return false;
  }

  try {
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
    return true;
  } catch {
    return false;
  }
}

async function readSecureStoreItem(key: string): Promise<string | null> {
  if (!(await canUseSecureStore())) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
  } catch {
    return null;
  }
}

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
