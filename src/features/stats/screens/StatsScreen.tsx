import { StatusBar } from "expo-status-bar";
import { Animated, Pressable, ScrollView, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@shared/navigation/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import { ActivityHeatmap } from "@features/stats/components/ActivityHeatmap";
import { StatsCalendarSection } from "@features/stats/components/StatsCalendarSection";
import { StatsDayDetailsSection } from "@features/stats/components/StatsDayDetailsSection";
import { StatsOverviewSection } from "@features/stats/components/StatsOverviewSection";
import { useStatsScreenAnimations } from "@features/stats/hooks/useStatsScreenAnimations";
import { useStatsScreenController } from "@features/stats/hooks/useStatsScreenController";
import {
  chunkByWeek,
  createAppearStyle,
  filterDayGroupsByStatus,
  filterDayHabitsByStatus,
  getCompletedCountLabel,
  type DayDetailsFilter,
  toActivityHeatmapWeeks,
} from "@features/stats/model/view";
import { createStatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";

type StatsScreenProps = {
  user: User;
};

export default function StatsScreen({ user }: StatsScreenProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createStatsScreenStyles(colors);
  const {
    isLoading,
    errorMessage,
    activeTab,
    handleTabPress,
    weekdayLabels,
    monthLabel,
    summaryRange,
    summaryRangeLabel,
    calendarCells,
    heatmapWeeks,
    selectedDateKey,
    selectedDayDetails,
    monthSummary,
    setSummaryRange,
    selectDate,
    goToPreviousMonth,
    goToNextMonth,
    jumpToToday,
    openHabitById,
    openGroupById,
    reload,
  } = useStatsScreenController({ user });
  const [detailsFilter, setDetailsFilter] = useState<DayDetailsFilter>("all");

  const {
    headerAnim,
    calendarAnim,
    detailsAnim,
    monthContentStyle,
    summaryContentStyle,
    dayContentStyle,
  } = useStatsScreenAnimations({
    monthLabel,
    summaryRange,
    selectedDayDateKey: selectedDayDetails.dateKey,
    detailsFilter,
  });

  const filteredHabits = useMemo(
    () => filterDayHabitsByStatus(selectedDayDetails.habits, detailsFilter),
    [detailsFilter, selectedDayDetails.habits],
  );
  const filteredGroups = useMemo(
    () => filterDayGroupsByStatus(selectedDayDetails.groups, detailsFilter),
    [detailsFilter, selectedDayDetails.groups],
  );
  const calendarRows = useMemo(() => chunkByWeek(calendarCells), [calendarCells]);
  const activityHeatmapWeeks = useMemo(() => toActivityHeatmapWeeks(heatmapWeeks), [heatmapWeeks]);
  const completedCountLabel = getCompletedCountLabel(selectedDayDetails, detailsFilter);
  const selectedDayLoggedValue = Math.round(selectedDayDetails.totalLoggedValue * 100) / 100;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={createAppearStyle(headerAnim)}>
              <StatsOverviewSection
                styles={styles}
                colors={colors}
                summaryRange={summaryRange}
                summaryRangeLabel={summaryRangeLabel}
                monthSummary={monthSummary}
                summaryContentStyle={summaryContentStyle}
                onSelectSummaryRange={setSummaryRange}
              />
            </Animated.View>

            <Animated.View style={createAppearStyle(calendarAnim)}>
              <StatsCalendarSection
                styles={styles}
                colors={colors}
                monthLabel={monthLabel}
                weekdayLabels={weekdayLabels}
                calendarRows={calendarRows}
                selectedDateKey={selectedDateKey}
                monthContentStyle={monthContentStyle}
                onSelectDate={selectDate}
                onGoToPreviousMonth={goToPreviousMonth}
                onGoToNextMonth={goToNextMonth}
                onJumpToToday={jumpToToday}
              />
            </Animated.View>

            <ActivityHeatmap
              title="Activity Heatmap"
              hint="Tap day"
              weeks={activityHeatmapWeeks}
              selectedCellKey={selectedDateKey}
              onPressCell={selectDate}
            />

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <AppText style={styles.errorText}>{errorMessage}</AppText>
                <Pressable style={styles.retryButton} onPress={reload}>
                  <AppText style={styles.retryButtonText}>Retry</AppText>
                </Pressable>
              </View>
            ) : null}

            <Animated.View style={createAppearStyle(detailsAnim)}>
              <StatsDayDetailsSection
                styles={styles}
                colors={colors}
                selectedDayDetails={selectedDayDetails}
                selectedDayLoggedValue={selectedDayLoggedValue}
                detailsFilter={detailsFilter}
                completedCountLabel={completedCountLabel}
                isLoading={isLoading}
                filteredHabits={filteredHabits}
                filteredGroups={filteredGroups}
                dayContentStyle={dayContentStyle}
                onSelectFilter={setDetailsFilter}
                onOpenHabitById={openHabitById}
                onOpenGroupById={openGroupById}
              />
            </Animated.View>
          </ScrollView>
        </View>
        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );
}

