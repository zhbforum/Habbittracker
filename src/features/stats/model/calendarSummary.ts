import { isHabitCompletedForDate, isHabitScheduledOnDate } from "@entities/habit/model/analytics";
import { WEEKDAY_LABELS } from "@entities/habit/model/constants";
import { addDays } from "@entities/habit/model/date";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

import { buildDayDetails } from "./calendarDayBuilders";
import type { StatsMonthSummary } from "./types";

function buildBestHabitStreakForPeriod(
  habit: Habit,
  periodStartDate: Date,
  periodEndDate: Date,
): number {
  let best = 0;
  let current = 0;
  let cursor = new Date(periodStartDate);

  while (cursor <= periodEndDate) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    if (isHabitCompletedForDate(habit, cursor)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }

    cursor = addDays(cursor, 1);
  }

  return best;
}

export function buildPeriodSummary(args: {
  habits: Habit[];
  groups: HabitGroup[];
  periodStartDate: Date;
  periodEndDate: Date;
}): StatsMonthSummary {
  const { habits, groups, periodStartDate, periodEndDate } = args;
  let scheduledHabitsCount = 0;
  let completedHabitsCount = 0;
  let activeDaysCount = 0;
  let groupWinsCount = 0;
  let perfectDaysCount = 0;
  let totalLoggedValue = 0;
  const weekdayTotals = {} as Record<number, { completed: number; scheduled: number }>;
  let cursor = new Date(periodStartDate);

  while (cursor <= periodEndDate) {
    const dayDetails = buildDayDetails(habits, groups, cursor);
    scheduledHabitsCount += dayDetails.scheduledHabitsCount;
    completedHabitsCount += dayDetails.completedHabitsCount;
    totalLoggedValue += dayDetails.totalLoggedValue;

    if (dayDetails.completedHabitsCount > 0) {
      activeDaysCount += 1;
    }

    if (
      dayDetails.scheduledHabitsCount > 0 &&
      dayDetails.completedHabitsCount >= dayDetails.scheduledHabitsCount
    ) {
      perfectDaysCount += 1;
    }

    if (dayDetails.completedGroupsCount > 0) {
      groupWinsCount += 1;
    }

    const weekday = cursor.getDay();
    const previous = weekdayTotals[weekday] ?? { completed: 0, scheduled: 0 };

    weekdayTotals[weekday] = {
      completed: previous.completed + dayDetails.completedHabitsCount,
      scheduled: previous.scheduled + dayDetails.scheduledHabitsCount,
    };

    cursor = addDays(cursor, 1);
  }

  const completionRatePercent =
    scheduledHabitsCount === 0 ? 0 : Math.round((completedHabitsCount / scheduledHabitsCount) * 100);
  const bestStreak = habits.reduce((best, habit) => {
    const streak = buildBestHabitStreakForPeriod(habit, periodStartDate, periodEndDate);
    return Math.max(best, streak);
  }, 0);

  const strongestWeekday = Object.entries(weekdayTotals).reduce<{
    weekday: number;
    rate: number;
    hasData: boolean;
  }>(
    (best, [weekdayValue, totals]) => {
      const weekday = Number(weekdayValue);

      if (totals.scheduled <= 0) {
        return best;
      }

      const rate = totals.completed / totals.scheduled;

      if (!best.hasData || rate > best.rate) {
        return {
          weekday,
          rate,
          hasData: true,
        };
      }

      return best;
    },
    {
      weekday: -1,
      rate: 0,
      hasData: false,
    },
  );

  const totalDaysInPeriod =
    Math.floor((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  return {
    completionRatePercent,
    activeDaysCount,
    bestStreak,
    groupWinsCount,
    perfectDaysCount,
    strongestWeekdayLabel:
      strongestWeekday.hasData && strongestWeekday.weekday in WEEKDAY_LABELS
        ? WEEKDAY_LABELS[strongestWeekday.weekday as keyof typeof WEEKDAY_LABELS]
        : "No data",
    strongestWeekdayRatePercent: strongestWeekday.hasData ? Math.round(strongestWeekday.rate * 100) : 0,
    totalLoggedValue: Math.round(totalLoggedValue * 100) / 100,
    averageDailyLoggedValue:
      totalDaysInPeriod <= 0 ? 0 : Math.round((totalLoggedValue / totalDaysInPeriod) * 100) / 100,
  };
}

