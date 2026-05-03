import {
  createDefaultHabitGroupFormValues,
  DEFAULT_HABIT_FORM_VALUES,
} from "@features/habits/model/constants";
import type {
  Habit,
  HabitFormValues,
  HabitGroup,
  HabitGroupFormValues,
} from "@features/habits/model/types";

export function toHabitFormValues(habit: Habit): HabitFormValues {
  return {
    name: habit.name,
    kind: habit.kind,
    frequency: habit.frequency,
    reminderTime: habit.reminderTime,
    iconId: habit.iconId,
    iconColorId: habit.iconColorId,
    weeklyWeekday: habit.weeklyWeekday,
    customWeekdays: [...habit.customWeekdays],
    goalMetric: habit.goal.metric,
    goalPeriod: habit.goal.period,
    goalTarget: habit.goal.target,
    goalUnit: habit.goal.unit,
  };
}

export function createDefaultHabitFormValues(today: Date = new Date()): HabitFormValues {
  return {
    ...DEFAULT_HABIT_FORM_VALUES,
    weeklyWeekday: today.getDay() as HabitFormValues["weeklyWeekday"],
    customWeekdays: [...DEFAULT_HABIT_FORM_VALUES.customWeekdays],
  };
}

export function toHabitGroupFormValues(group: HabitGroup): HabitGroupFormValues {
  return {
    name: group.name,
    description: group.description,
    iconId: group.iconId,
    frequency: group.frequency,
    weeklyWeekday: group.weeklyWeekday,
    customWeekdays: [...group.customWeekdays],
    startDate: group.startDate,
    endDate: group.endDate,
    reminderStartTime: group.reminderStartTime,
    reminderEndTime: group.reminderEndTime,
    dailyGoal: group.dailyGoal,
    habitIds: [...group.habitIds],
  };
}

export function createDefaultHabitGroupEditorFormValues(
  today: Date = new Date(),
): HabitGroupFormValues {
  return createDefaultHabitGroupFormValues(today);
}
