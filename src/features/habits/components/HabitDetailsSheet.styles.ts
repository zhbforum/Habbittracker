import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHabitDetailsSheetGoalStyles } from "./HabitDetailsSheet.goalStyles";
import { createHabitDetailsSheetLayoutStyles } from "./HabitDetailsSheet.layoutStyles";
import { createHabitDetailsSheetValueAndActionsStyles } from "./HabitDetailsSheet.valueAndActionsStyles";

export function createHabitDetailsSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    ...createHabitDetailsSheetLayoutStyles(colors),
    ...createHabitDetailsSheetGoalStyles(colors),
    ...createHabitDetailsSheetValueAndActionsStyles(colors),
  });
}

export type HabitDetailsSheetStyles = ReturnType<typeof createHabitDetailsSheetStyles>;
