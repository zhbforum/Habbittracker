import type { HabitFormValues, HabitWeekday } from "./types";

export const HABIT_NAME_MAX_LENGTH = 56;

export const HABIT_HEATMAP_WEEKS = 53;

export const HABIT_STORAGE_KEY_PREFIX = "habbittracker.habits";

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
