import { Animated, Pressable, View } from "react-native";
import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

import type { StatsCalendarCell } from "@features/stats/model/types";
import { getIntensityColor } from "@features/stats/model/view";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";
import type { ThemeColors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type StatsCalendarSectionProps = {
  styles: StatsScreenStyles;
  colors: ThemeColors;
  monthLabel: string;
  weekdayLabels: string[];
  calendarRows: StatsCalendarCell[][];
  selectedDateKey: string;
  monthContentStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  onSelectDate: (dateKey: string) => void;
  onGoToPreviousMonth: () => void;
  onGoToNextMonth: () => void;
  onJumpToToday: () => void;
};

export function StatsCalendarSection({
  styles,
  colors,
  monthLabel,
  weekdayLabels,
  calendarRows,
  selectedDateKey,
  monthContentStyle,
  onSelectDate,
  onGoToPreviousMonth,
  onGoToNextMonth,
  onJumpToToday,
}: StatsCalendarSectionProps) {
  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Pressable style={styles.monthNavButton} onPress={onGoToPreviousMonth}>
          <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.monthLabelWrap}>
          <AppText style={styles.monthTitle}>{monthLabel}</AppText>
          <Pressable style={styles.todayButton} onPress={onJumpToToday}>
            <CalendarCheck2 size={13} color={colors.accentText} strokeWidth={2.3} />
            <AppText style={styles.todayButtonText}>Today</AppText>
          </Pressable>
        </View>

        <Pressable style={styles.monthNavButton} onPress={onGoToNextMonth}>
          <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Animated.View style={[styles.monthContentWrap, monthContentStyle]}>
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <AppText style={styles.weekdayLabel}>{label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarRows.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.weekRow}>
              {week.map((cell) => {
                const isSelected = cell.dateKey === selectedDateKey;

                return (
                  <Pressable
                    key={cell.dateKey}
                    style={[
                      styles.dayCell,
                      !cell.isCurrentMonth && styles.dayCellOutsideMonth,
                      cell.isToday && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => onSelectDate(cell.dateKey)}
                  >
                    <AppText
                      style={[
                        styles.dayLabel,
                        !cell.isCurrentMonth && styles.dayLabelOutsideMonth,
                        isSelected && styles.dayLabelSelected,
                      ]}
                    >
                      {cell.dayOfMonth}
                    </AppText>

                    <View style={styles.dayMarksRow}>
                      <View
                        style={[
                          styles.dayMarkDot,
                          {
                            backgroundColor: getIntensityColor(
                              cell.intensityLevel,
                              colors,
                            ),
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.dayMarkRing,
                          cell.completedGroupsCount > 0 && styles.dayMarkRingDone,
                        ]}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.dayMarkDot,
                { backgroundColor: getIntensityColor(2, colors) },
              ]}
            />
            <AppText style={styles.legendText}>Habit completion</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dayMarkRing, styles.dayMarkRingDone]} />
            <AppText style={styles.legendText}>Group goal reached</AppText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
