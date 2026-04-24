import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETED_STORAGE_KEY = "habbittracker.onboarding.completed";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY);
    return storedValue === "1";
  } catch {
    return false;
  }
}

export async function markOnboardingAsCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, "1");
  } catch {
    // Onboarding persistence is best-effort and should not block app flow.
  }
}
