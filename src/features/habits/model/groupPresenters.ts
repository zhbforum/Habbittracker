import { WEEKDAY_LABELS } from "@features/habits/model/constants";
import type { HabitGroupWithMetrics } from "@features/habits/model/types";

export function getGroupSessionPhaseTitle(
  sessionPhase: HabitGroupWithMetrics["metrics"]["sessionPhase"],
): string {
  if (sessionPhase === "active") {
    return "In active window";
  }

  if (sessionPhase === "before_start") {
    return "Upcoming session";
  }

  return "Window closed";
}

export function getGroupFrequencyLabel(group: HabitGroupWithMetrics): string {
  if (group.frequency === "daily") {
    return "Daily";
  }

  if (group.frequency === "weekly") {
    return `Weekly on ${WEEKDAY_LABELS[group.weeklyWeekday] ?? "Mon"}`;
  }

  const days = group.customWeekdays.map((day) => WEEKDAY_LABELS[day] ?? "Mon").join(", ");
  return `Custom: ${days}`;
}

export function getGroupProgressHint(group: HabitGroupWithMetrics): string {
  if (!group.metrics.isWithinDateRange) {
    return "Group is outside date range.";
  }

  if (!group.metrics.isScheduledToday) {
    return "Group is not scheduled for today's frequency.";
  }

  if (group.metrics.targetCount === 0) {
    return "No scheduled habits today.";
  }

  if (group.metrics.isCompletedToday) {
    return "Goal achieved.";
  }

  return `${group.metrics.remainingCount} to go`;
}
