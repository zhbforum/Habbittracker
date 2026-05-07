import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  __testing,
  deleteSecureStoreItem,
  readSecureStoreItem,
  writeSecureStoreItem,
} from "../storageSecureStore";

type SecureMap = Map<string, string>;

function getRelatedKeys(store: SecureMap, key: string): string[] {
  return Array.from(store.keys()).filter(
    (storedKey) => storedKey === key || storedKey.startsWith(`${key}.__chunk.`),
  );
}

function createSecureStoreMemory(store: SecureMap): {
  getItemAsync: jest.MockedFunction<typeof SecureStore.getItemAsync>;
  setItemAsync: jest.MockedFunction<typeof SecureStore.setItemAsync>;
  deleteItemAsync: jest.MockedFunction<typeof SecureStore.deleteItemAsync>;
  isAvailableAsync: jest.MockedFunction<typeof SecureStore.isAvailableAsync>;
} {
  const secureStore = SecureStore as typeof SecureStore & {
    isAvailableAsync?: jest.MockedFunction<typeof SecureStore.isAvailableAsync>;
  };
  const getItemAsync =
    SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
  const setItemAsync =
    SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
  const deleteItemAsync =
    SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

  if (!secureStore.isAvailableAsync) {
    secureStore.isAvailableAsync = jest.fn();
  }

  const isAvailableAsync = secureStore
    .isAvailableAsync as jest.MockedFunction<typeof SecureStore.isAvailableAsync>;

  getItemAsync.mockImplementation(async (key: string) => store.get(key) ?? null);
  setItemAsync.mockImplementation(async (key: string, value: string) => {
    store.set(key, value);
  });
  deleteItemAsync.mockImplementation(async (key: string) => {
    store.delete(key);
  });
  isAvailableAsync.mockResolvedValue(true);

  return {
    getItemAsync,
    setItemAsync,
    deleteItemAsync,
    isAvailableAsync,
  };
}

function overridePlatformOs(nextOs: string): () => void {
  const platformRecord = Platform as unknown as Record<string, unknown>;
  const previousDescriptor = Object.getOwnPropertyDescriptor(platformRecord, "OS");

  Object.defineProperty(platformRecord, "OS", {
    configurable: true,
    writable: true,
    value: nextOs,
  });

  return () => {
    if (previousDescriptor) {
      Object.defineProperty(platformRecord, "OS", previousDescriptor);
      return;
    }

    delete platformRecord.OS;
  };
}

describe("storageSecureStore", () => {
  beforeEach(() => {
    __testing.resetSecureStoreAvailabilityCache();
    jest.clearAllMocks();
  });

  it("Given a small value, When writing and reading, Then it persists as a single secure item", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { setItemAsync } = createSecureStoreMemory(secureStoreMemory);

    const key = "session.small";
    const value = "small-token";

    await expect(writeSecureStoreItem(key, value)).resolves.toBe(true);
    await expect(readSecureStoreItem(key)).resolves.toBe(value);
    expect(setItemAsync).toHaveBeenCalledWith(key, value, expect.any(Object));
  });

  it("Given a UTF-8 emoji value below byte limit, When writing and reading, Then it stays as single-item storage", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { setItemAsync } = createSecureStoreMemory(secureStoreMemory);

    const key = "session.emoji-single";
    const value = "\u{1F600}".repeat(400);

    await expect(writeSecureStoreItem(key, value)).resolves.toBe(true);
    await expect(readSecureStoreItem(key)).resolves.toBe(value);

    const chunkWrites = setItemAsync.mock.calls.filter(([writtenKey]) =>
      writtenKey.startsWith(`${key}.__chunk.`),
    );

    expect(chunkWrites).toHaveLength(0);
    expect(secureStoreMemory.get(key)).toBe(value);
  });

  it("Given a UTF-8 emoji value clearly above byte limit, When writing and reading, Then it is chunked and restored without data loss", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { setItemAsync } = createSecureStoreMemory(secureStoreMemory);

    const key = "session.emoji-chunked";
    const value = "\u{1F600}".repeat(600);

    await expect(writeSecureStoreItem(key, value)).resolves.toBe(true);
    await expect(readSecureStoreItem(key)).resolves.toBe(value);

    const chunkWrites = setItemAsync.mock.calls.filter(([writtenKey]) =>
      writtenKey.startsWith(`${key}.__chunk.`),
    );

    expect(chunkWrites.length).toBeGreaterThan(1);
    expect(getRelatedKeys(secureStoreMemory, key).length).toBeGreaterThan(2);
  });

  it("Given chunked data with a missing chunk, When reading, Then it returns null instead of partial content", async () => {
    const secureStoreMemory = new Map<string, string>();
    createSecureStoreMemory(secureStoreMemory);

    const key = "session.corrupted";
    const value = "b".repeat(2_000);

    await writeSecureStoreItem(key, value);
    secureStoreMemory.delete(`${key}.__chunk.1`);

    await expect(readSecureStoreItem(key)).resolves.toBeNull();
  });

  it("Given chunked write fails mid-way, When writing, Then operation returns false and partial data is not readable", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { setItemAsync } = createSecureStoreMemory(secureStoreMemory);

    const key = "session.partial-failure";
    const value = "z".repeat(2_000);

    setItemAsync.mockImplementation(async (writtenKey: string, writtenValue: string) => {
      if (writtenKey === `${key}.__chunk.1`) {
        throw new Error("chunk write failed");
      }

      secureStoreMemory.set(writtenKey, writtenValue);
    });

    await expect(writeSecureStoreItem(key, value)).resolves.toBe(false);
    await expect(readSecureStoreItem(key)).resolves.toBeNull();
    expect(getRelatedKeys(secureStoreMemory, key)).toHaveLength(0);
  });

  it("Given chunked data, When deleting, Then related keys are removed and other keys are preserved", async () => {
    const secureStoreMemory = new Map<string, string>([["unrelated", "keep-me"]]);
    const { deleteItemAsync } = createSecureStoreMemory(secureStoreMemory);

    const key = "session.cleanup";
    const value = "c".repeat(2_050);

    await writeSecureStoreItem(key, value);
    expect(getRelatedKeys(secureStoreMemory, key).length).toBeGreaterThan(2);

    await deleteSecureStoreItem(key);

    await expect(readSecureStoreItem(key)).resolves.toBeNull();
    expect(getRelatedKeys(secureStoreMemory, key)).toHaveLength(0);
    expect(secureStoreMemory.get("unrelated")).toBe("keep-me");

    const deletedChunkKeys = deleteItemAsync.mock.calls
      .map(([deletedKey]) => deletedKey)
      .filter((deletedKey) => deletedKey.startsWith(`${key}.__chunk.`));

    expect(deletedChunkKeys.length).toBeGreaterThan(0);
  });

  it("Given web platform, When interacting with secure storage, Then it short-circuits without native store calls", async () => {
    const restorePlatform = overridePlatformOs("web");
    const secureStoreMemory = new Map<string, string>();
    const { getItemAsync, setItemAsync, deleteItemAsync, isAvailableAsync } =
      createSecureStoreMemory(secureStoreMemory);

    try {
      await expect(writeSecureStoreItem("session.web", "token")).resolves.toBe(false);
      await expect(readSecureStoreItem("session.web")).resolves.toBeNull();
      await expect(deleteSecureStoreItem("session.web")).resolves.toBeUndefined();
    } finally {
      restorePlatform();
    }

    expect(isAvailableAsync).not.toHaveBeenCalled();
    expect(getItemAsync).not.toHaveBeenCalled();
    expect(setItemAsync).not.toHaveBeenCalled();
    expect(deleteItemAsync).not.toHaveBeenCalled();
  });

  it("Given availability check rejects, When reading and writing repeatedly, Then it caches false result until cache reset", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { isAvailableAsync, setItemAsync } = createSecureStoreMemory(secureStoreMemory);
    isAvailableAsync.mockRejectedValueOnce(new Error("availability failed"));

    await expect(writeSecureStoreItem("session.cache", "value")).resolves.toBe(false);
    await expect(readSecureStoreItem("session.cache")).resolves.toBeNull();
    await expect(deleteSecureStoreItem("session.cache")).resolves.toBeUndefined();

    expect(isAvailableAsync).toHaveBeenCalledTimes(1);
    expect(setItemAsync).not.toHaveBeenCalled();

    __testing.resetSecureStoreAvailabilityCache();
    isAvailableAsync.mockResolvedValueOnce(true);

    await expect(writeSecureStoreItem("session.cache", "value")).resolves.toBe(true);
    expect(isAvailableAsync).toHaveBeenCalledTimes(2);
    expect(setItemAsync).toHaveBeenCalledWith("session.cache", "value", expect.any(Object));
  });

  it("Given TextEncoder is unavailable, When writing unicode-heavy payload, Then byte-size fallback still chunks and restores value", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { setItemAsync } = createSecureStoreMemory(secureStoreMemory);
    const globalRecord = globalThis as unknown as {
      TextEncoder?: typeof TextEncoder;
    };
    const originalTextEncoder = globalRecord.TextEncoder;

    globalRecord.TextEncoder = undefined;

    try {
      const key = "session.byte-fallback";
      const value = "aéअ😀".repeat(400);

      await expect(writeSecureStoreItem(key, value)).resolves.toBe(true);
      await expect(readSecureStoreItem(key)).resolves.toBe(value);

      const chunkWrites = setItemAsync.mock.calls.filter(([writtenKey]) =>
        writtenKey.startsWith(`${key}.__chunk.`),
      );

      expect(chunkWrites.length).toBeGreaterThan(1);
      expect(secureStoreMemory.get(key)?.startsWith("__chunked__:")).toBe(true);
    } finally {
      if (originalTextEncoder) {
        globalRecord.TextEncoder = originalTextEncoder;
      } else {
        delete globalRecord.TextEncoder;
      }
    }
  });

  it("Given invalid chunk metadata value, When reading, Then it returns raw value without chunk reads", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { getItemAsync } = createSecureStoreMemory(secureStoreMemory);

    secureStoreMemory.set("session.invalid-meta", "__chunked__:0");

    await expect(readSecureStoreItem("session.invalid-meta")).resolves.toBe("__chunked__:0");
    expect(getItemAsync).toHaveBeenCalledTimes(1);
  });

  it("Given native read throws, When reading secure value, Then it returns null", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { getItemAsync } = createSecureStoreMemory(secureStoreMemory);

    getItemAsync.mockRejectedValueOnce(new Error("read failed"));

    await expect(readSecureStoreItem("session.read-fail")).resolves.toBeNull();
  });

  it("Given native delete path throws, When deleting secure value, Then it resolves without throwing", async () => {
    const secureStoreMemory = new Map<string, string>();
    const { getItemAsync } = createSecureStoreMemory(secureStoreMemory);

    getItemAsync.mockRejectedValueOnce(new Error("delete failed"));

    await expect(deleteSecureStoreItem("session.delete-fail")).resolves.toBeUndefined();
  });
});
