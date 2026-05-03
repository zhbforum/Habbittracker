import { hasLoggedValueOnDateKey, isHabitCompletedOnDateKey } from "./completions";
import { toDateKey } from "./date";
import type { Habit, HabitWeekday } from "./types";

function normalizeCustomWeekdays(days: HabitWeekday[]): HabitWeekday[] {
  const unique = Array.from(new Set(days));
  return unique.sort((left, right) => left - right) as HabitWeekday[];
}

export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly") {
    return habit.weeklyWeekday === date.getDay();
  }

  const weekdays = normalizeCustomWeekdays(habit.customWeekdays);
  return weekdays.includes(date.getDay() as HabitWeekday);
}

export function isHabitCompletedForDate(habit: Habit, date: Date): boolean {
  const dateKey = toDateKey(date);

  if (habit.goal.period === "day") {
    return isHabitCompletedOnDateKey(habit, dateKey);
  }

  return hasLoggedValueOnDateKey(habit, dateKey);
}
