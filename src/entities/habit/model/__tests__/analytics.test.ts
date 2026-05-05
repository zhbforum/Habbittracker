import type { Habit, HabitWithMetrics } from "../types";
import { buildHabitMetrics, buildHabitSummary, withHabitMetrics } from "../analytics";

const mockGetCompletionValue = jest.fn();
const mockResolveGoalProgressRange = jest.fn();
const mockSumCompletionValuesInRange = jest.fn();
const mockBuildCurrentStreak = jest.fn();
const mockBuildBestStreak = jest.fn();
const mockBuildHeatmap = jest.fn();
const mockBuildWeeklyPerformance = jest.fn();
const mockIsHabitCompletedForDate = jest.fn();
const mockIsHabitScheduledOnDate = jest.fn();

jest.mock("../completions", () => ({
  getCompletionValue: (...args: Parameters<typeof mockGetCompletionValue>) =>
    mockGetCompletionValue(...args),
  resolveGoalProgressRange: (...args: Parameters<typeof mockResolveGoalProgressRange>) =>
    mockResolveGoalProgressRange(...args),
  sumCompletionValuesInRange: (...args: Parameters<typeof mockSumCompletionValuesInRange>) =>
    mockSumCompletionValuesInRange(...args),
}));

jest.mock("../habitAnalyticsStreak", () => ({
  buildCurrentStreak: (...args: Parameters<typeof mockBuildCurrentStreak>) =>
    mockBuildCurrentStreak(...args),
  buildBestStreak: (...args: Parameters<typeof mockBuildBestStreak>) =>
    mockBuildBestStreak(...args),
}));

jest.mock("../habitAnalyticsVisuals", () => ({
  buildHeatmap: (...args: Parameters<typeof mockBuildHeatmap>) => mockBuildHeatmap(...args),
  buildWeeklyPerformance: (...args: Parameters<typeof mockBuildWeeklyPerformance>) =>
    mockBuildWeeklyPerformance(...args),
}));

jest.mock("../schedule", () => ({
  isHabitCompletedForDate: (...args: Parameters<typeof mockIsHabitCompletedForDate>) =>
    mockIsHabitCompletedForDate(...args),
  isHabitScheduledOnDate: (...args: Parameters<typeof mockIsHabitScheduledOnDate>) =>
    mockIsHabitScheduledOnDate(...args),
}));

function createHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id,
    userId: "user-1",
    name: `Habit ${id}`,
    kind: "positive",
    frequency: "daily",
    reminderTime: "08:00",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "value",
      period: "week",
      target: 10,
      unit: "cups",
    },
    completions: {},
  };

  return {
    ...base,
    ...overrides,
    goal: {
      ...base.goal,
      ...(overrides.goal ?? {}),
    },
    completions: {
      ...base.completions,
      ...(overrides.completions ?? {}),
    },
  };
}

describe("habit analytics model", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockResolveGoalProgressRange.mockReturnValue({
      startDate: new Date(2026, 4, 4),
      endDate: new Date(2026, 4, 10),
      periodLabel: "This week",
    });
    mockSumCompletionValuesInRange.mockReturnValue(7);
    mockBuildCurrentStreak.mockReturnValue(4);
    mockBuildBestStreak.mockReturnValue(9);
    mockBuildHeatmap.mockReturnValue([{ weekLabel: "w1", cells: [] }]);
    mockBuildWeeklyPerformance.mockReturnValue([
      {
        dateKey: "2026-05-04",
        label: "Mon",
        dayOfMonthLabel: "4",
        scheduled: true,
        completed: true,
      },
      {
        dateKey: "2026-05-05",
        label: "Tue",
        dayOfMonthLabel: "5",
        scheduled: true,
        completed: false,
      },
      {
        dateKey: "2026-05-06",
        label: "Wed",
        dayOfMonthLabel: "6",
        scheduled: false,
        completed: false,
      },
    ]);
    mockIsHabitCompletedForDate.mockReturnValue(true);
    mockGetCompletionValue.mockReturnValue(2);
    mockIsHabitScheduledOnDate.mockReturnValue(true);
  });

  it("builds full metrics payload", () => {
    const habit = createHabit("h1");
    const today = new Date(2026, 4, 6);

    const metrics = buildHabitMetrics(habit, today);

    expect(metrics).toEqual({
      completedToday: true,
      todayLoggedValue: 2,
      goalProgress: {
        period: "week",
        target: 10,
        currentValue: 7,
        remainingValue: 3,
        progressPercent: 70,
        periodLabel: "This week",
      },
      currentStreak: 4,
      bestStreak: 9,
      weeklyPerformance: mockBuildWeeklyPerformance.mock.results[0]?.value,
      weeklyCompletedCount: 1,
      weeklyScheduledCount: 2,
      heatmap: [{ weekLabel: "w1", cells: [] }],
    });

    expect(mockGetCompletionValue).toHaveBeenCalledWith(habit, "2026-05-06");
    expect(mockIsHabitCompletedForDate).toHaveBeenCalledWith(habit, today);
    expect(mockBuildWeeklyPerformance).toHaveBeenCalledWith(habit, today);
    expect(mockBuildHeatmap).toHaveBeenCalledWith(habit, today);
    expect(mockResolveGoalProgressRange).toHaveBeenCalledWith("week", today);

    const sumArgs = mockSumCompletionValuesInRange.mock.calls[0]?.[0];
    expect(sumArgs).toEqual(
      expect.objectContaining({
        habit,
        startDate: new Date(2026, 4, 4),
        endDate: new Date(2026, 4, 10),
        onlyScheduled: expect.any(Function),
      }),
    );
    expect(sumArgs.onlyScheduled(new Date(2026, 4, 7))).toBe(true);
    expect(mockIsHabitScheduledOnDate).toHaveBeenCalledWith(habit, new Date(2026, 4, 7));
  });

  it("returns zero percent progress when target is not positive", () => {
    const habit = createHabit("h2", {
      goal: {
        metric: "value",
        period: "week",
        target: 0,
        unit: "cups",
      },
    });
    mockSumCompletionValuesInRange.mockReturnValue(5);

    const metrics = buildHabitMetrics(habit, new Date(2026, 4, 6));

    expect(metrics.goalProgress.progressPercent).toBe(0);
    expect(metrics.goalProgress.remainingValue).toBe(0);
  });

  it("attaches metrics for every habit", () => {
    const habits = [createHabit("h1"), createHabit("h2", { kind: "negative" })];

    const result = withHabitMetrics(habits, new Date(2026, 4, 6));

    expect(result).toHaveLength(2);
    expect(result[0]?.metrics).toBeDefined();
    expect(result[1]?.metrics).toBeDefined();
    expect(mockBuildWeeklyPerformance).toHaveBeenCalledTimes(2);
  });

  it("builds summary counts from habits with metrics", () => {
    const habits: HabitWithMetrics[] = [
      {
        ...createHabit("h1", { kind: "positive" }),
        metrics: { completedToday: true } as HabitWithMetrics["metrics"],
      },
      {
        ...createHabit("h2", { kind: "negative" }),
        metrics: { completedToday: false } as HabitWithMetrics["metrics"],
      },
      {
        ...createHabit("h3", { kind: "positive" }),
        metrics: { completedToday: true } as HabitWithMetrics["metrics"],
      },
    ];

    expect(buildHabitSummary(habits)).toEqual({
      total: 3,
      positive: 2,
      negative: 1,
      completedToday: 2,
    });
  });
});
