import { toDateKey } from "@entities/habit/model/date";

import { buildStatsMonthInsights, getStatsWeekdayLabels } from "../calendar";

const mockBuildDayDetails = jest.fn();
const mockResolveIntensityLevel = jest.fn();
const mockBuildHeatmapWeeks = jest.fn();
const mockBuildPeriodSummary = jest.fn();

jest.mock("../calendarDayBuilders", () => ({
  buildDayDetails: (...args: Parameters<typeof mockBuildDayDetails>) =>
    mockBuildDayDetails(...args),
  resolveIntensityLevel: (...args: Parameters<typeof mockResolveIntensityLevel>) =>
    mockResolveIntensityLevel(...args),
}));

jest.mock("../calendarHeatmap", () => ({
  buildHeatmapWeeks: (...args: Parameters<typeof mockBuildHeatmapWeeks>) =>
    mockBuildHeatmapWeeks(...args),
}));

jest.mock("../calendarSummary", () => ({
  buildPeriodSummary: (...args: Parameters<typeof mockBuildPeriodSummary>) =>
    mockBuildPeriodSummary(...args),
}));

describe("stats calendar model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildDayDetails.mockImplementation((_, __, date: Date) => {
      const dateKey = toDateKey(date);
      const completedHabitsCount = dateKey === "2026-05-06" ? 1 : 0;

      return {
        dateKey,
        dateLabel: date.toDateString(),
        habits: [],
        groups: [],
        scheduledHabitsCount: 1,
        completedHabitsCount,
        scheduledGroupsCount: 0,
        completedGroupsCount: 0,
        totalLoggedValue: completedHabitsCount,
      };
    });

    mockResolveIntensityLevel.mockImplementation((dayDetails) =>
      dayDetails.completedHabitsCount > 0 ? 2 : 0,
    );
    mockBuildHeatmapWeeks.mockReturnValue([
      {
        weekLabel: "2026-05-04",
        monthLabel: "May",
        cells: [],
      },
    ]);
    mockBuildPeriodSummary.mockReturnValue({
      completionRatePercent: 50,
      activeDaysCount: 1,
      bestStreak: 1,
      groupWinsCount: 0,
      perfectDaysCount: 0,
      strongestWeekdayLabel: "Wed",
      strongestWeekdayRatePercent: 100,
      totalLoggedValue: 1,
      averageDailyLoggedValue: 0.03,
    });
  });

  it("returns monday-first weekday labels", () => {
    expect(getStatsWeekdayLabels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("builds month insights and picks today as selected day by default", () => {
    const today = new Date(2026, 4, 6);

    const insights = buildStatsMonthInsights({
      habits: [],
      groups: [],
      monthDate: new Date(2026, 4, 10),
      selectedDateKey: null,
      summaryRange: "month",
      today,
    });

    expect(insights.monthLabel).toBe("May 2026");
    expect(insights.summaryRangeLabel).toBe("Selected month");
    expect(insights.calendarCells).toHaveLength(42);
    expect(insights.selectedDayDetails.dateKey).toBe("2026-05-06");
    expect(insights.heatmapWeeks).toEqual([
      {
        weekLabel: "2026-05-04",
        monthLabel: "May",
        cells: [],
      },
    ]);
    expect(insights.summary.completionRatePercent).toBe(50);
    expect(insights.calendarCells.some((cell) => cell.isToday && cell.dateKey === "2026-05-06")).toBe(
      true,
    );

    expect(mockBuildDayDetails).toHaveBeenCalledTimes(42);
    expect(mockBuildHeatmapWeeks).toHaveBeenCalledWith({
      habits: [],
      groups: [],
      endDate: new Date(2026, 4, 31),
      summaryRange: "month",
      today,
    });
  });

  it("builds selected day details for external valid selectedDateKey", () => {
    const today = new Date(2026, 4, 6);

    const insights = buildStatsMonthInsights({
      habits: [],
      groups: [],
      monthDate: new Date(2026, 4, 10),
      selectedDateKey: "2026-07-01",
      summaryRange: "month",
      today,
    });

    expect(insights.selectedDayDetails.dateKey).toBe("2026-07-01");
    expect(mockBuildDayDetails).toHaveBeenCalledTimes(43);
  });
});
