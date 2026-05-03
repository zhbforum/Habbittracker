import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@entities/habit/model/constants";
import { toDateKey } from "@entities/habit/model/date";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

import {
  buildMonthLabel,
  buildSummaryRangeLabel,
  CALENDAR_GRID_DAYS,
  normalizeMonthDate,
  parseDateKey,
  resolveCalendarGridStart,
  resolveMonthEndDate,
  resolveSelectedDateKey,
  resolveSummaryPeriodStart,
  shiftMonth,
} from "./calendarDate";
import { buildDayDetails, resolveIntensityLevel } from "./calendarDayBuilders";
import { buildHeatmapWeeks } from "./calendarHeatmap";
import { buildPeriodSummary } from "./calendarSummary";
import type {
  StatsCalendarCell,
  StatsDayDetails,
  StatsMonthInsights,
  StatsSummaryRange,
} from "./types";

export function getStatsWeekdayLabels(): string[] {
  return WEEKDAY_ORDER.map((weekday) => WEEKDAY_LABELS[weekday]);
}

export { shiftMonth };

export function buildStatsMonthInsights(args: {
  habits: Habit[];
  groups: HabitGroup[];
  monthDate: Date;
  selectedDateKey: string | null;
  summaryRange: StatsSummaryRange;
  today?: Date;
}): StatsMonthInsights {
  const today = args.today ?? new Date();
  const monthDate = normalizeMonthDate(args.monthDate);
  const periodStartDate = resolveSummaryPeriodStart(monthDate, args.summaryRange);
  const periodEndDate = resolveMonthEndDate(monthDate);
  const gridStart = resolveCalendarGridStart(monthDate);
  const dayDetailsMap: Record<string, StatsDayDetails> = {};

  const calendarCells: StatsCalendarCell[] = Array.from({ length: CALENDAR_GRID_DAYS }).map(
    (_, index) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      const dayDetails = buildDayDetails(args.habits, args.groups, date);
      const dateKey = dayDetails.dateKey;

      dayDetailsMap[dateKey] = dayDetails;

      return {
        dateKey,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === monthDate.getMonth(),
        isToday: dateKey === toDateKey(today),
        scheduledHabitsCount: dayDetails.scheduledHabitsCount,
        completedHabitsCount: dayDetails.completedHabitsCount,
        scheduledGroupsCount: dayDetails.scheduledGroupsCount,
        completedGroupsCount: dayDetails.completedGroupsCount,
        intensityLevel: resolveIntensityLevel(dayDetails),
      };
    },
  );

  const resolvedSelectedDateKey = resolveSelectedDateKey(
    monthDate,
    args.selectedDateKey,
    dayDetailsMap,
    today,
  );
  const selectedDayDetails =
    dayDetailsMap[resolvedSelectedDateKey] ??
    (() => {
      const parsedSelectedDate = parseDateKey(resolvedSelectedDateKey);

      if (parsedSelectedDate) {
        return buildDayDetails(args.habits, args.groups, parsedSelectedDate);
      }

      return dayDetailsMap[toDateKey(monthDate)];
    })();

  return {
    monthLabel: buildMonthLabel(monthDate),
    summaryRangeLabel: buildSummaryRangeLabel(args.summaryRange),
    calendarCells,
    heatmapWeeks: buildHeatmapWeeks({
      habits: args.habits,
      groups: args.groups,
      endDate: periodEndDate,
      summaryRange: args.summaryRange,
      today,
    }),
    selectedDayDetails,
    summary: buildPeriodSummary({
      habits: args.habits,
      groups: args.groups,
      periodStartDate,
      periodEndDate,
    }),
  };
}

