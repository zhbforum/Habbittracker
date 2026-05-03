import { formatTimeLabel } from "@entities/habit/model/date";
import type { HabitGroupWithMetrics } from "@entities/habit/model/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function getGroupFrequencyLabel(group: HabitGroupWithMetrics): string {
  if (group.frequency === "daily") {
    return "Daily";
  }

  if (group.frequency === "weekly") {
    return `Weekly (${WEEKDAY_LABELS[group.weeklyWeekday] ?? "Mon"})`;
  }

  if (group.customWeekdays.length === 0) {
    return "Custom";
  }

  const customDaysLabel = group.customWeekdays
    .map((day) => WEEKDAY_LABELS[day] ?? "Mon")
    .join(", ");

  return `Custom (${customDaysLabel})`;
}

export function getGroupSessionWindowLabel(group: HabitGroupWithMetrics): string {
  return `${formatTimeLabel(group.reminderStartTime)} - ${formatTimeLabel(group.reminderEndTime)}`;
}

export function getGroupDateRangeLabel(group: HabitGroupWithMetrics): string {
  return `${group.startDate} - ${group.endDate}`;
}

export function getGroupHint(group: HabitGroupWithMetrics): string {
  if (!group.metrics.isWithinDateRange) {
    return "Outside active date range";
  }

  if (!group.metrics.isScheduledToday) {
    return "Not scheduled for today";
  }

  if (group.metrics.targetCount === 0) {
    return "No scheduled habits inside group today";
  }

  if (group.metrics.isCompletedToday) {
    return "Daily goal reached";
  }

  return `${group.metrics.remainingCount} to goal`;
}

