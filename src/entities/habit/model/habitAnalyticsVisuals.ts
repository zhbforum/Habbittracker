import { HABIT_HEATMAP_WEEKS, WEEKDAY_LABELS, WEEKDAY_ORDER } from "./constants";
import { getCompletionValue } from "./completions";
import { addDays, formatMonthDay, startOfWeek, toDateKey } from "./date";
import { isHabitCompletedForDate, isHabitScheduledOnDate } from "./schedule";
import type {
  Habit,
  HabitHeatmapCell,
  HabitHeatmapWeek,
  HabitMetrics,
  HabitWeekday,
} from "./types";

export function buildWeeklyPerformance(
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
      completed: isHabitCompletedForDate(habit, targetDate),
    });
  }

  return points;
}

function createHeatmapCell(habit: Habit, date: Date): HabitHeatmapCell {
  const dateKey = toDateKey(date);
  const scheduled = isHabitScheduledOnDate(habit, date);
  const completed = isHabitCompletedForDate(habit, date);
  const loggedValue = getCompletionValue(habit, dateKey);
  const goalTarget = Math.max(habit.goal.target, 1);

  if (completed) {
    return {
      dateKey,
      scheduled,
      completed,
      level: 3,
    };
  }

  if (loggedValue > 0) {
    const progressRatio = loggedValue / goalTarget;

    return {
      dateKey,
      scheduled,
      completed,
      level: progressRatio >= 0.5 ? 2 : 1,
    };
  }

  return {
    dateKey,
    scheduled,
    completed,
    level: 0,
  };
}

export function buildHeatmap(habit: Habit, today: Date): HabitHeatmapWeek[] {
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
