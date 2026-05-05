import { toDateKey } from "@entities/habit/model/date";

import { buildHeatmapWeeks } from "../calendarHeatmap";

const mockBuildDayDetails = jest.fn();
const mockResolveIntensityLevel = jest.fn();

jest.mock("../calendarDayBuilders", () => ({
  buildDayDetails: (...args: Parameters<typeof mockBuildDayDetails>) =>
    mockBuildDayDetails(...args),
  resolveIntensityLevel: (...args: Parameters<typeof mockResolveIntensityLevel>) =>
    mockResolveIntensityLevel(...args),
}));

describe("buildHeatmapWeeks", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockBuildDayDetails.mockImplementation((_, __, date: Date) => {
      const dateKey = toDateKey(date);

      if (dateKey === "2026-05-06") {
        return {
          dateKey,
          dateLabel: "May 6, 2026",
          habits: [],
          groups: [],
          scheduledHabitsCount: 2,
          completedHabitsCount: 1,
          scheduledGroupsCount: 0,
          completedGroupsCount: 0,
          totalLoggedValue: 0,
        };
      }

      if (dateKey === "2026-05-07") {
        return {
          dateKey,
          dateLabel: "May 7, 2026",
          habits: [],
          groups: [],
          scheduledHabitsCount: 1,
          completedHabitsCount: 1,
          scheduledGroupsCount: 1,
          completedGroupsCount: 1,
          totalLoggedValue: 0,
        };
      }

      return {
        dateKey,
        dateLabel: "No activity",
        habits: [],
        groups: [],
        scheduledHabitsCount: 0,
        completedHabitsCount: 0,
        scheduledGroupsCount: 0,
        completedGroupsCount: 0,
        totalLoggedValue: 0,
      };
    });

    mockResolveIntensityLevel.mockImplementation((dayDetails) => {
      const completedTotal = dayDetails.completedHabitsCount + dayDetails.completedGroupsCount;
      return completedTotal > 0 ? 2 : 0;
    });
  });

  it("builds month heatmap grid with completion rate and today marker", () => {
    const weeks = buildHeatmapWeeks({
      habits: [],
      groups: [],
      endDate: new Date(2026, 4, 31),
      summaryRange: "month",
      today: new Date(2026, 4, 6),
    });

    expect(weeks).toHaveLength(12);
    expect(weeks.every((week) => week.cells.length === 7)).toBe(true);
    expect(weeks[0]?.weekLabel).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const allCells = weeks.flatMap((week) => week.cells);
    const todayCell = allCells.find((cell) => cell.isToday);
    const fullyCompletedCell = allCells.find((cell) => cell.dateKey === "2026-05-07");

    expect(todayCell).toBeDefined();
    expect(todayCell?.dateKey).toBe("2026-05-06");
    expect(todayCell?.completionRatePercent).toBe(50);
    expect(todayCell?.intensityLevel).toBe(2);

    expect(fullyCompletedCell?.completionRatePercent).toBe(100);
    expect(fullyCompletedCell?.intensityLevel).toBe(2);

    expect(mockBuildDayDetails).toHaveBeenCalledTimes(12 * 7);
    expect(mockResolveIntensityLevel).toHaveBeenCalledTimes(12 * 7);
  });

  it.each([
    ["month", 12],
    ["three_months", 18],
    ["year", 53],
  ] as const)("builds %s range with %i weeks", (summaryRange, expectedWeeks) => {
    const weeks = buildHeatmapWeeks({
      habits: [],
      groups: [],
      endDate: new Date(2026, 4, 31),
      summaryRange,
      today: new Date(2026, 4, 6),
    });

    expect(weeks).toHaveLength(expectedWeeks);
    expect(weeks.every((week) => week.cells.length === 7)).toBe(true);
  });
});
