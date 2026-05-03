import { Check, Flame } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { getHabitIconById, getHabitIconColorById } from "../model/icons";
import {
  getCompletionActionLabel,
  getFrequencyLabel,
  getGoalLabel,
  getReminderLabel,
} from "../model/presenters";
import type { HabitWithMetrics } from "../model/types";
import { createHabitSummaryCardStyles } from "./HabitSummaryCard.styles";
import { HabitTypeBadge } from "./HabitTypeBadge";

type HabitSummaryCardProps = {
  habit: HabitWithMetrics;
  onPress: () => void;
  onToggleToday: () => void;
};

export function HabitSummaryCard({
  habit,
  onPress,
  onToggleToday,
}: HabitSummaryCardProps) {
  const { colors } = useAppTheme();
  const styles = createHabitSummaryCardStyles(colors);
  const Icon = getHabitIconById(habit.iconId);
  const iconColor = getHabitIconColorById(habit.iconColorId);
  const completionActionLabel = getCompletionActionLabel(habit);

  return (
    <View style={styles.card}>
      <Pressable style={styles.cardPressable} onPress={onPress}>
        <View style={styles.topRow}>
          <View style={styles.identityRow}>
            <View style={styles.iconWrap}>
              <Icon size={20} color={iconColor} strokeWidth={2.2} />
            </View>

            <View style={styles.identityTextWrap}>
              <AppText style={styles.habitName}>{habit.name}</AppText>
              <AppText style={styles.metaText}>{getFrequencyLabel(habit)}</AppText>
            </View>
          </View>

          <HabitTypeBadge kind={habit.kind} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <AppText style={styles.metaChipLabel}>Reminder</AppText>
            <AppText style={styles.metaChipValue}>{getReminderLabel(habit)}</AppText>
          </View>
          <View style={styles.metaChip}>
            <AppText style={styles.metaChipLabel}>Goal</AppText>
            <AppText style={styles.metaChipValue}>{getGoalLabel(habit)}</AppText>
          </View>
          {habit.goal.metric === "value" ? (
            <View style={styles.metaChip}>
              <AppText style={styles.metaChipLabel}>Today</AppText>
              <AppText style={styles.metaChipValue}>
                {Math.round(habit.metrics.todayLoggedValue * 100) / 100} {habit.goal.unit}
              </AppText>
            </View>
          ) : null}
          <View style={styles.metaChip}>
            <Flame size={14} color={colors.accentText} strokeWidth={2.2} />
            <AppText style={styles.metaChipValue}>
              {habit.metrics.currentStreak}d current
            </AppText>
          </View>
          <View style={styles.metaChip}>
            <AppText style={styles.metaChipValue}>{habit.metrics.bestStreak}d best</AppText>
          </View>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.completeButton,
          habit.metrics.completedToday && styles.completeButtonDone,
        ]}
        onPress={onToggleToday}
      >
        <Check
          size={16}
          color={habit.metrics.completedToday ? colors.successText : colors.textPrimary}
          strokeWidth={2.4}
        />
        <AppText
          style={[
            styles.completeButtonText,
            habit.metrics.completedToday && styles.completeButtonTextDone,
          ]}
        >
          {completionActionLabel}
        </AppText>
      </Pressable>
    </View>
  );
}
