import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHabitGroupEditorSheetBaseStyles } from "./HabitGroupEditorSheet.baseStyles";
import { createHabitGroupEditorSheetGoalStyles } from "./HabitGroupEditorSheet.goalStyles";
import { createHabitGroupEditorSheetSelectionStyles } from "./HabitGroupEditorSheet.selectionStyles";

export function createHabitGroupEditorSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    ...createHabitGroupEditorSheetBaseStyles(colors),
    ...createHabitGroupEditorSheetGoalStyles(colors),
    ...createHabitGroupEditorSheetSelectionStyles(colors),
  });
}

export type HabitGroupEditorSheetStyles = ReturnType<typeof createHabitGroupEditorSheetStyles>;
