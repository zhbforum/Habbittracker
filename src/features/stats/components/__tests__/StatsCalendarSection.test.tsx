import type { ComponentProps } from "react";
import { Animated, Text } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import type { StatsCalendarCell } from "@features/stats/model/types";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";
import type { ThemeColors } from "@/shared/theme";

import { StatsCalendarSection } from "../StatsCalendarSection";

const mockGetIntensityColor = jest.fn();

const mockAppText = ({ children, ...props }: any) => (
  <Text {...props}>{children}</Text>
);

jest.mock("@/shared/ui", () => ({
  AppText: (props: any) => mockAppText(props),
}));

jest.mock("lucide-react-native", () => ({
  CalendarCheck2: jest.fn(() => null),
  ChevronLeft: jest.fn(() => null),
  ChevronRight: jest.fn(() => null),
}));

jest.mock("@features/stats/model/view", () => ({
  getIntensityColor: (level: number, colors: unknown) =>
    mockGetIntensityColor(level, colors),
}));

const colors = {
  textSecondary: "#222222",
  accentText: "#333333",
} as unknown as ThemeColors;

const styles = {
  calendarCard: { padding: 1 },
  calendarHeader: { padding: 2 },

  monthNavButton: { padding: 3 },
  monthLabelWrap: { padding: 4 },
  monthTitle: { fontSize: 20 },
  todayButton: { padding: 5 },
  todayButtonText: { fontSize: 12 },

  monthContentWrap: { opacity: 1 },
  weekdayRow: { flexDirection: "row" },
  weekdayCell: { width: 10 },
  weekdayLabel: { fontSize: 10 },

  calendarGrid: { gap: 1 },
  weekRow: { flexDirection: "row" },

  dayCell: { width: 40 },
  dayCellOutsideMonth: { opacity: 0.4 },
  dayCellToday: { borderWidth: 1 },
  dayCellSelected: { backgroundColor: "selected" },

  dayLabel: { color: "default" },
  dayLabelOutsideMonth: { color: "outside" },
  dayLabelSelected: { color: "selected-label" },

  dayMarksRow: { flexDirection: "row" },
  dayMarkDot: { width: 4 },
  dayMarkRing: { width: 6 },
  dayMarkRingDone: { borderColor: "done" },

  legendRow: { flexDirection: "row" },
  legendItem: { flexDirection: "row" },
  legendText: { fontSize: 11 },
} as unknown as StatsScreenStyles;

const monthContentStyle = {
  opacity: new Animated.Value(1),
  transform: [{ translateY: new Animated.Value(0) }],
};

type NodeWithStyleProp = {
  props: {
    style?: unknown;
  };
};

type NodeWithFindAll = {
  findAll: (
    predicate: (node: NodeWithStyleProp) => boolean,
  ) => NodeWithStyleProp[];
};

function hasAllStyles(style: unknown, expectedStyles: unknown[]) {
  return (
    Array.isArray(style) &&
    expectedStyles.every((expectedStyle) => style.includes(expectedStyle))
  );
}

function findCompletedRingNodes(cell: NodeWithFindAll) {
  return cell.findAll((node: NodeWithStyleProp) =>
    hasAllStyles(node.props.style, [
      styles.dayMarkRing,
      styles.dayMarkRingDone,
    ]),
  );
}

function createCalendarCell(
  overrides: Partial<StatsCalendarCell>,
): StatsCalendarCell {
  return {
    dateKey: "2026-05-01",
    dayOfMonth: 1,
    isCurrentMonth: true,
    isToday: false,
    intensityLevel: 0,
    completedGroupsCount: 0,
    ...overrides,
  } as StatsCalendarCell;
}

const calendarRows: StatsCalendarCell[][] = [
  [
    createCalendarCell({
      dateKey: "2026-04-30",
      dayOfMonth: 30,
      isCurrentMonth: false,
      isToday: false,
      intensityLevel: 0,
      completedGroupsCount: 0,
    }),
    createCalendarCell({
      dateKey: "2026-05-01",
      dayOfMonth: 1,
      isCurrentMonth: true,
      isToday: false,
      intensityLevel: 1,
      completedGroupsCount: 0,
    }),
  ],
  [
    createCalendarCell({
      dateKey: "2026-05-06",
      dayOfMonth: 6,
      isCurrentMonth: true,
      isToday: true,
      intensityLevel: 3,
      completedGroupsCount: 1,
    }),
    createCalendarCell({
      dateKey: "2026-05-07",
      dayOfMonth: 7,
      isCurrentMonth: true,
      isToday: false,
      intensityLevel: 2,
      completedGroupsCount: 0,
    }),
  ],
];

type StatsCalendarSectionTestProps = ComponentProps<
  typeof StatsCalendarSection
>;

function renderSection(overrides: Partial<StatsCalendarSectionTestProps> = {}) {
  const props: StatsCalendarSectionTestProps = {
    styles,
    colors,
    monthLabel: "May 2026",
    weekdayLabels: ["Mon", "Tue", "Wed"],
    calendarRows,
    selectedDateKey: "2026-05-06",
    monthContentStyle,
    onSelectDate: jest.fn(),
    onGoToPreviousMonth: jest.fn(),
    onGoToNextMonth: jest.fn(),
    onJumpToToday: jest.fn(),
    ...overrides,
  };

  const view = render(<StatsCalendarSection {...props} />);

  return {
    ...view,
    props,
  };
}

describe("StatsCalendarSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetIntensityColor.mockImplementation(
      (level: number) => `intensity-${level}`,
    );
  });

  it("renders month label, today action, weekday labels and legend", () => {
    renderSection();

    expect(screen.getByText("May 2026")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();

    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Tue")).toBeTruthy();
    expect(screen.getByText("Wed")).toBeTruthy();

    expect(screen.getByText("Habit completion")).toBeTruthy();
    expect(screen.getByText("Group goal reached")).toBeTruthy();
  });

  it("renders calendar days from all calendar rows", () => {
    renderSection();

    expect(screen.getByText("30")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("marks selected, today and outside-month cells with expected styles", () => {
    renderSection();

    const selectedTodayCell = screen.getByLabelText("Select 2026-05-06");
    const outsideMonthCell = screen.getByLabelText("Select 2026-04-30");

    expect(selectedTodayCell.props.accessibilityState).toEqual({
      selected: true,
    });

    expect(selectedTodayCell.props.style).toEqual(
      expect.arrayContaining([
        styles.dayCell,
        styles.dayCellToday,
        styles.dayCellSelected,
      ]),
    );

    expect(outsideMonthCell.props.style).toEqual(
      expect.arrayContaining([styles.dayCell, styles.dayCellOutsideMonth]),
    );
  });

  it("calls onSelectDate with the pressed cell date key", () => {
    const { props } = renderSection();

    fireEvent.press(screen.getByLabelText("Select 2026-05-07"));

    expect(props.onSelectDate).toHaveBeenCalledTimes(1);
    expect(props.onSelectDate).toHaveBeenCalledWith("2026-05-07");
  });

  it("calls month navigation and jump-to-today actions", () => {
    const { props } = renderSection();

    fireEvent.press(screen.getByLabelText("Go to previous month"));
    fireEvent.press(screen.getByLabelText("Go to next month"));
    fireEvent.press(screen.getByLabelText("Jump to today"));

    expect(props.onGoToPreviousMonth).toHaveBeenCalledTimes(1);
    expect(props.onGoToNextMonth).toHaveBeenCalledTimes(1);
    expect(props.onJumpToToday).toHaveBeenCalledTimes(1);
  });

  it("uses getIntensityColor for every day dot and the legend dot", () => {
    renderSection();

    expect(mockGetIntensityColor).toHaveBeenCalledWith(0, colors);
    expect(mockGetIntensityColor).toHaveBeenCalledWith(1, colors);
    expect(mockGetIntensityColor).toHaveBeenCalledWith(2, colors);
    expect(mockGetIntensityColor).toHaveBeenCalledWith(3, colors);

    expect(mockGetIntensityColor).toHaveBeenCalledTimes(5);
  });

  it("applies completed group ring style only for days with completed groups", () => {
    renderSection();

    const completedGroupCell = screen.getByLabelText("Select 2026-05-06");
    const incompleteGroupCell = screen.getByLabelText("Select 2026-05-07");

    expect(findCompletedRingNodes(completedGroupCell).length).toBeGreaterThan(0);
    expect(findCompletedRingNodes(incompleteGroupCell)).toHaveLength(0);
  });
});