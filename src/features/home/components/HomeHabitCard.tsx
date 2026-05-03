import { Check, Flame } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";

import { getHabitIconById, getHabitIconColorById } from "@entities/habit/model/icons";
import type { HabitWithMetrics } from "@entities/habit/model/types";
import type { HomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

type HomeHabitCardProps = {
  habit: HabitWithMetrics;
  colors: ThemeColors;
  styles: HomeScreenStyles;
  isSaving: boolean;
  onOpenHabit: (habitId: string) => void;
  onToggleTodayCompletion: (habitId: string) => void;
};

export function HomeHabitCard({
  habit,
  colors,
  styles,
  isSaving,
  onOpenHabit,
  onToggleTodayCompletion,
}: HomeHabitCardProps) {
  const Icon = getHabitIconById(habit.iconId);
  const iconColor = getHabitIconColorById(habit.iconColorId);
  const streakLabel = `${habit.metrics.currentStreak} day streak`;
  const goalLabel = `${Math.round(habit.metrics.goalProgress.currentValue * 100) / 100}/${habit.metrics.goalProgress.target} ${habit.goal.unit}`;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardGlowOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(
    new Animated.Value(habit.metrics.completedToday ? 1 : 0),
  ).current;
  const previousCompletedRef = useRef(habit.metrics.completedToday);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const wasCompleted = previousCompletedRef.current;
    const isCompleted = habit.metrics.completedToday;
    previousCompletedRef.current = isCompleted;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      circleScale.setValue(1);
      cardScale.setValue(1);
      cardGlowOpacity.setValue(0);
      checkOpacity.setValue(isCompleted ? 1 : 0);
      return;
    }

    if (isCompleted && !wasCompleted) {
      cardScale.setValue(1);
      cardGlowOpacity.setValue(0);
      circleScale.setValue(0.94);
      checkOpacity.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(cardScale, {
            toValue: 1.018,
            duration: 130,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 7,
            tension: 170,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(cardGlowOpacity, {
            toValue: 1,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(cardGlowOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(circleScale, {
          toValue: 1,
          friction: 6,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (!isCompleted && wasCompleted) {
      Animated.parallel([
        Animated.timing(checkOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    cardGlowOpacity,
    cardScale,
    checkOpacity,
    circleScale,
    habit.metrics.completedToday,
  ]);

  return (
    <Animated.View style={[styles.habitCard, { transform: [{ scale: cardScale }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.habitCardGlow, { opacity: cardGlowOpacity }]}
      />
      <Pressable style={styles.habitMainPress} onPress={() => onOpenHabit(habit.id)}>
        <View style={styles.habitIconWrap}>
          <Icon size={24} color={iconColor} strokeWidth={2.2} />
        </View>

        <View style={styles.habitIdentityWrap}>
          <AppText style={styles.habitName}>{habit.name}</AppText>
          <View style={styles.streakWrap}>
            <Flame size={14} color={colors.accentText} strokeWidth={2.1} />
            <AppText style={styles.streakText}>{streakLabel}</AppText>
          </View>
          <AppText style={styles.habitGoalText}>
            Goal: {goalLabel} ({habit.metrics.goalProgress.periodLabel.toLowerCase()})
          </AppText>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.completeCircle,
          habit.metrics.completedToday && styles.completeCircleDone,
        ]}
        onPress={() => onToggleTodayCompletion(habit.id)}
        disabled={isSaving}
      >
        <Animated.View style={{ transform: [{ scale: circleScale }] }}>
          <Animated.View style={{ opacity: checkOpacity }}>
            <Check size={26} color={colors.successText} strokeWidth={2.6} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

