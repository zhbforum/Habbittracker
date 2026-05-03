import { isHabitCompletedForDate, isHabitScheduledOnDate } from "@entities/habit/model/analytics";
import { isDateKeyValid } from "./calendarDate";
import type { Habit, HabitGroup } from "@entities/habit/model/types";
import type { StatsDayGroupItem } from "./types";

function isDateKeyInRange(dateKey: string, startDateKey: string, endDateKey: string): boolean {
  if (!isDateKeyValid(startDateKey) || !isDateKeyValid(endDateKey)) {
    return true;
  }

  return dateKey >= startDateKey && dateKey <= endDateKey;
}

function isGroupScheduledOnDate(group: HabitGroup, date: Date, dateKey: string): boolean {
  const withinDateRange = isDateKeyInRange(dateKey, group.startDate, group.endDate);

  if (!withinDateRange) {
    return false;
  }

  if (group.frequency === "daily") {
    return true;
  }

  if (group.frequency === "weekly") {
    return group.weeklyWeekday === date.getDay();
  }

  return group.customWeekdays.includes(date.getDay() as typeof group.customWeekdays[number]);
}

export function buildDayGroupItems(
  habits: Habit[],
  groups: HabitGroup[],
  date: Date,
  dateKey: string,
): {
  items: StatsDayGroupItem[];
  scheduledCount: number;
  completedCount: number;
} {
  let scheduledCount = 0;
  let completedCount = 0;

  const items = groups
    .map<StatsDayGroupItem | null>((group) => {
      const isScheduled = isGroupScheduledOnDate(group, date, dateKey);

      if (!isScheduled) {
        return null;
      }

      const memberHabits = habits.filter((habit) => group.habitIds.includes(habit.id));
      const scheduledMemberHabits = memberHabits.filter((habit) =>
        isHabitScheduledOnDate(habit, date),
      );
      const completedHabitsCount = scheduledMemberHabits.filter((habit) =>
        isHabitCompletedForDate(habit, date),
      ).length;
      const targetCount =
        scheduledMemberHabits.length === 0 ? 0 : Math.min(group.dailyGoal, scheduledMemberHabits.length);
      const isCompleted = targetCount > 0 && completedHabitsCount >= targetCount;

      scheduledCount += 1;

      if (isCompleted) {
        completedCount += 1;
      }

      return {
        id: group.id,
        name: group.name,
        iconId: group.iconId,
        isScheduled,
        isCompleted,
        targetCount,
        completedHabitsCount,
      };
    })
    .filter((item): item is StatsDayGroupItem => item !== null)
    .sort((left, right) => {
      if (left.isCompleted !== right.isCompleted) {
        return left.isCompleted ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });

  return {
    items,
    scheduledCount,
    completedCount,
  };
}
