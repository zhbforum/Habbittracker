import { WEEKDAY_ORDER } from "@entities/habit/model/constants";
import { addDays, startOfWeek, toDateKey } from "@entities/habit/model/date";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

import { buildDayDetails, resolveIntensityLevel } from "./calendarDayBuilders";
import type { StatsHeatmapCell, StatsHeatmapWeek, StatsSummaryRange } from "./types";

function resolveHeatmapWeekCount(summaryRange: StatsSummaryRange): number {
  if (summaryRange === "month") {
    return 12;
  }

  if (summaryRange === "three_months") {
    return 18;
  }

  return 53;
}

export function buildHeatmapWeeks(args: {
  habits: Habit[];
  groups: HabitGroup[];
  endDate: Date;
  summaryRange: StatsSummaryRange;
  today: Date;
}): StatsHeatmapWeek[] {
  const weekCount = resolveHeatmapWeekCount(args.summaryRange);
  const totalDays = weekCount * 7;
  const gridEnd = startOfWeek(args.endDate);
  const gridStart = addDays(gridEnd, -(totalDays - 7));
  const weeks: StatsHeatmapWeek[] = [];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const weekStart = addDays(gridStart, weekIndex * 7);
    const cells: StatsHeatmapCell[] = WEEKDAY_ORDER.map((weekdayOffset) => {
      const date = addDays(weekStart, weekdayOffset === 0 ? 6 : weekdayOffset - 1);
      const dayDetails = buildDayDetails(args.habits, args.groups, date);
      const dateKey = dayDetails.dateKey;
      const scheduledTotal = dayDetails.scheduledHabitsCount + dayDetails.scheduledGroupsCount;
      const completedTotal = dayDetails.completedHabitsCount + dayDetails.completedGroupsCount;
      const completionRatePercent =
        scheduledTotal <= 0 ? 0 : Math.round((completedTotal / scheduledTotal) * 100);

      return {
        dateKey,
        dayIndex: weekdayOffset,
        intensityLevel: resolveIntensityLevel(dayDetails),
        isToday: dateKey === toDateKey(args.today),
        completionRatePercent,
      };
    });

    weeks.push({
      weekLabel: toDateKey(weekStart),
      monthLabel: weekStart.toLocaleDateString("en-US", { month: "short" }),
      cells,
    });
  }

  return weeks;
}

