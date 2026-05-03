import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

import type { AchievementProgress, AchievementSummary } from "@entities/achievement/model/types";

export type AchievementFilter = "all" | "unlocked" | "locked";

export const ACHIEVEMENT_FILTER_OPTIONS: { value: AchievementFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unlocked", label: "Unlocked" },
  { value: "locked", label: "Locked" },
];

type UseAchievementsExplorerSheetStateArgs = {
  isVisible: boolean;
  achievements: AchievementProgress[];
  summary: AchievementSummary;
};

export function useAchievementsExplorerSheetState({
  isVisible,
  achievements,
  summary,
}: UseAchievementsExplorerSheetStateArgs) {
  const [activeFilter, setActiveFilter] = useState<AchievementFilter>("all");
  const [renderedFilter, setRenderedFilter] = useState<AchievementFilter>("all");
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const isFilterAnimatingRef = useRef(false);

  useEffect(() => {
    if (isVisible) {
      setActiveFilter("all");
      setRenderedFilter("all");
      contentOpacity.setValue(1);
      contentTranslateY.setValue(0);
      isFilterAnimatingRef.current = false;
    }
  }, [contentOpacity, contentTranslateY, isVisible]);

  const unlockedAchievements = useMemo(
    () => achievements.filter((achievement) => achievement.isUnlocked),
    [achievements],
  );
  const lockedAchievements = useMemo(
    () => achievements.filter((achievement) => !achievement.isUnlocked),
    [achievements],
  );

  const filteredAchievements = useMemo(() => {
    if (renderedFilter === "locked") {
      return lockedAchievements;
    }

    if (renderedFilter === "unlocked") {
      return unlockedAchievements;
    }

    return achievements;
  }, [achievements, lockedAchievements, renderedFilter, unlockedAchievements]);

  const emptyText =
    renderedFilter === "locked"
      ? "You unlocked everything. Amazing run."
      : renderedFilter === "unlocked"
        ? "No unlocked achievements yet. Keep going."
        : "No achievements available.";

  const filterStatsLabel =
    renderedFilter === "all"
      ? `${summary.unlocked}/${summary.total} unlocked`
      : renderedFilter === "unlocked"
        ? `${unlockedAchievements.length} unlocked`
        : `${lockedAchievements.length} locked`;

  const animateFilterContent = useCallback(
    (nextFilter: AchievementFilter) => {
      isFilterAnimatingRef.current = true;
      contentOpacity.stopAnimation();
      contentTranslateY.stopAnimation();

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 8,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderedFilter(nextFilter);
        contentTranslateY.setValue(-8);

        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(contentTranslateY, {
            toValue: 0,
            damping: 16,
            stiffness: 180,
            mass: 0.9,
            useNativeDriver: true,
          }),
        ]).start(() => {
          isFilterAnimatingRef.current = false;
        });
      });
    },
    [contentOpacity, contentTranslateY],
  );

  const handleSelectFilter = useCallback(
    (nextFilter: AchievementFilter) => {
      if (nextFilter === activeFilter || isFilterAnimatingRef.current) {
        return;
      }

      setActiveFilter(nextFilter);
      animateFilterContent(nextFilter);
    },
    [activeFilter, animateFilterContent],
  );

  return {
    activeFilter,
    filteredAchievements,
    emptyText,
    filterStatsLabel,
    contentOpacity,
    contentTranslateY,
    handleSelectFilter,
  };
}
