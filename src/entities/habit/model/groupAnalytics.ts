import { parseTimeToMinutes } from "./date";
import { isHabitScheduledOnDate } from "./analytics";
import type {
  HabitGroup,
  HabitGroupMetrics,
  HabitGroupSessionPhase,
  HabitGroupWithMetrics,
  HabitWithMetrics,
} from "./types";

function toDateStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function parseDateKey(value: string): Date | null {
  const matched = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isGroupInDateRange(group: HabitGroup, today: Date): boolean {
  const parsedStart = parseDateKey(group.startDate);
  const parsedEnd = parseDateKey(group.endDate);

  if (!parsedStart || !parsedEnd) {
    return true;
  }

  const todayTime = toDateStart(today);
  const startTime = toDateStart(parsedStart);
  const endTime = toDateStart(parsedEnd);

  return todayTime >= startTime && todayTime <= endTime;
}

function isGroupScheduledByFrequency(group: HabitGroup, today: Date): boolean {
  if (group.frequency === "daily") {
    return true;
  }

  if (group.frequency === "weekly") {
    return group.weeklyWeekday === today.getDay();
  }

  return group.customWeekdays.includes(today.getDay() as typeof group.customWeekdays[number]);
}

function resolveGroupSessionPhase(
  reminderStartTime: string,
  reminderEndTime: string,
  now: Date,
): HabitGroupSessionPhase {
  const startMinutes = parseTimeToMinutes(reminderStartTime);
  const endMinutes = parseTimeToMinutes(reminderEndTime);

  if (startMinutes === null || endMinutes === null) {
    return "active";
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (startMinutes <= endMinutes) {
    if (nowMinutes < startMinutes) {
      return "before_start";
    }

    if (nowMinutes > endMinutes) {
      return "after_end";
    }

    return "active";
  }

  // Overnight window, for example 22:00 -> 06:00.
  if (nowMinutes >= startMinutes || nowMinutes <= endMinutes) {
    return "active";
  }

  return "before_start";
}

export function buildHabitGroupMetrics(
  group: HabitGroup,
  habits: HabitWithMetrics[],
  today: Date = new Date(),
): HabitGroupMetrics {
  const isWithinDateRange = isGroupInDateRange(group, today);
  const isScheduledByFrequency = isGroupScheduledByFrequency(group, today);
  const isScheduledToday = isWithinDateRange && isScheduledByFrequency;

  const memberHabits = habits.filter((habit) => group.habitIds.includes(habit.id));
  const scheduledHabits = isScheduledToday
    ? memberHabits.filter((habit) => isHabitScheduledOnDate(habit, today))
    : [];
  const completedHabitsCount = scheduledHabits.filter(
    (habit) => habit.metrics.completedToday,
  ).length;

  const scheduledHabitsCount = scheduledHabits.length;
  const targetCount =
    scheduledHabitsCount === 0 ? 0 : Math.min(group.dailyGoal, scheduledHabitsCount);
  const remainingCount = Math.max(targetCount - completedHabitsCount, 0);
  const progressPercent =
    targetCount === 0 ? 0 : Math.min(100, Math.round((completedHabitsCount / targetCount) * 100));

  return {
    totalHabitsCount: memberHabits.length,
    scheduledHabitsCount,
    completedHabitsCount,
    isScheduledToday,
    isWithinDateRange,
    targetCount,
    remainingCount,
    progressPercent,
    isCompletedToday: targetCount > 0 && completedHabitsCount >= targetCount,
    sessionPhase: resolveGroupSessionPhase(group.reminderStartTime, group.reminderEndTime, today),
  };
}

export function withHabitGroupMetrics(
  groups: HabitGroup[],
  habits: HabitWithMetrics[],
  today: Date = new Date(),
): HabitGroupWithMetrics[] {
  return groups.map((group) => ({
    ...group,
    metrics: buildHabitGroupMetrics(group, habits, today),
  }));
}
