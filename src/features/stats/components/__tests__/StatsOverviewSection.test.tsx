import type { ComponentProps } from "react";
import { Animated, StyleSheet } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import type { ThemeColors } from "@/shared/theme";
import { SUMMARY_RANGE_OPTIONS } from "@features/stats/model/view";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";
import { StatsOverviewSection } from "../StatsOverviewSection";

jest.mock("lucide-react-native", () => ({
  CalendarCheck2: () => null,
  Flame: () => null,
  Sparkles: () => null,
  Target: () => null,
}));

type Props = ComponentProps<typeof StatsOverviewSection>;

const styles = {
  headerBlock: {},
  title: {},
  subtitle: {},

  summaryRangeRow: {},
  summaryRangeButton: {},
  summaryRangeButtonActive: { borderWidth: 2 },
  summaryRangeButtonText: {},
  summaryRangeButtonTextActive: { fontWeight: "700" },

  summaryRangeMetaText: {},

  summaryGrid: {},
  summaryCard: {},
  summaryValue: {},
  summaryLabel: {},
  summaryInlineValue: {},

  insightsRow: {},
  insightChip: {},
  insightChipText: {},
} as unknown as StatsScreenStyles;

const colors = {
  accentText: "#2563eb",
} as unknown as ThemeColors;

const monthSummary: Props["monthSummary"] = {
  completionRatePercent: 86,
  activeDaysCount: 18,
  bestStreak: 9,
  groupWinsCount: 5,
  perfectDaysCount: 7,
  strongestWeekdayLabel: "Monday",
  strongestWeekdayRatePercent: 92,
  totalLoggedValue: 42.5,
  averageDailyLoggedValue: 2.4,
};

function makeSummaryContentStyle(): Props["summaryContentStyle"] {
  return {
    opacity: new Animated.Value(1),
    transform: [{ translateY: new Animated.Value(0) }],
  };
}

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    styles,
    colors,
    summaryRange: SUMMARY_RANGE_OPTIONS[0].id,
    summaryRangeLabel: "Last 30 days",
    monthSummary,
    summaryContentStyle: makeSummaryContentStyle(),
    onSelectSummaryRange: jest.fn(),
    ...overrides,
  };
}

function renderComponent(overrides: Partial<Props> = {}) {
  const props = makeProps(overrides);

  render(<StatsOverviewSection {...props} />);

  return props;
}

describe("StatsOverviewSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header, subtitle and summary range meta label", () => {
    renderComponent();

    expect(screen.getByText("Stats")).toBeTruthy();
    expect(
      screen.getByText(
        "Calendar-first insights to understand your rhythm and keep your streaks stable.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Last 30 days")).toBeTruthy();
  });

  it("renders all summary range options", () => {
    renderComponent();

    for (const option of SUMMARY_RANGE_OPTIONS) {
      expect(screen.getByText(option.label)).toBeTruthy();
    }
  });

  it("highlights active summary range", () => {
    const activeOption = SUMMARY_RANGE_OPTIONS[1];

    renderComponent({
      summaryRange: activeOption.id,
    });

    const activeTextStyle = StyleSheet.flatten(
      screen.getByText(activeOption.label).props.style,
    );

    expect(activeTextStyle).toMatchObject({
      fontWeight: "700",
    });

    for (const option of SUMMARY_RANGE_OPTIONS) {
      if (option.id === activeOption.id) {
        continue;
      }

      const inactiveTextStyle = StyleSheet.flatten(
        screen.getByText(option.label).props.style,
      );

      expect(inactiveTextStyle.fontWeight).not.toBe("700");
    }
  });

  it("calls onSelectSummaryRange with selected range id", () => {
    const onSelectSummaryRange = jest.fn();

    renderComponent({
      onSelectSummaryRange,
    });

    for (const option of SUMMARY_RANGE_OPTIONS) {
      fireEvent.press(screen.getByText(option.label));
      expect(onSelectSummaryRange).toHaveBeenLastCalledWith(option.id);
    }

    expect(onSelectSummaryRange).toHaveBeenCalledTimes(
      SUMMARY_RANGE_OPTIONS.length,
    );
  });

  it("renders summary cards with values and labels", () => {
    renderComponent();

    expect(screen.getByText("86%")).toBeTruthy();
    expect(screen.getByText("Completion rate")).toBeTruthy();

    expect(screen.getByText("18")).toBeTruthy();
    expect(screen.getByText("Active days")).toBeTruthy();

    expect(screen.getByText("9d")).toBeTruthy();
    expect(screen.getByText("Best streak")).toBeTruthy();

    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("Group wins")).toBeTruthy();

    expect(screen.getByText("42.5")).toBeTruthy();
    expect(screen.getByText("Logged value")).toBeTruthy();

    expect(screen.getByText("2.4")).toBeTruthy();
    expect(screen.getByText("Daily avg value")).toBeTruthy();
  });

  it("renders insight chips", () => {
    renderComponent();

    expect(screen.getByText("Perfect days: 7")).toBeTruthy();
    expect(screen.getByText("Strongest day: Monday 92%")).toBeTruthy();
  });
});
