import AsyncStorage from "@react-native-async-storage/async-storage";
import { waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import { __testing } from "../storageSecureStore";
import { nativeSupabaseStorage } from "../storage";

type SecureMap = Map<string, string>;

function setupStorageBoundaries(store: SecureMap) {
  const secureStore = SecureStore as typeof SecureStore & {
    isAvailableAsync?: jest.MockedFunction<typeof SecureStore.isAvailableAsync>;
  };

  const getItemAsync =
    SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
  const setItemAsync =
    SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
  const deleteItemAsync =
    SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;
  const getItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
  const setItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
  const removeItem =
    AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>;

  if (!secureStore.isAvailableAsync) {
    secureStore.isAvailableAsync = jest.fn();
  }

  secureStore.isAvailableAsync.mockResolvedValue(true);
  getItemAsync.mockImplementation(async (key: string) => store.get(key) ?? null);
  setItemAsync.mockImplementation(async (key: string, value: string) => {
    store.set(key, value);
  });
  deleteItemAsync.mockImplementation(async (key: string) => {
    store.delete(key);
  });

  getItem.mockResolvedValue(null);
  setItem.mockResolvedValue();
  removeItem.mockResolvedValue();

  return {
    getItemAsync,
    setItemAsync,
    deleteItemAsync,
    getItem,
    setItem,
    removeItem,
  };
}

function createStorageTestContext(initialSecureValues?: Record<string, string>) {
  const secureStoreMemory = new Map<string, string>(
    Object.entries(initialSecureValues ?? {}),
  );
  const boundaries = setupStorageBoundaries(secureStoreMemory);

  return {
    secureStoreMemory,
    ...boundaries,
  };
}

describe("nativeSupabaseStorage", () => {
  beforeEach(() => {
    __testing.resetSecureStoreAvailabilityCache();
    jest.clearAllMocks();
  });

  it("Given value in SecureStore, When getItem is called, Then it returns secure value", async () => {
    const { getItem } = createStorageTestContext({
      token: "secure-token",
    });

    await expect(nativeSupabaseStorage.getItem("token")).resolves.toBe("secure-token");
    expect(getItem).not.toHaveBeenCalled();
  });

  it("Given SecureStore miss and AsyncStorage hit, When getItem is called, Then it returns fallback and migrates to SecureStore", async () => {
    const { getItem, setItemAsync, removeItem, secureStoreMemory } = createStorageTestContext();

    getItem.mockResolvedValueOnce("async-token");

    await expect(nativeSupabaseStorage.getItem("token")).resolves.toBe("async-token");

    await waitFor(() => {
      expect(setItemAsync).toHaveBeenCalledWith("token", "async-token", expect.any(Object));
      expect(removeItem).toHaveBeenCalledWith("token");
      expect(secureStoreMemory.get("token")).toBe("async-token");
    });
  });

  it("Given SecureStore miss and AsyncStorage read throws, When getItem is called, Then it returns null without migration", async () => {
    const { getItem, setItemAsync, removeItem } = createStorageTestContext();

    getItem.mockRejectedValueOnce(new Error("async read failed"));

    await expect(nativeSupabaseStorage.getItem("token")).resolves.toBeNull();

    await waitFor(() => {
      expect(setItemAsync).not.toHaveBeenCalled();
      expect(removeItem).not.toHaveBeenCalled();
    });
  });

  it("Given migration write to SecureStore fails, When getItem reads AsyncStorage fallback, Then value is returned without removing AsyncStorage key", async () => {
    const { getItem, setItemAsync, removeItem } = createStorageTestContext();

    getItem.mockResolvedValueOnce("async-token");
    setItemAsync.mockRejectedValueOnce(new Error("secure migration failed"));

    await expect(nativeSupabaseStorage.getItem("token")).resolves.toBe("async-token");

    await waitFor(() => {
      expect(setItemAsync).toHaveBeenCalledWith("token", "async-token", expect.any(Object));
      expect(removeItem).not.toHaveBeenCalled();
    });
  });

  it("Given SecureStore write failure, When setItem is called, Then it falls back to AsyncStorage and cleans secure key", async () => {
    const { setItemAsync, deleteItemAsync, setItem, secureStoreMemory } =
      createStorageTestContext({
        token: "stale",
      });

    setItemAsync.mockRejectedValueOnce(new Error("secure store unavailable"));

    await expect(
      nativeSupabaseStorage.setItem("token", "fallback-token"),
    ).resolves.toBeUndefined();

    expect(setItem).toHaveBeenCalledWith("token", "fallback-token");
    expect(deleteItemAsync).toHaveBeenCalledWith("token", expect.any(Object));
    expect(secureStoreMemory.has("token")).toBe(false);
  });

  it("Given SecureStore write succeeds, When setItem is called, Then it removes async fallback and does not write to AsyncStorage", async () => {
    const { setItem, removeItem, secureStoreMemory } = createStorageTestContext();

    await expect(nativeSupabaseStorage.setItem("token", "secure-token")).resolves.toBeUndefined();

    expect(removeItem).toHaveBeenCalledWith("token");
    expect(setItem).not.toHaveBeenCalled();
    expect(secureStoreMemory.get("token")).toBe("secure-token");
  });

  it("Given removeItem is called, When both layers are healthy, Then SecureStore and AsyncStorage are cleared", async () => {
    const { removeItem, secureStoreMemory } = createStorageTestContext({
      token: "secure",
    });

    await expect(nativeSupabaseStorage.removeItem("token")).resolves.toBeUndefined();

    expect(removeItem).toHaveBeenCalledWith("token");
    expect(secureStoreMemory.has("token")).toBe(false);
  });

  it("Given both layers can fail during remove, When removeItem is called, Then cleanup still resolves and attempts both layers", async () => {
    const { removeItem, getItemAsync, deleteItemAsync } = createStorageTestContext({
      token: "secure",
    });

    removeItem.mockRejectedValueOnce(new Error("async remove failed"));
    getItemAsync.mockResolvedValueOnce("secure");
    deleteItemAsync.mockRejectedValueOnce(new Error("secure delete failed"));

    await expect(nativeSupabaseStorage.removeItem("token")).resolves.toBeUndefined();

    expect(removeItem).toHaveBeenCalledWith("token");
    expect(getItemAsync).toHaveBeenCalledWith("token", expect.any(Object));
    expect(deleteItemAsync).toHaveBeenCalledWith("token", expect.any(Object));
  });
});
