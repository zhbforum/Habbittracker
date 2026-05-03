import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHomeBaseStyles } from "./homeBaseStyles";
import { createHomeGroupsStyles } from "./homeGroupsStyles";
import { createHomeHabitsStyles } from "./homeHabitsStyles";
import { createHomeProgressStyles } from "./homeProgressStyles";

export function createHomeScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
    ...createHomeBaseStyles(colors),
    ...createHomeProgressStyles(colors),
    ...createHomeGroupsStyles(colors),
    ...createHomeHabitsStyles(colors),
  });
}

export type HomeScreenStyles = ReturnType<typeof createHomeScreenStyles>;
