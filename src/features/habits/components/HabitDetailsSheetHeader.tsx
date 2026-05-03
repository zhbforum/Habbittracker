import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { formatLongDate } from "@features/habits/model/date";
import { getFrequencyLabel, getReminderLabel } from "@features/habits/model/presenters";
import type { HabitWithMetrics } from "@features/habits/model/types";
import { AppText } from "@shared/ui";

import type { HabitDetailsSheetStyles } from "./HabitDetailsSheet.styles";
import { HabitTypeBadge } from "./HabitTypeBadge";

type HabitDetailsSheetHeaderProps = {
  habit: HabitWithMetrics;
  HabitIcon: LucideIcon;
  iconColor: string;
  styles: HabitDetailsSheetStyles;
};

export function HabitDetailsSheetHeader({
  habit,
  HabitIcon,
  iconColor,
  styles,
}: HabitDetailsSheetHeaderProps) {
  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <HabitIcon size={22} color={iconColor} strokeWidth={2.2} />
        </View>

        <View style={styles.identityWrap}>
          <AppText style={styles.habitName}>{habit.name}</AppText>
          <AppText style={styles.metaLine}>{getFrequencyLabel(habit)}</AppText>
        </View>

        <HabitTypeBadge kind={habit.kind} />
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaCard}>
          <AppText style={styles.metaTitle}>Started</AppText>
          <AppText style={styles.metaValue}>{formatLongDate(new Date(habit.createdAt))}</AppText>
        </View>
        <View style={styles.metaCard}>
          <AppText style={styles.metaTitle}>Reminder</AppText>
          <AppText style={styles.metaValue}>{getReminderLabel(habit)}</AppText>
        </View>
      </View>

      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <AppText style={styles.streakLabel}>Current streak</AppText>
          <AppText style={styles.streakValue}>{habit.metrics.currentStreak}d</AppText>
        </View>
        <View style={styles.streakCard}>
          <AppText style={styles.streakLabel}>Best streak</AppText>
          <AppText style={styles.streakValue}>{habit.metrics.bestStreak}d</AppText>
        </View>
      </View>
    </>
  );
}
