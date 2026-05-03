import type { HabitWeekday } from "./types";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function startOfWeek(date: Date): Date {
  const base = new Date(date);
  const day = base.getDay();
  const mondayDelta = day === 0 ? -6 : 1 - day;
  return addDays(base, mondayDelta);
}

export function isSameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function parseTimeToMinutes(value: string): number | null {
  const matched = value.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!matched) {
    return null;
  }

  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

export function normalizeTime(value: string): string | null {
  const minutes = parseTimeToMinutes(value);

  if (minutes === null) {
    return null;
  }

  const hoursPart = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  return `${pad(hoursPart)}:${pad(minutesPart)}`;
}

export function formatTimeLabel(value: string): string {
  const matched = normalizeTime(value);

  if (!matched) {
    return value;
  }

  const [hourPart, minutePart] = matched.split(":").map((part) => Number(part));
  const amPm = hourPart >= 12 ? "PM" : "AM";
  const normalizedHours = hourPart % 12 || 12;

  return `${normalizedHours}:${pad(minutePart)} ${amPm}`;
}

export function asWeekday(value: number): HabitWeekday {
  const normalizedValue = ((value % 7) + 7) % 7;
  return normalizedValue as HabitWeekday;
}
