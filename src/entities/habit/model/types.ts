import type { LucideIcon } from "lucide-react-native";

export type HabitKind = "positive" | "negative";

export type HabitFrequency = "daily" | "weekly" | "custom";

export type HabitGoalMetric = "checkins" | "value";

export type HabitGoalPeriod = "day" | "week" | "month";

export type HabitGoal = {
  metric: HabitGoalMetric;
  period: HabitGoalPeriod;
  target: number;
  unit: string;
};

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

export type HabitCompletionEntry = {
  completedAt: string;
  value: number | null;
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
  goal: HabitGoal;
  completions: Record<string, HabitCompletionEntry>;
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
  goalMetric: HabitGoalMetric;
  goalPeriod: HabitGoalPeriod;
  goalTarget: number;
  goalUnit: string;
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
  level: 0 | 1 | 2 | 3;
};

export type HabitHeatmapWeek = {
  weekLabel: string;
  cells: HabitHeatmapCell[];
};

export type HabitMetrics = {
  completedToday: boolean;
  todayLoggedValue: number;
  goalProgress: {
    period: HabitGoalPeriod;
    target: number;
    currentValue: number;
    remainingValue: number;
    progressPercent: number;
    periodLabel: string;
  };
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

export type HabitGroupSessionPhase = "before_start" | "active" | "after_end";

export type HabitGroup = {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconId: HabitIconId;
  frequency: HabitFrequency;
  weeklyWeekday: HabitWeekday;
  customWeekdays: HabitWeekday[];
  startDate: string;
  endDate: string;
  reminderStartTime: string;
  reminderEndTime: string;
  dailyGoal: number;
  habitIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type HabitGroupFormValues = {
  name: string;
  description: string;
  iconId: HabitIconId;
  frequency: HabitFrequency;
  weeklyWeekday: HabitWeekday;
  customWeekdays: HabitWeekday[];
  startDate: string;
  endDate: string;
  reminderStartTime: string;
  reminderEndTime: string;
  dailyGoal: number;
  habitIds: string[];
};

export type HabitGroupMetrics = {
  totalHabitsCount: number;
  scheduledHabitsCount: number;
  completedHabitsCount: number;
  isScheduledToday: boolean;
  isWithinDateRange: boolean;
  targetCount: number;
  remainingCount: number;
  progressPercent: number;
  isCompletedToday: boolean;
  sessionPhase: HabitGroupSessionPhase;
};

export type HabitGroupWithMetrics = HabitGroup & {
  metrics: HabitGroupMetrics;
};
