import { Animated, Pressable, View } from "react-native";
import {
  CalendarCheck2,
  Flame,
  Sparkles,
  Target,
} from "lucide-react-native";

import type { StatsSummaryRange } from "@features/stats/model/types";
import { SUMMARY_RANGE_OPTIONS } from "@features/stats/model/view";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";
import type { ThemeColors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type StatsOverviewSectionProps = {
  styles: StatsScreenStyles;
  colors: ThemeColors;
  summaryRange: StatsSummaryRange;
  summaryRangeLabel: string;
  monthSummary: {
    completionRatePercent: number;
    activeDaysCount: number;
    bestStreak: number;
    groupWinsCount: number;
    perfectDaysCount: number;
    strongestWeekdayLabel: string;
    strongestWeekdayRatePercent: number;
    totalLoggedValue: number;
    averageDailyLoggedValue: number;
  };
  summaryContentStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  onSelectSummaryRange: (range: StatsSummaryRange) => void;
};

export function StatsOverviewSection({
  styles,
  colors,
  summaryRange,
  summaryRangeLabel,
  monthSummary,
  summaryContentStyle,
  onSelectSummaryRange,
}: StatsOverviewSectionProps) {
  return (
    <>
      <View style={styles.headerBlock}>
        <AppText style={styles.title}>Stats</AppText>
        <AppText style={styles.subtitle}>
          Calendar-first insights to understand your rhythm and keep your streaks stable.
        </AppText>
      </View>

      <View style={styles.summaryRangeRow}>
        {SUMMARY_RANGE_OPTIONS.map((option) => {
          const isActive = option.id === summaryRange;

          return (
            <Pressable
              key={option.id}
              style={[styles.summaryRangeButton, isActive && styles.summaryRangeButtonActive]}
              onPress={() => onSelectSummaryRange(option.id)}
            >
              <AppText
                style={[
                  styles.summaryRangeButtonText,
                  isActive && styles.summaryRangeButtonTextActive,
                ]}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText style={styles.summaryRangeMetaText}>{summaryRangeLabel}</AppText>

      <Animated.View style={summaryContentStyle}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryValue}>
              {monthSummary.completionRatePercent}%
            </AppText>
            <AppText style={styles.summaryLabel}>Completion rate</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryValue}>{monthSummary.activeDaysCount}</AppText>
            <AppText style={styles.summaryLabel}>Active days</AppText>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryInlineValue}>
              <Flame size={15} color={colors.accentText} strokeWidth={2.2} />
              <AppText style={styles.summaryValue}>{monthSummary.bestStreak}d</AppText>
            </View>
            <AppText style={styles.summaryLabel}>Best streak</AppText>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryInlineValue}>
              <Target size={15} color={colors.accentText} strokeWidth={2.2} />
              <AppText style={styles.summaryValue}>{monthSummary.groupWinsCount}</AppText>
            </View>
            <AppText style={styles.summaryLabel}>Group wins</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryValue}>{monthSummary.totalLoggedValue}</AppText>
            <AppText style={styles.summaryLabel}>Logged value</AppText>
          </View>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryValue}>
              {monthSummary.averageDailyLoggedValue}
            </AppText>
            <AppText style={styles.summaryLabel}>Daily avg value</AppText>
          </View>
        </View>

        <View style={styles.insightsRow}>
          <View style={styles.insightChip}>
            <Sparkles size={13} color={colors.accentText} strokeWidth={2.3} />
            <AppText style={styles.insightChipText}>
              Perfect days: {monthSummary.perfectDaysCount}
            </AppText>
          </View>
          <View style={styles.insightChip}>
            <CalendarCheck2 size={13} color={colors.accentText} strokeWidth={2.3} />
            <AppText style={styles.insightChipText}>
              Strongest day: {monthSummary.strongestWeekdayLabel}{" "}
              {monthSummary.strongestWeekdayRatePercent}%
            </AppText>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
