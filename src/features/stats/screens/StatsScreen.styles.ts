import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createStatsCalendarStyles } from "./statsCalendarStyles";
import { createStatsDayDetailsStyles } from "./statsDayDetailsStyles";
import { createStatsLayoutStyles } from "./statsLayoutStyles";
import { createStatsOverviewStyles } from "./statsOverviewStyles";

export function createStatsScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
    ...createStatsLayoutStyles(colors),
    ...createStatsOverviewStyles(colors),
    ...createStatsCalendarStyles(colors),
    ...createStatsDayDetailsStyles(colors),
  });
}

export type StatsScreenStyles = ReturnType<typeof createStatsScreenStyles>;
