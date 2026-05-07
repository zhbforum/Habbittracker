import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps, ReactNode } from "react";
import { Animated, Text } from "react-native";

import { HomeFooter } from "@shared/navigation/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { createSupabaseUser } from "@/test/fixtures/auth";

import { ActivityHeatmap } from "../../components/ActivityHeatmap";
import { StatsCalendarSection } from "../../components/StatsCalendarSection";
import { StatsDayDetailsSection } from "../../components/StatsDayDetailsSection";
import { StatsOverviewSection } from "../../components/StatsOverviewSection";
import { useStatsScreenAnimations } from "../../hooks/useStatsScreenAnimations";
import { useStatsScreenController } from "../../hooks/useStatsScreenController";
import {
  chunkByWeek,
  createAppearStyle,
  filterDayGroupsByStatus,
  filterDayHabitsByStatus,
  getCompletedCountLabel,
  toActivityHeatmapWeeks,
} from "../../model/view";
import StatsScreen from "../StatsScreen";

function mockSafeAreaView({ children }: { children: ReactNode }) {
  return children;
}

function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: jest.fn(mockSafeAreaView),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

jest.mock("@shared/navigation/HomeFooter", () => ({
  HomeFooter: jest.fn(() => null),
}));

jest.mock("@features/stats/components/ActivityHeatmap", () => ({
  ActivityHeatmap: jest.fn(() => null),
}));

jest.mock("@features/stats/components/StatsCalendarSection", () => ({
  StatsCalendarSection: jest.fn(() => null),
}));

jest.mock("@features/stats/components/StatsDayDetailsSection", () => ({
  StatsDayDetailsSection: jest.fn(() => null),
}));

jest.mock("@features/stats/components/StatsOverviewSection", () => ({
  StatsOverviewSection: jest.fn(() => null),
}));

jest.mock("@features/stats/hooks/useStatsScreenController", () => ({
  useStatsScreenController: jest.fn(),
}));

jest.mock("@features/stats/hooks/useStatsScreenAnimations", () => ({
  useStatsScreenAnimations: jest.fn(),
}));

jest.mock("@features/stats/screens/StatsScreen.styles", () => ({
  createStatsScreenStyles: jest.fn(() => ({
    safeArea: {},
    content: {},
    scrollContent: {},
    errorBanner: {},
    errorText: {},
    retryButton: {},
    retryButtonText: {},
  })),
}));

jest.mock("@features/stats/model/view", () => ({
  chunkByWeek: jest.fn(),
  createAppearStyle: jest.fn(() => ({})),
  filterDayGroupsByStatus: jest.fn(),
  filterDayHabitsByStatus: jest.fn(),
  getCompletedCountLabel: jest.fn(),
  toActivityHeatmapWeeks: jest.fn(),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const statusBarMock = jest.mocked(StatusBar);
const useStatsScreenControllerMock = jest.mocked(useStatsScreenController);
const useStatsScreenAnimationsMock = jest.mocked(useStatsScreenAnimations);
const statsOverviewSectionMock = jest.mocked(StatsOverviewSection);
const statsCalendarSectionMock = jest.mocked(StatsCalendarSection);
const activityHeatmapMock = jest.mocked(ActivityHeatmap);
const statsDayDetailsSectionMock = jest.mocked(StatsDayDetailsSection);
const homeFooterMock = jest.mocked(HomeFooter);
const chunkByWeekMock = jest.mocked(chunkByWeek);
const toActivityHeatmapWeeksMock = jest.mocked(toActivityHeatmapWeeks);
const filterDayHabitsByStatusMock = jest.mocked(filterDayHabitsByStatus);
const filterDayGroupsByStatusMock = jest.mocked(filterDayGroupsByStatus);
const getCompletedCountLabelMock = jest.mocked(getCompletedCountLabel);
const createAppearStyleMock = jest.mocked(createAppearStyle);

type StatsScreenController = ReturnType<typeof useStatsScreenController>;

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

function createController(
  overrides: Partial<StatsScreenController> = {},
): StatsScreenController {
  return {
    isLoading: false,
    errorMessage: null,
    activeTab: "stats",
    handleTabPress: jest.fn(),
    weekdayLabels: ["Mon", "Tue", "Wed"],
    monthDate: new Date("2026-05-01T00:00:00.000Z"),
    monthLabel: "May 2026",
    summaryRange: "month",
    summaryRangeLabel: "May 2026",
    calendarCells: [
      {
        dateKey: "2026-05-06",
        dayOfMonth: 6,
        isCurrentMonth: true,
        isToday: true,
        scheduledHabitsCount: 2,
        completedHabitsCount: 1,
        scheduledGroupsCount: 1,
        completedGroupsCount: 1,
        intensityLevel: 3,
      },
    ],
    heatmapWeeks: [
      {
        weekLabel: "Week 1",
        monthLabel: "May",
        cells: [],
      },
    ],
    selectedDateKey: "2026-05-06",
    selectedDayDetails: {
      dateKey: "2026-05-06",
      dateLabel: "May 6",
      habits: [
        {
          id: "habit-1",
          name: "Read",
          iconId: "reading",
          iconColorId: "emerald",
          isScheduled: true,
          isCompleted: true,
          goalMetric: "checkins",
          goalPeriod: "day",
          goalTarget: 1,
          goalUnit: "times",
          loggedValue: 1,
          goalProgressPercent: 100,
        },
      ],
      groups: [
        {
          id: "group-1",
          name: "Health",
          iconId: "focus",
          isScheduled: true,
          isCompleted: false,
          targetCount: 1,
          completedHabitsCount: 0,
        },
      ],
      scheduledHabitsCount: 1,
      completedHabitsCount: 1,
      scheduledGroupsCount: 1,
      completedGroupsCount: 0,
      totalLoggedValue: 1.236,
    },
    monthSummary: {
      completionRatePercent: 50,
      activeDaysCount: 10,
      bestStreak: 4,
      groupWinsCount: 2,
      perfectDaysCount: 1,
      strongestWeekdayLabel: "Mon",
      strongestWeekdayRatePercent: 70,
      totalLoggedValue: 12,
      averageDailyLoggedValue: 1.2,
    },
    setSummaryRange: jest.fn(),
    selectDate: jest.fn(),
    goToPreviousMonth: jest.fn(),
    goToNextMonth: jest.fn(),
    jumpToToday: jest.fn(),
    openHabits: jest.fn(),
    openHabitById: jest.fn(),
    openGroupById: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  };
}

describe("StatsScreen", () => {
  const user = createSupabaseUser({ id: "stats-user-1" });

  beforeEach(() => {
    jest.clearAllMocks();

    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#111111",
      },
      isDark: false,
    } as ReturnType<typeof useAppTheme>);

    useStatsScreenControllerMock.mockReturnValue(createController());
    useStatsScreenAnimationsMock.mockReturnValue({
      headerAnim: new Animated.Value(1),
      calendarAnim: new Animated.Value(1),
      detailsAnim: new Animated.Value(1),
      monthContentStyle: {
        opacity: new Animated.Value(1),
        transform: [{ translateY: new Animated.Value(0) }],
      },
      summaryContentStyle: {
        opacity: new Animated.Value(1),
        transform: [{ translateY: new Animated.Value(0) }],
      },
      dayContentStyle: {
        opacity: new Animated.Value(1),
        transform: [{ translateY: new Animated.Value(0) }],
      },
    });

    chunkByWeekMock.mockReturnValue([["calendar-row"]] as unknown as ReturnType<typeof chunkByWeek>);
    toActivityHeatmapWeeksMock.mockReturnValue(
      [{ weekLabel: "W1", cells: [] }] as unknown as ReturnType<typeof toActivityHeatmapWeeks>,
    );
    filterDayHabitsByStatusMock.mockReturnValue(["habit"] as unknown as ReturnType<typeof filterDayHabitsByStatus>);
    filterDayGroupsByStatusMock.mockReturnValue(["group"] as unknown as ReturnType<typeof filterDayGroupsByStatus>);
    getCompletedCountLabelMock.mockReturnValue("1 completed");
    createAppearStyleMock.mockReturnValue({
      opacity: new Animated.Value(1),
      transform: [{
        translateY: new Animated.Value(0).interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0],
        }),
      }],
    });
  });

  it("Given controller state, When rendering screen, Then it maps view-model data to sections and applies derived values", () => {
    const controller = createController();
    useStatsScreenControllerMock.mockReturnValue(controller);

    render(<StatsScreen user={user} />);

    expect(useStatsScreenControllerMock).toHaveBeenCalledWith({
      user,
    });
    expect(chunkByWeekMock).toHaveBeenCalledWith(controller.calendarCells);
    expect(toActivityHeatmapWeeksMock).toHaveBeenCalledWith(controller.heatmapWeeks);
    expect(filterDayHabitsByStatusMock).toHaveBeenCalledWith(
      controller.selectedDayDetails.habits,
      "all",
    );
    expect(filterDayGroupsByStatusMock).toHaveBeenCalledWith(
      controller.selectedDayDetails.groups,
      "all",
    );
    expect(getCompletedCountLabelMock).toHaveBeenCalledWith(
      controller.selectedDayDetails,
      "all",
    );
    expect(getLastProps(statsOverviewSectionMock)).toEqual(
      expect.objectContaining({
        summaryRange: "month",
        summaryRangeLabel: "May 2026",
        monthSummary: controller.monthSummary,
        onSelectSummaryRange: controller.setSummaryRange,
      }),
    );
    expect(getLastProps(statsCalendarSectionMock)).toEqual(
      expect.objectContaining({
        monthLabel: "May 2026",
        selectedDateKey: "2026-05-06",
        onSelectDate: controller.selectDate,
      }),
    );
    expect(getLastProps(activityHeatmapMock)).toEqual(
      expect.objectContaining({
        selectedCellKey: "2026-05-06",
        onPressCell: controller.selectDate,
      }),
    );
    expect(getLastProps(statsDayDetailsSectionMock)).toEqual(
      expect.objectContaining({
        selectedDayLoggedValue: 1.24,
        detailsFilter: "all",
        onOpenHabitById: controller.openHabitById,
        onOpenGroupById: controller.openGroupById,
      }),
    );
    expect(getLastProps(homeFooterMock)).toEqual(
      expect.objectContaining({
        activeTab: "stats",
        onTabPress: controller.handleTabPress,
      }),
    );
    expect(statusBarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        style: "dark",
      }),
    );
  });

  it("Given error message exists, When pressing retry action, Then it invokes reload callback", () => {
    const controller = createController({
      errorMessage: "Unable to load stats",
    });
    useStatsScreenControllerMock.mockReturnValue(controller);

    render(<StatsScreen user={user} />);

    expect(screen.getByText("Unable to load stats")).toBeTruthy();
    fireEvent.press(screen.getByText("Retry"));
    expect(controller.reload).toHaveBeenCalledTimes(1);
  });

  it("Given day filter changes, When selecting completed filter from details section, Then it recalculates filtered items using new filter", () => {
    render(<StatsScreen user={user} />);

    const detailsProps = getLastProps(statsDayDetailsSectionMock) as {
      onSelectFilter: (filter: "all" | "completed" | "pending") => void;
    };

    act(() => {
      detailsProps.onSelectFilter("completed");
    });

    expect(filterDayHabitsByStatusMock).toHaveBeenLastCalledWith(
      expect.any(Array),
      "completed",
    );
    expect(filterDayGroupsByStatusMock).toHaveBeenLastCalledWith(
      expect.any(Array),
      "completed",
    );
    expect(getCompletedCountLabelMock).toHaveBeenLastCalledWith(
      expect.any(Object),
      "completed",
    );
    expect(getLastProps(statsDayDetailsSectionMock)).toEqual(
      expect.objectContaining({
        detailsFilter: "completed",
      }),
    );
  });

  it("Given dark theme mode, When rendering screen, Then status bar uses light content style", () => {
    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#000000",
      },
      isDark: true,
    } as ReturnType<typeof useAppTheme>);

    render(<StatsScreen user={user} />);

    expect(statusBarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        style: "light",
      }),
    );
  });
});
