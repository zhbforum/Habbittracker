import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { HabitWeeklyPerformanceDay } from "../model/types";

type WeeklyPerformanceChartProps = {
  days: HabitWeeklyPerformanceDay[];
};

export function WeeklyPerformanceChart({ days }: WeeklyPerformanceChartProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>Weekly performance</AppText>
      <View style={styles.chartRow}>
        {days.map((day) => {
          const fillHeight = day.completed ? "100%" : day.scheduled ? "22%" : "8%";

          return (
            <View key={day.dateKey} style={styles.dayColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    day.completed
                      ? styles.barFillCompleted
                      : day.scheduled
                        ? styles.barFillPending
                        : styles.barFillMuted,
                    { height: fillHeight },
                  ]}
                />
              </View>

              <AppText style={styles.dayLabel}>{day.label}</AppText>
              <AppText style={styles.dayDateLabel}>{day.dayOfMonthLabel}</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      marginBottom: 10,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
    },
    dayColumn: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    barTrack: {
      width: "100%",
      maxWidth: 22,
      height: 52,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    barFill: {
      width: "100%",
    },
    barFillCompleted: {
      backgroundColor: colors.successText,
    },
    barFillPending: {
      backgroundColor: colors.accentPrimary,
    },
    barFillMuted: {
      backgroundColor: colors.border,
    },
    dayLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
    },
    dayDateLabel: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 12,
    },
  });
}
