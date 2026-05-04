import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getErrorMessage } from "@/shared/lib";
import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";
import { routes } from "@/shared/navigation/routes";
import { showErrorToast } from "@/shared/ui";

import { fetchHabitGroupsForUser } from "@entities/habit/api/habitGroupStorage";
import { fetchHabitsForUser } from "@entities/habit/api/habitStorage";
import type { Habit, HabitGroup } from "@entities/habit/model/types";
import { toDateKey } from "@entities/habit/model/date";

import { buildStatsMonthInsights, getStatsWeekdayLabels, shiftMonth } from "../model/calendar";
import type { StatsSummaryRange } from "../model/types";

type UseStatsScreenControllerArgs = {
  user: User;
};

function buildShiftedDateKey(baseDateKey: string, targetMonthDate: Date): string {
  const [, , dayPart] = baseDateKey.split("-");
  const requestedDay = Number(dayPart) || 1;
  const maxDay = new Date(
    targetMonthDate.getFullYear(),
    targetMonthDate.getMonth() + 1,
    0,
  ).getDate();

  return toDateKey(
    new Date(
      targetMonthDate.getFullYear(),
      targetMonthDate.getMonth(),
      Math.min(requestedDay, maxDay),
    ),
  );
}

export function useStatsScreenController({ user }: UseStatsScreenControllerArgs) {
  const router = useRouter();
  const { activeTab, handleTabPress } = useHomeFooterNavigation("stats");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<HabitGroup[]>([]);
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [summaryRange, setSummaryRange] = useState<StatsSummaryRange>("month");
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const hasLoadedRef = useRef(false);

  const loadStatsData = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const [loadedHabits, loadedGroups] = await Promise.all([
          fetchHabitsForUser(user.id),
          fetchHabitGroupsForUser(user.id),
        ]);

        setHabits(loadedHabits);
        setGroups(loadedGroups);
      } catch (error) {
        const message = getErrorMessage(error, "Unable to load stats.");
        setErrorMessage(message);
        showErrorToast("Unable to load stats", message);
      } finally {
        setIsLoading(false);
      }
    },
    [user.id],
  );

  useFocusEffect(
    useCallback(() => {
      const shouldShowLoader = !hasLoadedRef.current;
      hasLoadedRef.current = true;
      void loadStatsData(shouldShowLoader);
    }, [loadStatsData]),
  );

  const openHabits = useCallback(() => {
    router.replace(routes.habits);
  }, [router]);

  const openHabitById = useCallback(
    (habitId: string) => {
      if (!habitId.trim()) {
        return;
      }

      router.push(`${routes.habits}?habitId=${encodeURIComponent(habitId)}`);
    },
    [router],
  );

  const openGroupById = useCallback(
    (groupId: string) => {
      if (!groupId.trim()) {
        return;
      }

      router.push(`${routes.habits}?groupId=${encodeURIComponent(groupId)}`);
    },
    [router],
  );

  const goToPreviousMonth = useCallback(() => {
    setMonthDate((currentMonthDate) => {
      const nextMonthDate = shiftMonth(currentMonthDate, -1);
      setSelectedDateKey((currentDateKey) =>
        buildShiftedDateKey(currentDateKey, nextMonthDate),
      );
      return nextMonthDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonthDate((currentMonthDate) => {
      const nextMonthDate = shiftMonth(currentMonthDate, 1);
      setSelectedDateKey((currentDateKey) =>
        buildShiftedDateKey(currentDateKey, nextMonthDate),
      );
      return nextMonthDate;
    });
  }, []);

  const jumpToToday = useCallback(() => {
    const today = new Date();
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(toDateKey(today));
  }, []);

  const weekdayLabels = useMemo(() => getStatsWeekdayLabels(), []);
  const insights = useMemo(
    () =>
      buildStatsMonthInsights({
        habits,
        groups,
        monthDate,
        selectedDateKey,
        summaryRange,
        today: new Date(),
      }),
    [groups, habits, monthDate, selectedDateKey, summaryRange],
  );

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      activeTab,
      handleTabPress,
      weekdayLabels,
      monthDate,
      summaryRange,
      summaryRangeLabel: insights.summaryRangeLabel,
      selectedDateKey: insights.selectedDayDetails.dateKey,
      monthLabel: insights.monthLabel,
      calendarCells: insights.calendarCells,
      heatmapWeeks: insights.heatmapWeeks,
      selectedDayDetails: insights.selectedDayDetails,
      monthSummary: insights.summary,
      setSummaryRange,
      selectDate: setSelectedDateKey,
      goToPreviousMonth,
      goToNextMonth,
      jumpToToday,
      openHabits,
      openHabitById,
      openGroupById,
      reload: () => loadStatsData(true),
    }),
    [
      activeTab,
      errorMessage,
      goToNextMonth,
      goToPreviousMonth,
      handleTabPress,
      insights.calendarCells,
      insights.heatmapWeeks,
      insights.monthLabel,
      insights.summaryRangeLabel,
      insights.selectedDayDetails,
      insights.summary,
      isLoading,
      jumpToToday,
      loadStatsData,
      monthDate,
      summaryRange,
      openGroupById,
      openHabitById,
      openHabits,
      weekdayLabels,
    ],
  );
}


