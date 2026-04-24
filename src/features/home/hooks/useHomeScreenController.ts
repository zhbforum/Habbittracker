import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { routes } from "@/shared/navigation/routes";

import { useHomeFooterNavigation } from "./useHomeFooterNavigation";

export function useHomeScreenController() {
  const router = useRouter();
  const { activeTab, handleTabPress } = useHomeFooterNavigation("home");

  const openHabits = useCallback(() => {
    router.push(routes.habits);
  }, [router]);

  const openProfile = useCallback(() => {
    router.push(routes.profile);
  }, [router]);

  const revisitOnboarding = useCallback(() => {
    router.replace(routes.onboarding);
  }, [router]);

  return useMemo(
    () => ({
      activeTab,
      handleTabPress,
      openHabits,
      openProfile,
      revisitOnboarding,
    }),
    [activeTab, handleTabPress, openHabits, openProfile, revisitOnboarding],
  );
}
