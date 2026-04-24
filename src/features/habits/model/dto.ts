import type {
  Habit,
  HabitFrequency,
  HabitIconColorId,
  HabitIconId,
  HabitKind,
} from "./types";

export type HabitStorageDto = {
  id?: unknown;
  userId?: unknown;
  name?: unknown;
  kind?: unknown;
  frequency?: unknown;
  reminderTime?: unknown;
  iconId?: unknown;
  iconColorId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  weeklyWeekday?: unknown;
  customWeekdays?: unknown;
  completions?: unknown;
};

export type HabitPersistenceDto = Omit<Habit, "customWeekdays" | "completions"> & {
  customWeekdays: number[];
  completions: Record<string, string>;
};

export const HABIT_KIND_VALUES: readonly HabitKind[] = ["positive", "negative"];
export const HABIT_FREQUENCY_VALUES: readonly HabitFrequency[] = [
  "daily",
  "weekly",
  "custom",
];

export const HABIT_ICON_COLOR_VALUES: readonly HabitIconColorId[] = [
  "emerald",
  "mint",
  "sky",
  "ocean",
  "violet",
  "magenta",
  "amber",
  "orange",
  "red",
  "slate",
];

export const HABIT_ICON_ID_VALUES: readonly HabitIconId[] = [
  "water",
  "run",
  "workout",
  "meditation",
  "reading",
  "sleep",
  "vitamins",
  "healthy_food",
  "journal",
  "coding",
  "study",
  "walk",
  "cleaning",
  "music",
  "focus",
  "no_smoking",
  "no_alcohol",
  "no_drugs",
  "no_sugar",
  "less_social",
  "bike",
  "meal_prep",
  "stretching",
  "reading_focus",
  "sleep_early",
  "deep_work",
  "mindful_break",
  "morning_sun",
  "budget",
  "self_care",
  "no_fast_food",
  "no_late_snacks",
  "meal_green",
  "salad_day",
  "quiet_night",
  "wallet_plan",
  "breathing",
  "calm_walk",
  "timed_session",
];
