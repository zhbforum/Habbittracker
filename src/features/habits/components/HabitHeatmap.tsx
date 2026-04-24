import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { WEEKDAY_SHORT_LABELS } from "../model/constants";
import { toDateKey } from "../model/date";
import type { HabitHeatmapWeek } from "../model/types";

type HabitHeatmapProps = {
  weeks: HabitHeatmapWeek[];
};

const CELL_SIZE = 12;
const CELL_GAP = 4;
const DEFAULT_WEEK_ROWS = 7;

export function HabitHeatmap({ weeks }: HabitHeatmapProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const todayDateKey = toDateKey(new Date());
  const rowsCount = weeks[0]?.cells.length ?? DEFAULT_WEEK_ROWS;
  const gridHeight = rowsCount * CELL_SIZE + (rowsCount - 1) * CELL_GAP;
  const weekColumnsWidth = weeks.length * CELL_SIZE + Math.max(0, weeks.length - 1) * CELL_GAP;

  const { consistencyPercent, weeklyCompletionTrend } = useMemo(() => {
    const allCells = weeks.flatMap((week) => week.cells);
    const scheduledCells = allCells.filter((cell) => cell.scheduled);
    const completedCells = allCells.filter((cell) => cell.completed);

    const completionRatio =
      scheduledCells.length > 0 ? completedCells.length / scheduledCells.length : 0;

    return {
      consistencyPercent: Math.round(completionRatio * 100),
      weeklyCompletionTrend: weeks.map((week) => {
        const scheduledCount = week.cells.filter((cell) => cell.scheduled).length;
        const completedCount = week.cells.filter((cell) => cell.completed).length;

        return scheduledCount > 0 ? completedCount / scheduledCount : 0;
      }),
    };
  }, [weeks]);
  const trendPreview = weeklyCompletionTrend.slice(-12);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.title}>Activity heatmap</AppText>
        <View style={styles.consistencyPill}>
          <AppText style={styles.consistencyPillText}>{consistencyPercent}% consistent</AppText>
        </View>
      </View>

      <View style={styles.trendRow}>
        {trendPreview.map((ratio, index) => (
          <View key={`trend-${index}`} style={styles.trendBarTrack}>
            <View
              style={[
                styles.trendBarFill,
                {
                  width: `${Math.max(8, Math.round(ratio * 100))}%`,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.contentRow}>
        <View style={[styles.weekdayColumn, { height: gridHeight }]}>
          <AppText style={styles.weekdayLabel}>{WEEKDAY_SHORT_LABELS[1]}</AppText>
          <AppText style={styles.weekdayLabel}>{WEEKDAY_SHORT_LABELS[3]}</AppText>
          <AppText style={styles.weekdayLabel}>{WEEKDAY_SHORT_LABELS[5]}</AppText>
          <AppText style={styles.weekdayLabel}>{WEEKDAY_SHORT_LABELS[0]}</AppText>
        </View>

        <ScrollView
          horizontal
          style={styles.gridScroll}
          contentContainerStyle={styles.gridScrollContent}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.gridWrap}>
            <View style={styles.grid}>
              {weeks.map((week, index) => (
                <View key={`${week.weekLabel}-${index}`} style={styles.weekColumn}>
                  {week.cells.map((cell) => (
                    <View
                      key={cell.dateKey}
                      style={[
                        styles.cell,
                        cell.level === 2
                          ? styles.cellDone
                          : cell.level === 1
                            ? styles.cellScheduled
                            : styles.cellEmpty,
                        cell.dateKey === todayDateKey && styles.cellToday,
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>

            <View style={[styles.monthRow, { width: weekColumnsWidth }]}>
              <AppText style={styles.monthLabel}>{weeks[0]?.weekLabel ?? ""}</AppText>
              <AppText style={styles.monthLabel}>
                {weeks[weeks.length - 1]?.weekLabel ?? ""}
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.cellEmpty]} />
          <AppText style={styles.legendText}>No schedule</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.cellScheduled]} />
          <AppText style={styles.legendText}>Scheduled</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.cellDone]} />
          <AppText style={styles.legendText}>Completed</AppText>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      marginTop: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    consistencyPill: {
      minHeight: 26,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    consistencyPillText: {
      color: colors.successText,
      fontSize: 11,
      lineHeight: 14,
    },
    trendRow: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 4,
    },
    trendBarTrack: {
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    trendBarFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accentText,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    weekdayColumn: {
      minWidth: 14,
      justifyContent: "space-between",
      alignItems: "center",
    },
    weekdayLabel: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 12,
      textAlign: "center",
    },
    gridScroll: {
      flex: 1,
    },
    gridScrollContent: {
      paddingRight: 2,
    },
    gridWrap: {
      alignSelf: "flex-start",
      gap: 6,
    },
    grid: {
      flexDirection: "row",
      gap: CELL_GAP,
      alignSelf: "flex-start",
    },
    weekColumn: {
      gap: CELL_GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 3,
      borderWidth: 1,
    },
    cellEmpty: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    cellScheduled: {
      borderColor: colors.accentPrimary,
      backgroundColor: colors.accentSecondary,
    },
    cellDone: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successText,
      shadowColor: colors.successText,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 2,
    },
    cellToday: {
      borderColor: colors.accentText,
    },
    monthRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    monthLabel: {
      color: colors.textMuted,
      fontSize: 9,
      lineHeight: 12,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 3,
      borderWidth: 1,
    },
    legendText: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 14,
    },
  });
}
