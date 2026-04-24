import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { HabitSummary } from "../model/types";

type HabitsSummaryStripProps = {
  summary: HabitSummary;
};

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.summaryItem}>
      <AppText style={styles.summaryValue}>{value}</AppText>
      <AppText style={styles.summaryLabel}>{label}</AppText>
    </View>
  );
}

export function HabitsSummaryStrip({ summary }: HabitsSummaryStripProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <SummaryItem label="Total" value={String(summary.total)} />
      <SummaryItem label="Helpful" value={String(summary.positive)} />
      <SummaryItem label="Harmful" value={String(summary.negative)} />
      <SummaryItem label="Completed today" value={String(summary.completedToday)} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 8,
    },
    summaryItem: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 6,
    },
    summaryValue: {
      color: colors.textPrimary,
      fontSize: 28,
      lineHeight: 32,
      fontVariant: ["tabular-nums"],
    },
    summaryLabel: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
      textAlign: "center",
    },
  });
}
