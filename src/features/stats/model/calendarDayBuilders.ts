import { addDays, formatLongDate, toDateKey } from "@entities/habit/model/date";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

import { buildDayGroupItems } from "./calendarDayGroupItems";
import { buildDayHabitItems } from "./calendarDayHabitItems";
import type { StatsCalendarCell, StatsDayDetails } from "./types";

export function buildDayDetails(habits: Habit[], groups: HabitGroup[], date: Date): StatsDayDetails {
  const dateKey = toDateKey(date);
  const dayHabits = buildDayHabitItems(habits, date, dateKey);
  const dayGroups = buildDayGroupItems(habits, groups, date, dateKey);

  return {
    dateKey,
    dateLabel: formatLongDate(date),
    habits: dayHabits.items,
    groups: dayGroups.items,
    scheduledHabitsCount: dayHabits.scheduledCount,
    completedHabitsCount: dayHabits.completedCount,
    scheduledGroupsCount: dayGroups.scheduledCount,
    completedGroupsCount: dayGroups.completedCount,
    totalLoggedValue: dayHabits.totalLoggedValue,
  };
}

export function resolveIntensityLevel(dayDetails: StatsDayDetails): StatsCalendarCell["intensityLevel"] {
  const hasAnyCompletion =
    dayDetails.completedHabitsCount > 0 || dayDetails.completedGroupsCount > 0;

  if (!hasAnyCompletion) {
    return 0;
  }

  const habitRate =
    dayDetails.scheduledHabitsCount > 0
      ? dayDetails.completedHabitsCount / dayDetails.scheduledHabitsCount
      : 0;
  const groupRate =
    dayDetails.scheduledGroupsCount > 0
      ? dayDetails.completedGroupsCount / dayDetails.scheduledGroupsCount
      : 0;
  const normalizedScore = Math.max(habitRate, groupRate);

  if (normalizedScore >= 1) {
    return 3;
  }

  if (normalizedScore >= 0.66) {
    return 2;
  }

  return 1;
}

export function buildDayDetailsRange(args: {
  habits: Habit[];
  groups: HabitGroup[];
  startDate: Date;
  days: number;
}): StatsDayDetails[] {
  return Array.from({ length: args.days }).map((_, index) =>
    buildDayDetails(args.habits, args.groups, addDays(args.startDate, index)),
  );
}
