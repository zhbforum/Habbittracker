import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { getHabitIconById, getHabitIconColorById } from "@features/habits/model/icons";
import type { HabitWithMetrics } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitGroupEditorSheetStyles } from "./HabitGroupEditorSheet.styles";

type HabitGroupHabitSelectorListProps = {
  availableHabits: HabitWithMetrics[];
  selectedHabitIds: string[];
  styles: HabitGroupEditorSheetStyles;
  colors: ThemeColors;
  onToggleHabit: (habitId: string) => void;
};

export function HabitGroupHabitSelectorList({
  availableHabits,
  selectedHabitIds,
  styles,
  colors,
  onToggleHabit,
}: HabitGroupHabitSelectorListProps) {
  if (availableHabits.length === 0) {
    return (
      <View style={styles.noHabitsCard}>
        <AppText style={styles.noHabitsText}>Add habits first to build a group.</AppText>
      </View>
    );
  }

  return (
    <>
      {availableHabits.map((habit) => {
        const isSelected = selectedHabitIds.includes(habit.id);
        const HabitIcon = getHabitIconById(habit.iconId);
        const iconColor = getHabitIconColorById(habit.iconColorId);

        return (
          <Pressable
            key={habit.id}
            style={[
              styles.habitSelectCard,
              isSelected && styles.habitSelectCardActive,
            ]}
            onPress={() => onToggleHabit(habit.id)}
          >
            <View style={styles.habitIconWrap}>
              <HabitIcon size={18} color={iconColor} strokeWidth={2.2} />
            </View>
            <View style={styles.habitIdentityWrap}>
              <AppText style={styles.habitName}>{habit.name}</AppText>
              <AppText style={styles.habitMeta}>
                {habit.metrics.completedToday ? "Completed today" : "Not done yet"}
              </AppText>
            </View>
            <View
              style={[
                styles.checkWrap,
                isSelected && styles.checkWrapActive,
              ]}
            >
              {isSelected ? (
                <Check size={14} color={colors.successText} strokeWidth={2.4} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </>
  );
}
