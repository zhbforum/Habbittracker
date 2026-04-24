import type { LucideIcon } from "lucide-react-native";

export type HabitKind = "positive" | "negative";

export type HabitFrequency = "daily" | "weekly" | "custom";

export type HabitWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitIconId =
  | "water"
  | "run"
  | "workout"
  | "meditation"
  | "reading"
  | "sleep"
  | "vitamins"
  | "healthy_food"
  | "journal"
  | "coding"
  | "study"
  | "walk"
  | "cleaning"
  | "music"
  | "focus"
  | "no_smoking"
  | "no_alcohol"
  | "no_drugs"
  | "no_sugar"
  | "less_social"
  | "bike"
  | "meal_prep"
  | "stretching"
  | "reading_focus"
  | "sleep_early"
  | "deep_work"
  | "mindful_break"
  | "morning_sun"
  | "budget"
  | "self_care"
  | "no_fast_food"
  | "no_late_snacks"
  | "meal_green"
  | "salad_day"
  | "quiet_night"
  | "wallet_plan"
  | "breathing"
  | "calm_walk"
  | "timed_session";

export type HabitIconColorId =
  | "emerald"
  | "mint"
  | "sky"
  | "ocean"
  | "violet"
  | "magenta"
  | "amber"
  | "orange"
  | "red"
  | "slate";

export type HabitIconOption = {
  id: HabitIconId;
  label: string;
  Icon: LucideIcon;
};

export type HabitIconColorOption = {
  id: HabitIconColorId;
  color: string;
};

export type Habit = {
  id: string;
  userId: string;
  name: string;
  kind: HabitKind;
  frequency: HabitFrequency;
  reminderTime: string;
  iconId: HabitIconId;
  iconColorId: HabitIconColorId;
  createdAt: string;
  updatedAt: string;
  weeklyWeekday: HabitWeekday;
  customWeekdays: HabitWeekday[];
  completions: Record<string, string>;
};

export type HabitFormValues = {
  name: string;
  kind: HabitKind;
  frequency: HabitFrequency;
  reminderTime: string;
  iconId: HabitIconId;
  iconColorId: HabitIconColorId;
  weeklyWeekday: HabitWeekday;
  customWeekdays: HabitWeekday[];
};

export type HabitWeeklyPerformanceDay = {
  dateKey: string;
  label: string;
  dayOfMonthLabel: string;
  scheduled: boolean;
  completed: boolean;
};

export type HabitHeatmapCell = {
  dateKey: string;
  scheduled: boolean;
  completed: boolean;
  level: 0 | 1 | 2;
};

export type HabitHeatmapWeek = {
  weekLabel: string;
  cells: HabitHeatmapCell[];
};

export type HabitMetrics = {
  completedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  weeklyPerformance: HabitWeeklyPerformanceDay[];
  weeklyCompletedCount: number;
  weeklyScheduledCount: number;
  heatmap: HabitHeatmapWeek[];
};

export type HabitWithMetrics = Habit & {
  metrics: HabitMetrics;
};

export type HabitSummary = {
  total: number;
  positive: number;
  negative: number;
  completedToday: number;
};
