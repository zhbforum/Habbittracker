import { addDays, isSameDate } from "./date";
import { isHabitCompletedForDate, isHabitScheduledOnDate } from "./schedule";
import type { Habit } from "./types";

export function buildCurrentStreak(habit: Habit, today: Date): number {
  const createdAt = new Date(habit.createdAt);
  let cursor = new Date(today);
  let streak = 0;
  let firstScheduledChecked = false;

  while (cursor >= createdAt) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }

    const completed = isHabitCompletedForDate(habit, cursor);

    if (!firstScheduledChecked && isSameDate(cursor, today) && !completed) {
      firstScheduledChecked = true;
      cursor = addDays(cursor, -1);
      continue;
    }

    firstScheduledChecked = true;

    if (completed) {
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    break;
  }

  return streak;
}

export function buildBestStreak(habit: Habit, today: Date): number {
  const createdAt = new Date(habit.createdAt);
  let cursor = new Date(createdAt);
  let current = 0;
  let best = 0;

  while (cursor <= today) {
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
