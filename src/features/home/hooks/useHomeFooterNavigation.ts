import { useRouter, type Href } from "expo-router";
import { useCallback } from "react";

import { routes } from "@/shared/navigation/routes";

import type { HomeTabId } from "../components/HomeFooter";

const HOME_TAB_ROUTES: Record<HomeTabId, Href> = {
  home: routes.home,
  habits: routes.habits,
  stats: routes.stats,
  profile: routes.profile,
};

export function useHomeFooterNavigation(activeTab: HomeTabId) {
  const router = useRouter();

  const handleTabPress = useCallback(
    (tabId: HomeTabId) => {
      if (tabId === activeTab) {
        return;
      }

      router.replace(HOME_TAB_ROUTES[tabId]);
    },
    [activeTab, router],
  );

  return {
    activeTab,
    handleTabPress,
  };
}
