import { ActivityIndicator, Pressable, View } from "react-native";

import type { HabitWithMetrics } from "@entities/habit/model/types";
import type { HomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import { HomeHabitCard } from "./HomeHabitCard";

type HomeHabitsSectionProps = {
  styles: HomeScreenStyles;
  colors: ThemeColors;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  todayHabits: HabitWithMetrics[];
  onOpenHabits: () => void;
  onOpenHabitById: (habitId: string) => void;
  onToggleTodayCompletion: (habitId: string) => void;
  onRetry: () => void;
};

export function HomeHabitsSection({
  styles,
  colors,
  isLoading,
  isSaving,
  errorMessage,
  todayHabits,
  onOpenHabits,
  onOpenHabitById,
  onToggleTodayCompletion,
  onRetry,
}: HomeHabitsSectionProps) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Your Habits</AppText>
        <Pressable onPress={onOpenHabits}>
          <AppText style={styles.sectionAction}>View All</AppText>
        </Pressable>
      </View>

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
          <AppText style={styles.loaderText}>Loading today habits...</AppText>
        </View>
      ) : todayHabits.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>No habits scheduled for today.</AppText>
          <AppText style={styles.emptySubtitle}>
            Add or plan habits to build your daily routine.
          </AppText>
          <Pressable style={styles.emptyActionButton} onPress={onOpenHabits}>
            <AppText style={styles.emptyActionText}>Open habits</AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {todayHabits.map((habit) => (
            <HomeHabitCard
              key={habit.id}
              habit={habit}
              colors={colors}
              styles={styles}
              isSaving={isSaving}
              onOpenHabit={onOpenHabitById}
              onToggleTodayCompletion={onToggleTodayCompletion}
            />
          ))}
        </View>
      )}
    </>
  );
}

