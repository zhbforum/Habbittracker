import { WEEKDAY_LABELS } from "./constants";
import { formatTimeLabel } from "./date";
import type { Habit, HabitWithMetrics } from "./types";

function joinLabels(labels: string[]): string {
  if (labels.length <= 3) {
    return labels.join(", ");
  }

  return `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`;
}

export function getFrequencyLabel(habit: Habit): string {
  if (habit.frequency === "daily") {
    return "Daily";
  }

  if (habit.frequency === "weekly") {
    return `Weekly on ${WEEKDAY_LABELS[habit.weeklyWeekday]}`;
  }

  const labels = habit.customWeekdays.map((weekday) => WEEKDAY_LABELS[weekday]);
  return `Custom: ${joinLabels(labels)}`;
}

export function getReminderLabel(habit: Habit): string {
  if (!habit.reminderTime.trim()) {
    return "Off";
  }

  return formatTimeLabel(habit.reminderTime);
}

export function getCompletionActionLabel(habit: HabitWithMetrics): string {
  if (habit.goal.metric === "value") {
    return habit.metrics.completedToday ? "Goal reached" : "Log value";
  }

  if (habit.kind === "positive") {
    return habit.metrics.completedToday ? "Done today" : "Mark done";
  }

  return habit.metrics.completedToday ? "Stayed clean" : "Mark clean day";
}

export function getGoalLabel(habit: Habit): string {
  const unitLabel = habit.goal.unit.trim();
  const periodLabel =
    habit.goal.period === "day" ? "day" : habit.goal.period === "week" ? "week" : "month";

  return `${habit.goal.target} ${unitLabel}/${periodLabel}`;
}
