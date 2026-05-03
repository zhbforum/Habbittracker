import { Minus, Plus } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useMemo } from "react";

import type { HabitGroupFormValues, HabitWithMetrics } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitGroupEditorSheetStyles } from "./HabitGroupEditorSheet.styles";
import { HabitGroupHabitSelectorList } from "./HabitGroupHabitSelectorList";

type HabitGroupEditorGoalSectionProps = {
  values: HabitGroupFormValues;
  availableHabits: HabitWithMetrics[];
  colors: ThemeColors;
  styles: HabitGroupEditorSheetStyles;
  onToggleHabit: (habitId: string) => void;
  onFieldChange: <K extends keyof HabitGroupFormValues>(
    field: K,
    value: HabitGroupFormValues[K],
  ) => void;
};

function clampGoal(nextGoal: number, selectedCount: number): number {
  const maxGoal = Math.max(1, selectedCount);
  return Math.max(1, Math.min(maxGoal, Math.round(nextGoal)));
}

export function HabitGroupEditorGoalSection({
  values,
  availableHabits,
  colors,
  styles,
  onToggleHabit,
  onFieldChange,
}: HabitGroupEditorGoalSectionProps) {
  const selectedCount = values.habitIds.length;
  const maxGoal = Math.max(1, selectedCount);
  const resolvedGoal = useMemo(
    () => clampGoal(values.dailyGoal, selectedCount),
    [selectedCount, values.dailyGoal],
  );

  return (
    <>
      <View>
        <AppText style={styles.fieldLabel}>Daily goal</AppText>
        <View style={styles.goalRow}>
          <Pressable
            style={styles.goalStepButton}
            onPress={() => onFieldChange("dailyGoal", clampGoal(resolvedGoal - 1, selectedCount))}
            disabled={resolvedGoal <= 1}
          >
            <Minus size={16} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          <View style={styles.goalValueCard}>
            <AppText style={styles.goalValue}>{resolvedGoal}</AppText>
            <AppText style={styles.goalHint}>min tasks per day</AppText>
          </View>

          <Pressable
            style={[styles.goalStepButton, selectedCount === 0 && styles.disabledButton]}
            onPress={() => onFieldChange("dailyGoal", clampGoal(resolvedGoal + 1, selectedCount))}
            disabled={resolvedGoal >= maxGoal || selectedCount === 0}
          >
            <Plus size={16} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>
        <AppText style={styles.goalInfo}>Goal can be up to selected habits: {selectedCount}</AppText>
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Included habits</AppText>
        <View style={styles.habitsSelectionWrap}>
          <HabitGroupHabitSelectorList
            availableHabits={availableHabits}
            selectedHabitIds={values.habitIds}
            styles={styles}
            colors={colors}
            onToggleHabit={onToggleHabit}
          />
        </View>
      </View>
    </>
  );
}
