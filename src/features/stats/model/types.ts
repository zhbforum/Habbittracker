import type { HabitIconColorId, HabitIconId } from "@entities/habit/model/types";

export type StatsDayHabitItem = {
  id: string;
  name: string;
  iconId: HabitIconId;
  iconColorId: HabitIconColorId;
  isScheduled: boolean;
  isCompleted: boolean;
  goalMetric: "checkins" | "value";
  goalPeriod: "day" | "week" | "month";
  goalTarget: number;
  goalUnit: string;
  loggedValue: number;
  goalProgressPercent: number;
};

export type StatsDayGroupItem = {
  id: string;
  name: string;
  iconId: HabitIconId;
  isScheduled: boolean;
  isCompleted: boolean;
  targetCount: number;
  completedHabitsCount: number;
};

export type StatsDayDetails = {
  dateKey: string;
  dateLabel: string;
  habits: StatsDayHabitItem[];
  groups: StatsDayGroupItem[];
  scheduledHabitsCount: number;
  completedHabitsCount: number;
  scheduledGroupsCount: number;
  completedGroupsCount: number;
  totalLoggedValue: number;
};

export type StatsCalendarCell = {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  scheduledHabitsCount: number;
  completedHabitsCount: number;
  scheduledGroupsCount: number;
  completedGroupsCount: number;
  intensityLevel: 0 | 1 | 2 | 3;
};

export type StatsHeatmapCell = {
  dateKey: string;
  dayIndex: number;
  intensityLevel: 0 | 1 | 2 | 3;
  isToday: boolean;
  completionRatePercent: number;
};

export type StatsHeatmapWeek = {
  weekLabel: string;
  monthLabel: string;
  cells: StatsHeatmapCell[];
};

export type StatsSummaryRange = "month" | "three_months" | "year";

export type StatsMonthSummary = {
  completionRatePercent: number;
  activeDaysCount: number;
  bestStreak: number;
  groupWinsCount: number;
  perfectDaysCount: number;
  strongestWeekdayLabel: string;
  strongestWeekdayRatePercent: number;
  totalLoggedValue: number;
  averageDailyLoggedValue: number;
};

export type StatsMonthInsights = {
  monthLabel: string;
  summaryRangeLabel: string;
  calendarCells: StatsCalendarCell[];
  heatmapWeeks: StatsHeatmapWeek[];
  selectedDayDetails: StatsDayDetails;
  summary: StatsMonthSummary;
};

