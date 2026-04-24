import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { useHomeFooterNavigation } from "@/features/home/hooks/useHomeFooterNavigation";
import { routes } from "@/shared/navigation/routes";

export function useStatsScreenController() {
  const router = useRouter();
  const { activeTab, handleTabPress } = useHomeFooterNavigation("stats");

  const openHabits = useCallback(() => {
    router.replace(routes.habits);
  }, [router]);

  return useMemo(
    () => ({
      activeTab,
      handleTabPress,
      openHabits,
    }),
    [activeTab, handleTabPress, openHabits],
  );
}
