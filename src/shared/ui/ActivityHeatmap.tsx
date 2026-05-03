import { Pressable, ScrollView, View } from "react-native";

import { useAppTheme } from "@/shared/theme";
import { AppText } from "./AppText";
import { createActivityHeatmapStyles } from "./ActivityHeatmap.styles";
import { getActivityHeatmapIntensityColor } from "./ActivityHeatmap.utils";

export type ActivityHeatmapCell = {
  key: string;
  intensityLevel: 0 | 1 | 2 | 3;
  isToday?: boolean;
};

export type ActivityHeatmapWeek = {
  key: string;
  monthLabel: string;
  cells: ActivityHeatmapCell[];
};

type ActivityHeatmapProps = {
  title: string;
  hint?: string;
  weeks: ActivityHeatmapWeek[];
  selectedCellKey?: string | null;
  onPressCell?: (cellKey: string) => void;
  showLegend?: boolean;
  containerStyle?: object;
};

export function ActivityHeatmap({
  title,
  hint,
  weeks,
  selectedCellKey = null,
  onPressCell,
  showLegend = true,
  containerStyle,
}: ActivityHeatmapProps) {
  const { colors } = useAppTheme();
  const styles = createActivityHeatmapStyles(colors);
  const isInteractive = typeof onPressCell === "function";

  return (
    <View style={[styles.card, containerStyle]}>
      <View style={styles.headerRow}>
        <AppText style={styles.title}>{title}</AppText>
        {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.weeksRow}>
          {weeks.map((week, weekIndex) => {
            const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
            const showMonthLabel =
              weekIndex === 0 || previousWeek?.monthLabel !== week.monthLabel;

            return (
              <View key={week.key} style={styles.weekColumn}>
                <View style={styles.monthLabelWrap}>
                  {showMonthLabel ? (
                    <AppText style={styles.monthLabel}>{week.monthLabel}</AppText>
                  ) : null}
                </View>

                {week.cells.map((cell) => {
                  const isSelected = cell.key === selectedCellKey;
                  const cellStyle = [
                    styles.cell,
                    {
                      backgroundColor: getActivityHeatmapIntensityColor(
                        cell.intensityLevel,
                        colors,
                      ),
                    },
                    cell.isToday && styles.cellToday,
                    isSelected && styles.cellSelected,
                  ];

                  if (isInteractive) {
                    return (
                      <Pressable
                        key={cell.key}
                        style={cellStyle}
                        onPress={() => onPressCell(cell.key)}
                      />
                    );
                  }

                  return <View key={cell.key} style={cellStyle} />;
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {showLegend ? (
        <View style={styles.legendRow}>
          <AppText style={styles.legendText}>Less</AppText>
          <View style={styles.legendDotsRow}>
            {[0, 1, 2, 3].map((level) => (
              <View
                key={`heat-level-${level}`}
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: getActivityHeatmapIntensityColor(
                      level as 0 | 1 | 2 | 3,
                      colors,
                    ),
                  },
                ]}
              />
            ))}
          </View>
          <AppText style={styles.legendText}>More</AppText>
        </View>
      ) : null}
    </View>
  );
}
