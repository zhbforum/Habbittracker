import type {
  HabitFormValues,
  HabitGoalMetric,
  HabitGoalPeriod,
  HabitGroupFormValues,
  HabitWeekday,
} from "./types";
import { addDays, toDateKey } from "./date";

export const HABIT_NAME_MAX_LENGTH = 56;
export const HABIT_GOAL_UNIT_MAX_LENGTH = 16;
export const HABIT_GOAL_TARGET_MIN = 1;
export const HABIT_GOAL_TARGET_MAX = 10000;

export const HABIT_HEATMAP_WEEKS = 53;

export const HABIT_STORAGE_KEY_PREFIX = "habbittracker.habits";
export const HABIT_GROUP_STORAGE_KEY_PREFIX = "habbittracker.habit-groups";

export const HABIT_GROUP_NAME_MAX_LENGTH = 56;
export const HABIT_GROUP_DESCRIPTION_MAX_LENGTH = 140;

export const WEEKDAY_ORDER: readonly HabitWeekday[] = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_LABELS: Record<HabitWeekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const WEEKDAY_SHORT_LABELS: Record<HabitWeekday, string> = {
  0: "S",
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
  6: "S",
};

export const DEFAULT_HABIT_FORM_VALUES: HabitFormValues = {
  name: "",
  kind: "positive",
  frequency: "daily",
  reminderTime: "20:00",
  iconId: "water",
  iconColorId: "emerald",
  weeklyWeekday: 1,
  customWeekdays: [1, 3, 5],
  goalMetric: "checkins",
  goalPeriod: "day",
  goalTarget: 1,
  goalUnit: "times",
};

export const HABIT_KIND_OPTIONS = [
  {
    label: "Helpful",
    value: "positive",
  },
  {
    label: "Harmful",
    value: "negative",
  },
] as const satisfies readonly {
  label: string;
  value: HabitFormValues["kind"];
}[];

export const HABIT_FREQUENCY_OPTIONS = [
  {
    label: "Daily",
    value: "daily",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Custom",
    value: "custom",
  },
] as const satisfies readonly {
  label: string;
  value: HabitFormValues["frequency"];
}[];

export const HABIT_GOAL_METRIC_OPTIONS = [
  {
    label: "Check-ins",
    value: "checkins",
  },
  {
    label: "Value",
    value: "value",
  },
] as const satisfies readonly {
  label: string;
  value: HabitGoalMetric;
}[];

export const HABIT_GOAL_PERIOD_OPTIONS = [
  {
    label: "Day",
    value: "day",
  },
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
] as const satisfies readonly {
  label: string;
  value: HabitGoalPeriod;
}[];

export const DEFAULT_HABIT_GROUP_FORM_VALUES: HabitGroupFormValues = {
  name: "",
  description: "",
  iconId: "focus",
  frequency: "daily",
  weeklyWeekday: 1,
  customWeekdays: [1, 3, 5],
  startDate: "",
  endDate: "",
  reminderStartTime: "07:00",
  reminderEndTime: "21:00",
  dailyGoal: 1,
  habitIds: [],
};

export function createDefaultHabitGroupFormValues(today: Date = new Date()): HabitGroupFormValues {
  return {
    ...DEFAULT_HABIT_GROUP_FORM_VALUES,
    weeklyWeekday: today.getDay() as HabitGroupFormValues["weeklyWeekday"],
    startDate: toDateKey(today),
    endDate: toDateKey(addDays(today, 30)),
    customWeekdays: [...DEFAULT_HABIT_GROUP_FORM_VALUES.customWeekdays],
    habitIds: [],
  };
}

export const HABIT_GROUP_FREQUENCY_OPTIONS = [
  {
    label: "Daily",
    value: "daily",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Custom",
    value: "custom",
  },
] as const satisfies readonly {
  label: string;
  value: HabitGroupFormValues["frequency"];
}[];
