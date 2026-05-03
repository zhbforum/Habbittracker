import { addDays, toDateKey } from "@entities/habit/model/date";

import type { StatsDayDetails, StatsSummaryRange } from "./types";

export const CALENDAR_GRID_DAYS = 42;

export function normalizeMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function resolveMonthEndDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function buildMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function buildSummaryRangeLabel(summaryRange: StatsSummaryRange): string {
  if (summaryRange === "three_months") {
    return "Last 3 months";
  }

  if (summaryRange === "year") {
    return "Last 12 months";
  }

  return "Selected month";
}

export function resolveSummaryPeriodStart(
  monthDate: Date,
  summaryRange: StatsSummaryRange,
): Date {
  if (summaryRange === "three_months") {
    return new Date(monthDate.getFullYear(), monthDate.getMonth() - 2, 1);
  }

  if (summaryRange === "year") {
    return new Date(monthDate.getFullYear(), monthDate.getMonth() - 11, 1);
  }

  return normalizeMonthDate(monthDate);
}

export function resolveCalendarGridStart(monthDate: Date): Date {
  const monthStart = normalizeMonthDate(monthDate);
  const weekday = monthStart.getDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  return addDays(monthStart, -mondayOffset);
}

export function isDateKeyValid(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseDateKey(value: string): Date | null {
  const matched = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function resolveSelectedDateKey(
  monthDate: Date,
  selectedDateKey: string | null,
  dayDetailsMap: Record<string, StatsDayDetails>,
  today: Date,
): string {
  if (selectedDateKey && isDateKeyValid(selectedDateKey)) {
    return selectedDateKey;
  }

  const todayKey = toDateKey(today);

  if (dayDetailsMap[todayKey]) {
    return todayKey;
  }

  return toDateKey(normalizeMonthDate(monthDate));
}

export function shiftMonth(baseMonthDate: Date, deltaMonths: number): Date {
  return new Date(baseMonthDate.getFullYear(), baseMonthDate.getMonth() + deltaMonths, 1);
}

