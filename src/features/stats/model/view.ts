import { Animated } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import type { ActivityHeatmapWeek } from "@features/stats/components/ActivityHeatmap";
import type {
  StatsDayDetails,
  StatsDayGroupItem,
  StatsDayHabitItem,
  StatsSummaryRange,
} from "@features/stats/model/types";

export type DayDetailsFilter = "all" | "completed" | "pending";

export const DAY_DETAILS_FILTERS: { id: DayDetailsFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
];

export const SUMMARY_RANGE_OPTIONS: { id: StatsSummaryRange; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "three_months", label: "3M" },
  { id: "year", label: "Year" },
];

export function getIntensityColor(level: 0 | 1 | 2 | 3, colors: ThemeColors): string {
  if (level === 3) {
    return colors.successText;
  }

  if (level === 2) {
    return colors.accentText;
  }

  if (level === 1) {
    return colors.textMuted;
  }

  return "transparent";
}

export function chunkByWeek<T>(items: T[]): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += 7) {
    chunks.push(items.slice(index, index + 7));
  }

  return chunks;
}

export function createAppearStyle(animationValue: Animated.Value): {
  opacity: Animated.Value;
  transform: { translateY: Animated.AnimatedInterpolation<number> }[];
} {
  return {
    opacity: animationValue,
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };
}

export function toActivityHeatmapWeeks(
  weeks: {
    weekLabel: string;
    monthLabel: string;
    cells: { dateKey: string; intensityLevel: 0 | 1 | 2 | 3; isToday: boolean }[];
  }[],
): ActivityHeatmapWeek[] {
  return weeks.map((week) => ({
    key: week.weekLabel,
    monthLabel: week.monthLabel,
    cells: week.cells.map((cell) => ({
      key: cell.dateKey,
      intensityLevel: cell.intensityLevel,
      isToday: cell.isToday,
    })),
  }));
}

export function filterDayHabitsByStatus(
  items: StatsDayHabitItem[],
  filter: DayDetailsFilter,
): StatsDayHabitItem[] {
  if (filter === "completed") {
    return items.filter((habit) => habit.isCompleted);
  }

  if (filter === "pending") {
    return items.filter((habit) => habit.isScheduled && !habit.isCompleted);
  }

  return items;
}

export function filterDayGroupsByStatus(
  items: StatsDayGroupItem[],
  filter: DayDetailsFilter,
): StatsDayGroupItem[] {
  if (filter === "completed") {
    return items.filter((group) => group.isCompleted);
  }

  if (filter === "pending") {
    return items.filter((group) => !group.isCompleted);
  }

  return items;
}

export function getCompletedCountLabel(
  selectedDayDetails: StatsDayDetails,
  detailsFilter: DayDetailsFilter,
): string {
  if (detailsFilter === "all") {
    return `${selectedDayDetails.completedHabitsCount + selectedDayDetails.completedGroupsCount} completed`;
  }

  if (detailsFilter === "completed") {
    return "Showing completed only";
  }

  return "Showing pending only";
}
