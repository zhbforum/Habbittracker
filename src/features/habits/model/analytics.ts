import {
  HABIT_HEATMAP_WEEKS,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "./constants";
import {
  addDays,
  formatMonthDay,
  isSameDate,
  startOfWeek,
  toDateKey,
} from "./date";
import type {
  Habit,
  HabitHeatmapCell,
  HabitHeatmapWeek,
  HabitMetrics,
  HabitSummary,
  HabitWeekday,
  HabitWithMetrics,
} from "./types";

function hasCompletion(habit: Habit, date: Date): boolean {
  return Boolean(habit.completions[toDateKey(date)]);
}

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

function buildCurrentStreak(habit: Habit, today: Date): number {
  const createdAt = new Date(habit.createdAt);
  let cursor = new Date(today);
  let streak = 0;
  let firstScheduledChecked = false;

  while (cursor >= createdAt) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }

    const completed = hasCompletion(habit, cursor);

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

function buildBestStreak(habit: Habit, today: Date): number {
  const createdAt = new Date(habit.createdAt);
  let cursor = new Date(createdAt);
  let current = 0;
  let best = 0;

  while (cursor <= today) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    if (hasCompletion(habit, cursor)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }

    cursor = addDays(cursor, 1);
  }

  return best;
}

function buildWeeklyPerformance(
  habit: Habit,
  today: Date,
): HabitMetrics["weeklyPerformance"] {
  const points: HabitMetrics["weeklyPerformance"] = [];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    const targetDate = addDays(today, -dayOffset);
    const weekday = targetDate.getDay() as HabitWeekday;

    points.push({
      dateKey: toDateKey(targetDate),
      label: WEEKDAY_LABELS[weekday].slice(0, 1),
      dayOfMonthLabel: String(targetDate.getDate()),
      scheduled: isHabitScheduledOnDate(habit, targetDate),
      completed: hasCompletion(habit, targetDate),
    });
  }

  return points;
}

function createHeatmapCell(habit: Habit, date: Date): HabitHeatmapCell {
  const scheduled = isHabitScheduledOnDate(habit, date);
  const completed = hasCompletion(habit, date);

  if (completed) {
    return {
      dateKey: toDateKey(date),
      scheduled,
      completed,
      level: 2,
    };
  }

  if (scheduled) {
    return {
      dateKey: toDateKey(date),
      scheduled,
      completed,
      level: 1,
    };
  }

  return {
    dateKey: toDateKey(date),
    scheduled,
    completed,
    level: 0,
  };
}

function buildHeatmap(habit: Habit, today: Date): HabitHeatmapWeek[] {
  const totalDays = HABIT_HEATMAP_WEEKS * 7;
  const startDate = addDays(startOfWeek(today), -(totalDays - 7));
  const weeks: HabitHeatmapWeek[] = [];

  for (let weekIndex = 0; weekIndex < HABIT_HEATMAP_WEEKS; weekIndex += 1) {
    const weekStart = addDays(startDate, weekIndex * 7);
    const weekCells: HabitHeatmapCell[] = WEEKDAY_ORDER.map((weekdayOffset) => {
      const date = addDays(weekStart, weekdayOffset === 0 ? 6 : weekdayOffset - 1);
      return createHeatmapCell(habit, date);
    });

    weeks.push({
      weekLabel: formatMonthDay(weekStart),
      cells: weekCells,
    });
  }

  return weeks;
}

export function buildHabitMetrics(habit: Habit, today: Date = new Date()): HabitMetrics {
  const weeklyPerformance = buildWeeklyPerformance(habit, today);
  const weeklyScheduledCount = weeklyPerformance.filter((day) => day.scheduled).length;
  const weeklyCompletedCount = weeklyPerformance.filter((day) => day.completed).length;

  return {
    completedToday: hasCompletion(habit, today),
    currentStreak: buildCurrentStreak(habit, today),
    bestStreak: buildBestStreak(habit, today),
    weeklyPerformance,
    weeklyCompletedCount,
    weeklyScheduledCount,
    heatmap: buildHeatmap(habit, today),
  };
}

export function withHabitMetrics(habits: Habit[], today: Date = new Date()): HabitWithMetrics[] {
  return habits
    .map((habit) => ({
      ...habit,
      metrics: buildHabitMetrics(habit, today),
    }))
    .sort((left, right) => {
      if (left.metrics.completedToday !== right.metrics.completedToday) {
        return left.metrics.completedToday ? 1 : -1;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export function buildHabitSummary(habits: HabitWithMetrics[]): HabitSummary {
  const positive = habits.filter((habit) => habit.kind === "positive").length;
  const negative = habits.filter((habit) => habit.kind === "negative").length;
  const completedToday = habits.filter((habit) => habit.metrics.completedToday).length;

  return {
    total: habits.length,
    positive,
    negative,
    completedToday,
  };
}
