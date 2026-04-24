import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { HabitWithMetrics } from "../model/types";
import { HabitEmptyState } from "./HabitEmptyState";
import { HabitSummaryCard } from "./HabitSummaryCard";

type HabitsContentStateProps = {
  isLoading: boolean;
  errorMessage: string | null;
  habits: HabitWithMetrics[];
  onRetry: () => void;
  onCreatePress: () => void;
  onOpenHabit: (habitId: string) => void;
  onToggleToday: (habitId: string) => void;
};

export function HabitsContentState({
  isLoading,
  errorMessage,
  habits,
  onRetry,
  onCreatePress,
  onOpenHabit,
  onToggleToday,
}: HabitsContentStateProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <>
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <AppText style={styles.errorBannerText}>{errorMessage}</AppText>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loaderCard}>
          <ActivityIndicator size="small" color={colors.textPrimary} />
          <AppText style={styles.loaderText}>Loading habits...</AppText>
        </View>
      ) : habits.length === 0 ? (
        <HabitEmptyState onCreatePress={onCreatePress} />
      ) : (
        <View style={styles.listWrap}>
          {habits.map((habit) => (
            <HabitSummaryCard
              key={habit.id}
              habit={habit}
              onPress={() => onOpenHabit(habit.id)}
              onToggleToday={() => onToggleToday(habit.id)}
            />
          ))}
        </View>
      )}
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    errorBanner: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    errorBannerText: {
      color: colors.errorText,
      fontSize: 14,
      lineHeight: 20,
    },
    retryButton: {
      alignSelf: "flex-start",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.surface,
      minHeight: 32,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    retryButtonText: {
      color: colors.errorText,
      fontSize: 12,
      lineHeight: 16,
    },
    loaderCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    loaderText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    listWrap: {
      gap: 12,
    },
  });
}
