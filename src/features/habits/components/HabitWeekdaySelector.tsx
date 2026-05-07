import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { WEEKDAY_ORDER, WEEKDAY_SHORT_LABELS } from "../model/constants";
import type { HabitWeekday } from "../model/types";

type HabitWeekdaySelectorProps = {
  selectedWeekdays: readonly HabitWeekday[];
  onToggleWeekday: (weekday: HabitWeekday) => void;
};

export function HabitWeekdaySelector({
  selectedWeekdays,
  onToggleWeekday,
}: HabitWeekdaySelectorProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.weekdayRow}>
      {WEEKDAY_ORDER.map((weekday) => {
        const isSelected = selectedWeekdays.includes(weekday);

        return (
          <Pressable
            key={weekday}
            testID={`habit-weekday-${weekday}`}
            style={[styles.weekdayButton, isSelected && styles.weekdayButtonActive]}
            onPress={() => onToggleWeekday(weekday)}
          >
            <AppText style={[styles.weekdayText, isSelected && styles.weekdayTextActive]}>
              {WEEKDAY_SHORT_LABELS[weekday]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    weekdayRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    weekdayButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    weekdayButtonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    weekdayText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    weekdayTextActive: {
      color: colors.textPrimary,
    },
  });
}
