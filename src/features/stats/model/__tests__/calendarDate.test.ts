import { toDateKey } from "@entities/habit/model/date";

import {
  buildMonthLabel,
  buildSummaryRangeLabel,
  normalizeMonthDate,
  parseDateKey,
  resolveCalendarGridStart,
  resolveSelectedDateKey,
  resolveSummaryPeriodStart,
  shiftMonth,
} from "../calendarDate";
import type { StatsDayDetails } from "../types";

function createDayDetails(date: Date): StatsDayDetails {
  return {
    dateKey: toDateKey(date),
    dateLabel: date.toDateString(),
    habits: [],
    groups: [],
    scheduledHabitsCount: 0,
    completedHabitsCount: 0,
    scheduledGroupsCount: 0,
    completedGroupsCount: 0,
    totalLoggedValue: 0,
  };
}

describe("stats calendar date utilities", () => {
  it("normalizes month date to first day", () => {
    expect(toDateKey(normalizeMonthDate(new Date(2026, 4, 19)))).toBe("2026-05-01");
  });

  it("builds labels for month and summary ranges", () => {
    expect(buildMonthLabel(new Date(2026, 4, 1))).toBe("May 2026");
    expect(buildSummaryRangeLabel("month")).toBe("Selected month");
    expect(buildSummaryRangeLabel("three_months")).toBe("Last 3 months");
    expect(buildSummaryRangeLabel("year")).toBe("Last 12 months");
  });

  it("resolves summary range starts correctly", () => {
    const monthDate = new Date(2026, 4, 1);

    expect(toDateKey(resolveSummaryPeriodStart(monthDate, "month"))).toBe("2026-05-01");
    expect(toDateKey(resolveSummaryPeriodStart(monthDate, "three_months"))).toBe("2026-03-01");
    expect(toDateKey(resolveSummaryPeriodStart(monthDate, "year"))).toBe("2025-06-01");
  });

  it("resolves calendar grid start from monday", () => {
    expect(toDateKey(resolveCalendarGridStart(new Date(2026, 4, 1)))).toBe("2026-04-27");
    expect(toDateKey(resolveCalendarGridStart(new Date(2026, 10, 1)))).toBe("2026-10-26");
  });

  it("parses valid date keys and rejects invalid ones", () => {
    const parsed = parseDateKey("2026-02-28");
    expect(parsed).toBeTruthy();
    expect(parsed ? toDateKey(parsed) : null).toBe("2026-02-28");

    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("2026/02/28")).toBeNull();
    expect(parseDateKey("bad")).toBeNull();
  });

  it("prefers explicit selected date key when valid", () => {
    const monthDate = new Date(2026, 4, 1);
    const today = new Date(2026, 4, 6);
    const dayDetailsMap: Record<string, StatsDayDetails> = {
      "2026-05-06": createDayDetails(today),
    };

    expect(resolveSelectedDateKey(monthDate, "2026-05-10", dayDetailsMap, today)).toBe(
      "2026-05-10",
    );
  });

  it("falls back to today key or month start for selected date", () => {
    const monthDate = new Date(2026, 4, 1);
    const today = new Date(2026, 4, 6);
    const dayDetailsMapWithToday: Record<string, StatsDayDetails> = {
      "2026-05-06": createDayDetails(today),
    };
    const emptyDayDetailsMap: Record<string, StatsDayDetails> = {};

    expect(resolveSelectedDateKey(monthDate, "invalid", dayDetailsMapWithToday, today)).toBe(
      "2026-05-06",
    );
    expect(resolveSelectedDateKey(monthDate, null, emptyDayDetailsMap, today)).toBe("2026-05-01");
  });

  it("shifts month by delta while keeping month start", () => {
    expect(toDateKey(shiftMonth(new Date(2026, 4, 14), 2))).toBe("2026-07-01");
    expect(toDateKey(shiftMonth(new Date(2026, 0, 14), -1))).toBe("2025-12-01");
  });
});
