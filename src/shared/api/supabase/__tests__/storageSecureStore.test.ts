import * as SecureStore from "expo-secure-store";

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
});
