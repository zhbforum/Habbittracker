import { Pressable, View } from "react-native";

import { getCompletionActionLabel } from "@features/habits/model/presenters";
import type { HabitWithMetrics } from "@features/habits/model/types";
import { AppText } from "@shared/ui";

import type { HabitDetailsSheetStyles } from "./HabitDetailsSheet.styles";

type HabitDetailsSheetGoalSectionProps = {
  habit: HabitWithMetrics;
  isSaving: boolean;
  styles: HabitDetailsSheetStyles;
  onToggleToday: (habitId: string) => void;
};

export function HabitDetailsSheetGoalSection({
  habit,
  isSaving,
  styles,
  onToggleToday,
}: HabitDetailsSheetGoalSectionProps) {
  const currentGoalValue = habit.metrics.goalProgress.currentValue;
  const goalProgressPercent = habit.metrics.goalProgress.progressPercent;
  const targetGoalValue = habit.metrics.goalProgress.target;
  const goalPeriodLabel = habit.metrics.goalProgress.periodLabel;

  return (
    <>
      <View style={styles.goalCard}>
        <View style={styles.goalHeaderRow}>
          <AppText style={styles.goalTitle}>Goal</AppText>
          <AppText style={styles.goalCaption}>
            {targetGoalValue} {habit.goal.unit} / {goalPeriodLabel.toLowerCase()}
          </AppText>
        </View>

        <View style={styles.goalProgressRow}>
          <AppText style={styles.goalProgressValue}>
            {Math.round(currentGoalValue * 100) / 100} / {targetGoalValue}
          </AppText>
          <AppText style={styles.goalProgressPercent}>{goalProgressPercent}%</AppText>
        </View>

        <View style={styles.goalProgressTrack}>
          <View style={[styles.goalProgressFill, { width: `${goalProgressPercent}%` }]} />
        </View>
      </View>

      <Pressable
        style={[
          styles.progressButton,
          habit.metrics.completedToday && styles.progressButtonDone,
          isSaving && styles.buttonDisabled,
        ]}
        onPress={() => onToggleToday(habit.id)}
        disabled={isSaving}
      >
        <AppText
          style={[
            styles.progressButtonText,
            habit.metrics.completedToday && styles.progressButtonTextDone,
          ]}
        >
          {getCompletionActionLabel(habit)}
        </AppText>
      </Pressable>
    </>
  );
}
