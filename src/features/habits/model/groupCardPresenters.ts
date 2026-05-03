import { WEEKDAY_LABELS } from "@features/habits/model/constants";
import type { HabitGroupWithMetrics } from "@features/habits/model/types";

export function getGroupSummarySessionPhaseLabel(
  sessionPhase: HabitGroupWithMetrics["metrics"]["sessionPhase"],
): {
  label: string;
  tone: "neutral" | "success";
} {
  if (sessionPhase === "active") {
    return {
      label: "In window",
      tone: "success",
    };
  }

  if (sessionPhase === "before_start") {
    return {
      label: "Upcoming",
      tone: "neutral",
    };
  }

  return {
    label: "Window ended",
    tone: "neutral",
  };
}

export function getCompactGroupFrequencyLabel(group: HabitGroupWithMetrics): string {
  if (group.frequency === "daily") {
    return "Daily";
  }

  if (group.frequency === "weekly") {
    return `Weekly (${WEEKDAY_LABELS[group.weeklyWeekday] ?? "Mon"})`;
  }

  const days = group.customWeekdays.map((day) => WEEKDAY_LABELS[day] ?? "Mon").join(", ");
  return `Custom (${days})`;
}

export function getGroupSummaryProgressHint(group: HabitGroupWithMetrics): string {
  if (!group.metrics.isWithinDateRange) {
    return "Group is outside active date range.";
  }

  if (!group.metrics.isScheduledToday) {
    return "Group is not scheduled for today.";
  }

  if (group.metrics.targetCount === 0) {
    return "No scheduled habits in this group today.";
  }

  if (group.metrics.isCompletedToday) {
    return "Daily goal reached for this group.";
  }

  return `${group.metrics.remainingCount} more to reach today's goal.`;
}
