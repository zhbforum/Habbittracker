import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHabitGroupDetailsSheetLayoutStyles } from "./HabitGroupDetailsSheet.layoutStyles";
import { createHabitGroupDetailsSheetMemberStyles } from "./HabitGroupDetailsSheet.memberStyles";
import { createHabitGroupDetailsSheetMetaStyles } from "./HabitGroupDetailsSheet.metaStyles";

export function createHabitGroupDetailsSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    ...createHabitGroupDetailsSheetLayoutStyles(colors),
    ...createHabitGroupDetailsSheetMetaStyles(colors),
    ...createHabitGroupDetailsSheetMemberStyles(colors),
  });
}
