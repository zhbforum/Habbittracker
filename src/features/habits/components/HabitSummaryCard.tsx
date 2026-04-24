import { Check, Flame } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { getHabitIconById, getHabitIconColorById } from "../model/icons";
import {
  getCompletionActionLabel,
  getFrequencyLabel,
  getReminderLabel,
} from "../model/presenters";
import type { HabitWithMetrics } from "../model/types";
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
  const styles = createStyles(colors);
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 12,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    cardPressable: {
      gap: 12,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    identityTextWrap: {
      flex: 1,
    },
    habitName: {
      color: colors.textPrimary,
      fontSize: 19,
      lineHeight: 24,
    },
    metaText: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    metaChip: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaChipLabel: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    metaChipValue: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
    },
    completeButton: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    completeButtonDone: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    completeButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    completeButtonTextDone: {
      color: colors.successText,
    },
  });
}
