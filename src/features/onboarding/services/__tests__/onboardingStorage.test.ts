import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  hasCompletedOnboarding,
  markOnboardingAsCompleted,
} from "../onboardingStorage";

const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

describe("onboardingStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when onboarding completion flag is set", async () => {
    getItemMock.mockResolvedValueOnce("1");

    await expect(hasCompletedOnboarding()).resolves.toBe(true);
    expect(getItemMock).toHaveBeenCalledWith("habbittracker.onboarding.completed");
  });

  it("returns false when completion flag is missing or different", async () => {
    getItemMock.mockResolvedValueOnce(null);
    await expect(hasCompletedOnboarding()).resolves.toBe(false);

    getItemMock.mockResolvedValueOnce("0");
    await expect(hasCompletedOnboarding()).resolves.toBe(false);
  });

  it("returns false when storage read fails", async () => {
    getItemMock.mockRejectedValueOnce(new Error("storage down"));

    await expect(hasCompletedOnboarding()).resolves.toBe(false);
  });

  it("stores completion flag and does not throw on write errors", async () => {
    await expect(markOnboardingAsCompleted()).resolves.toBeUndefined();
    expect(setItemMock).toHaveBeenCalledWith("habbittracker.onboarding.completed", "1");

    setItemMock.mockRejectedValueOnce(new Error("write failed"));
    await expect(markOnboardingAsCompleted()).resolves.toBeUndefined();
  });
});
