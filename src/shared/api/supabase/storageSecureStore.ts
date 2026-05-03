import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
const MAX_SECURE_STORE_VALUE_BYTES = 1900;
const MAX_SECURE_STORE_VALUE_CHARACTERS = 1800;
const MAX_SECURE_STORE_CHUNK_BYTES = 900;
const MAX_SECURE_STORE_CHUNK_CHARACTERS = 800;
const SECURE_STORE_CHUNK_META_PREFIX = "__chunked__:";

let secureStoreAvailabilityPromise: Promise<boolean> | null = null;

function estimateUtf8ByteSize(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }

  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index) ?? 0;

    if (codePoint <= 0x7f) {
      bytes += 1;
    } else if (codePoint <= 0x7ff) {
      bytes += 2;
    } else if (codePoint <= 0xffff) {
      bytes += 3;
    } else {
      bytes += 4;
      index += 1;
    }
  }

  return bytes;
}

function estimateUtf8CodePointSize(value: string): number {
  const codePoint = value.codePointAt(0) ?? 0;

  if (codePoint <= 0x7f) {
    return 1;
  }

  if (codePoint <= 0x7ff) {
    return 2;
  }

  if (codePoint <= 0xffff) {
    return 3;
  }

  return 4;
}

function createChunkKey(key: string, index: number): string {
  return `${key}.__chunk.${index}`;
}

function buildChunkMeta(partsCount: number): string {
  return `${SECURE_STORE_CHUNK_META_PREFIX}${partsCount}`;
}

function parseChunkMeta(value: string): number | null {
  if (!value.startsWith(SECURE_STORE_CHUNK_META_PREFIX)) {
    return null;
  }

  const partsCount = Number(value.slice(SECURE_STORE_CHUNK_META_PREFIX.length));

  if (!Number.isInteger(partsCount) || partsCount <= 0) {
    return null;
  }

  return partsCount;
}

function splitIntoSecureStoreChunks(value: string): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  let currentChunkBytes = 0;
  let currentChunkCharacters = 0;

  for (const character of value) {
    const nextBytes = estimateUtf8CodePointSize(character);
    const nextCharacters = currentChunkCharacters + 1;
    const nextChunkBytes = currentChunkBytes + nextBytes;
    const exceedsChunkLimit =
      nextChunkBytes > MAX_SECURE_STORE_CHUNK_BYTES ||
      nextCharacters > MAX_SECURE_STORE_CHUNK_CHARACTERS;

    if (exceedsChunkLimit && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = character;
      currentChunkBytes = nextBytes;
      currentChunkCharacters = 1;
      continue;
    }

    currentChunk += character;
    currentChunkBytes = nextChunkBytes;
    currentChunkCharacters = nextCharacters;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  if (!secureStoreAvailabilityPromise) {
    secureStoreAvailabilityPromise = SecureStore.isAvailableAsync().catch(() => false);
  }

  return secureStoreAvailabilityPromise;
}

export async function deleteSecureStoreItem(key: string): Promise<void> {
  if (!(await canUseSecureStore())) {
    return;
  }

  try {
    const currentValue = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    const chunkCount = currentValue ? parseChunkMeta(currentValue) : null;

    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);

    if (chunkCount) {
      for (let index = 0; index < chunkCount; index += 1) {
        await SecureStore.deleteItemAsync(createChunkKey(key, index), SECURE_STORE_OPTIONS);
      }
    }
  } catch {
    // Keep storage operations non-fatal for auth flows
  }
}

async function writeChunkedSecureStoreItem(key: string, value: string): Promise<boolean> {
  const chunks = splitIntoSecureStoreChunks(value);

  if (chunks.length <= 1) {
    return false;
  }

  try {
    await deleteSecureStoreItem(key);

    for (let index = 0; index < chunks.length; index += 1) {
      await SecureStore.setItemAsync(createChunkKey(key, index), chunks[index], SECURE_STORE_OPTIONS);
    }

    await SecureStore.setItemAsync(key, buildChunkMeta(chunks.length), SECURE_STORE_OPTIONS);
    return true;
  } catch {
    await deleteSecureStoreItem(key);
    return false;
  }
}

export async function writeSecureStoreItem(key: string, value: string): Promise<boolean> {
  if (!(await canUseSecureStore())) {
    return false;
  }

  const shouldChunkByCharacters = value.length > MAX_SECURE_STORE_VALUE_CHARACTERS;
  const shouldChunkByBytes = estimateUtf8ByteSize(value) > MAX_SECURE_STORE_VALUE_BYTES;

  if (shouldChunkByCharacters || shouldChunkByBytes) {
    return writeChunkedSecureStoreItem(key, value);
  }

  try {
    await deleteSecureStoreItem(key);
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
    return true;
  } catch {
    return false;
  }
}

export async function readSecureStoreItem(key: string): Promise<string | null> {
  if (!(await canUseSecureStore())) {
    return null;
  }

  try {
    const value = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);

    if (value === null) {
      return null;
    }

    const chunkCount = parseChunkMeta(value);

    if (!chunkCount) {
      return value;
    }

    const chunks: string[] = [];

    for (let index = 0; index < chunkCount; index += 1) {
      const chunkValue = await SecureStore.getItemAsync(createChunkKey(key, index), SECURE_STORE_OPTIONS);

      if (chunkValue === null) {
        return null;
      }

      chunks.push(chunkValue);
    }

    return chunks.join("");
  } catch {
    return null;
  }
}
