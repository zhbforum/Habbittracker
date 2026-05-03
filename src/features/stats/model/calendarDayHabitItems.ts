import { isHabitCompletedForDate, isHabitScheduledOnDate } from "@entities/habit/model/analytics";
import {
  getCompletionValue,
  resolveGoalProgressRange,
  sumCompletionValuesInRange,
} from "@entities/habit/model/completions";
import type { Habit } from "@entities/habit/model/types";

import type { StatsDayHabitItem } from "./types";

function resolveHabitGoalProgressPercentOnDate(
  habit: Habit,
  date: Date,
  dateKey: string,
): number {
  const target = habit.goal.target;

  if (target <= 0) {
    return 0;
  }

  if (habit.goal.period === "day") {
    const loggedValue = getCompletionValue(habit, dateKey);
    return Math.min(100, Math.round((loggedValue / target) * 100));
  }

  const { startDate } = resolveGoalProgressRange(habit.goal.period, date);
  const currentValue = sumCompletionValuesInRange({
    habit,
    startDate,
    endDate: date,
    onlyScheduled: (targetDate) => isHabitScheduledOnDate(habit, targetDate),
  });

  return Math.min(100, Math.round((currentValue / target) * 100));
}

export function buildDayHabitItems(
  habits: Habit[],
  date: Date,
  dateKey: string,
): {
  items: StatsDayHabitItem[];
  scheduledCount: number;
  completedCount: number;
  totalLoggedValue: number;
} {
  let scheduledCount = 0;
  let completedCount = 0;
  let totalLoggedValue = 0;

  const items = habits
    .map<StatsDayHabitItem | null>((habit) => {
      const isScheduled = isHabitScheduledOnDate(habit, date);
      const loggedValue = getCompletionValue(habit, dateKey);
      const isCompleted = isHabitCompletedForDate(habit, date);

      if (isScheduled) {
        scheduledCount += 1;
      }

      if (isScheduled && isCompleted) {
        completedCount += 1;
      }

      if (loggedValue > 0) {
        totalLoggedValue += loggedValue;
      }

      if (!isScheduled && loggedValue <= 0) {
        return null;
      }

      return {
        id: habit.id,
        name: habit.name,
        iconId: habit.iconId,
        iconColorId: habit.iconColorId,
        isScheduled,
        isCompleted,
        goalMetric: habit.goal.metric,
        goalPeriod: habit.goal.period,
        goalTarget: habit.goal.target,
        goalUnit: habit.goal.unit,
        loggedValue,
        goalProgressPercent: resolveHabitGoalProgressPercentOnDate(habit, date, dateKey),
      };
    })
    .filter((item): item is StatsDayHabitItem => item !== null)
    .sort((left, right) => {
      if (left.isCompleted !== right.isCompleted) {
        return left.isCompleted ? -1 : 1;
      }

      if (left.isScheduled !== right.isScheduled) {
        return left.isScheduled ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });

  return {
    items,
    scheduledCount,
    completedCount,
    totalLoggedValue,
  };
}
