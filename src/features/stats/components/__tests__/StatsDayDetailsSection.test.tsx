import type { ComponentProps } from "react";
import { Animated, StyleSheet } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import {
  getHabitIconById,
  getHabitIconColorById,
} from "@entities/habit/model/icons";
import type { ThemeColors } from "@/shared/theme";
import type { StatsDayDetails } from "@features/stats/model/types";
import { DAY_DETAILS_FILTERS } from "@features/stats/model/view";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";
import { StatsDayDetailsSection } from "../StatsDayDetailsSection";

jest.mock("@entities/habit/model/icons", () => {
  function NullIcon() {
    return null;
  }

  return {
    getHabitIconById: jest.fn(() => NullIcon),
    getHabitIconColorById: jest.fn(
      (iconColorId: string) => `mock-color-${iconColorId}`,
    ),
  };
});

jest.mock("lucide-react-native", () => ({
  Check: () => null,
}));

type Props = ComponentProps<typeof StatsDayDetailsSection>;

const getHabitIconByIdMock = jest.mocked(getHabitIconById);
const getHabitIconColorByIdMock = jest.mocked(getHabitIconColorById);

const styles = {
  dayDetailsCard: {},
  dayDetailsHeader: {},
  dayDetailsHeaderTextWrap: {},
  dayDetailsTitle: {},
  dayDetailsSubtitle: {},

  filtersRow: {},
  filterButton: {},
  filterButtonActive: { borderWidth: 2 },
  filterButtonText: {},
  filterButtonTextActive: { fontWeight: "700" },

  filterHintText: {},

  loaderWrap: {},
  loaderText: {},

  sectionBlock: {},
  sectionTitle: {},

  emptyBlock: {},
  emptyText: {},

  rowsList: {},
  activityRow: {},
  activityIconWrap: {},
  activityIdentity: {},
  activityName: {},
  activityMeta: {},

  doneChip: {},
  doneChipText: {},

  pendingChip: {},
  pendingChipText: {},
} as unknown as StatsScreenStyles;

const colors = {
  textPrimary: "#111111",
  successText: "#16a34a",
  accentText: "#2563eb",
} as unknown as ThemeColors;

const habits: StatsDayDetails["habits"] = [
  {
    id: "habit-1",
    name: "Morning run",
    iconId: "run",
    iconColorId: "emerald",
    goalMetric: "checkins",
    goalPeriod: "day",
    loggedValue: 1,
    goalUnit: "",
    goalTarget: 1,
    goalProgressPercent: 100,
    isCompleted: true,
    isScheduled: true,
  },
  {
    id: "habit-2",
    name: "Read book",
    iconId: "reading",
    iconColorId: "sky",
    goalMetric: "checkins",
    goalPeriod: "day",
    loggedValue: 0,
    goalUnit: "",
    goalTarget: 1,
    goalProgressPercent: 0,
    isCompleted: false,
    isScheduled: true,
  },
  {
    id: "habit-3",
    name: "Extra meditation",
    iconId: "meditation",
    iconColorId: "violet",
    goalMetric: "checkins",
    goalPeriod: "day",
    loggedValue: 0,
    goalUnit: "",
    goalTarget: 1,
    goalProgressPercent: 0,
    isCompleted: false,
    isScheduled: false,
  },
  {
    id: "habit-4",
    name: "Drink water",
    iconId: "water",
    iconColorId: "ocean",
    goalMetric: "value",
    goalPeriod: "day",
    loggedValue: 2.345,
    goalUnit: "l",
    goalTarget: 2,
    goalProgressPercent: 117,
    isCompleted: true,
    isScheduled: true,
  },
  {
    id: "habit-5",
    name: "Walk distance",
    iconId: "walk",
    iconColorId: "orange",
    goalMetric: "value",
    goalPeriod: "day",
    loggedValue: 2.5,
    goalUnit: "km",
    goalTarget: 5,
    goalProgressPercent: 50,
    isCompleted: false,
    isScheduled: true,
  },
];

const groups: StatsDayDetails["groups"] = [
  {
    id: "group-1",
    name: "Health",
    iconId: "workout",
    completedHabitsCount: 3,
    targetCount: 3,
    isCompleted: true,
    isScheduled: true,
  },
  {
    id: "group-2",
    name: "Empty group",
    iconId: "focus",
    completedHabitsCount: 0,
    targetCount: 0,
    isCompleted: false,
    isScheduled: true,
  },
];

const selectedDayDetails: StatsDayDetails = {
  dateKey: "2026-05-06",
  dateLabel: "May 6, 2026",
  completedHabitsCount: 2,
  scheduledHabitsCount: 5,
  completedGroupsCount: 1,
  scheduledGroupsCount: 2,
  totalLoggedValue: 7,
  habits,
  groups,
};

function makeDayContentStyle(): Props["dayContentStyle"] {
  return {
    opacity: new Animated.Value(1),
    transform: [{ translateY: new Animated.Value(0) }],
  };
}

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    styles,
    colors,
    selectedDayDetails,
    selectedDayLoggedValue: 7,
    detailsFilter: DAY_DETAILS_FILTERS[0].id,
    completedCountLabel: "2 completed activities",
    isLoading: false,
    filteredHabits: habits,
    filteredGroups: groups,
    dayContentStyle: makeDayContentStyle(),
    onSelectFilter: jest.fn(),
    onOpenHabitById: jest.fn(),
    onOpenGroupById: jest.fn(),
    ...overrides,
  };
}

function renderComponent(overrides: Partial<Props> = {}) {
  const props = makeProps(overrides);

  render(<StatsDayDetailsSection {...props} />);

  return props;
}

describe("StatsDayDetailsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders day summary, filters and completed count label", () => {
    renderComponent({
      filteredHabits: [],
      filteredGroups: [],
    });

    expect(screen.getByText("May 6, 2026")).toBeTruthy();
    expect(
      screen.getByText("Habits 2/5 | Groups 1/2 | Logged value 7"),
    ).toBeTruthy();
    expect(screen.getByText("2 completed activities")).toBeTruthy();

    for (const filter of DAY_DETAILS_FILTERS) {
      expect(screen.getByText(filter.label)).toBeTruthy();
    }
  });

  it("highlights active filter and calls onSelectFilter with selected filter id", () => {
    const activeFilter = DAY_DETAILS_FILTERS[1];
    const inactiveFilter = DAY_DETAILS_FILTERS.find(
      (filter) => filter.id !== activeFilter.id,
    );
    const onSelectFilter = jest.fn();

    renderComponent({
      detailsFilter: activeFilter.id,
      filteredHabits: [],
      filteredGroups: [],
      onSelectFilter,
    });

    const activeFilterStyle = StyleSheet.flatten(
      screen.getByText(activeFilter.label).props.style,
    );

    expect(activeFilterStyle).toMatchObject({
      fontWeight: "700",
    });

    if (inactiveFilter) {
      const inactiveFilterStyle = StyleSheet.flatten(
        screen.getByText(inactiveFilter.label).props.style,
      );

      expect(inactiveFilterStyle.fontWeight).not.toBe("700");
    }

    for (const filter of DAY_DETAILS_FILTERS) {
      fireEvent.press(screen.getByText(filter.label));
      expect(onSelectFilter).toHaveBeenLastCalledWith(filter.id);
    }

    expect(onSelectFilter).toHaveBeenCalledTimes(DAY_DETAILS_FILTERS.length);
  });

  it("renders loading state instead of habits and groups", () => {
    renderComponent({
      isLoading: true,
    });

    expect(screen.getByText("Loading stats...")).toBeTruthy();

    expect(screen.queryByText("Morning run")).toBeNull();
    expect(screen.queryByText("Health")).toBeNull();
  });

  it("renders empty states when filtered habits and groups are empty", () => {
    renderComponent({
      filteredHabits: [],
      filteredGroups: [],
    });

    expect(screen.getByText("Habits")).toBeTruthy();
    expect(screen.getByText("Groups")).toBeTruthy();
    expect(
      screen.getByText("No habits for this filter on this day."),
    ).toBeTruthy();
    expect(
      screen.getByText("No groups for this filter on this day."),
    ).toBeTruthy();
  });

  it("renders habit rows with correct labels, meta texts and chips", () => {
    renderComponent();

    expect(screen.getByText("Morning run")).toBeTruthy();
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getByText("Done")).toBeTruthy();

    expect(screen.getByText("Read book")).toBeTruthy();
    expect(screen.getByText("Scheduled, not completed")).toBeTruthy();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);

    expect(screen.getByText("Extra meditation")).toBeTruthy();
    expect(screen.getByText("Completed outside schedule")).toBeTruthy();

    expect(screen.getByText("Drink water")).toBeTruthy();
    expect(screen.getByText("2.35 l logged | 117% of goal")).toBeTruthy();
    expect(screen.getByText("Target hit")).toBeTruthy();

    expect(screen.getByText("Walk distance")).toBeTruthy();
    expect(screen.getByText("2.5 km logged | 50% of goal")).toBeTruthy();
    expect(screen.getByText("2.5/5")).toBeTruthy();
  });

  it("uses habit icon and color presenters for every rendered habit", () => {
    renderComponent();

    expect(getHabitIconByIdMock).toHaveBeenCalledWith("run");
    expect(getHabitIconByIdMock).toHaveBeenCalledWith("reading");
    expect(getHabitIconByIdMock).toHaveBeenCalledWith("meditation");
    expect(getHabitIconByIdMock).toHaveBeenCalledWith("water");
    expect(getHabitIconByIdMock).toHaveBeenCalledWith("walk");

    expect(getHabitIconColorByIdMock).toHaveBeenCalledWith("emerald");
    expect(getHabitIconColorByIdMock).toHaveBeenCalledWith("sky");
    expect(getHabitIconColorByIdMock).toHaveBeenCalledWith("violet");
    expect(getHabitIconColorByIdMock).toHaveBeenCalledWith("ocean");
    expect(getHabitIconColorByIdMock).toHaveBeenCalledWith("orange");
  });

  it("calls onOpenHabitById when habit rows are pressed", () => {
    const onOpenHabitById = jest.fn();

    renderComponent({
      onOpenHabitById,
    });

    for (const habit of habits) {
      fireEvent.press(screen.getByText(habit.name));
      expect(onOpenHabitById).toHaveBeenLastCalledWith(habit.id);
    }

    expect(onOpenHabitById).toHaveBeenCalledTimes(habits.length);
  });

  it("renders group rows with correct labels, meta texts and chips", () => {
    renderComponent();

    expect(screen.getByText("Health")).toBeTruthy();
    expect(screen.getByText("3/3 to daily goal")).toBeTruthy();
    expect(screen.getByText("Goal hit")).toBeTruthy();

    expect(screen.getByText("Empty group")).toBeTruthy();
    expect(screen.getByText("No scheduled habits in this group")).toBeTruthy();
    expect(screen.getByText("In progress")).toBeTruthy();
  });

  it("uses icon presenter for every rendered group", () => {
    renderComponent();

    expect(getHabitIconByIdMock).toHaveBeenCalledWith("workout");
    expect(getHabitIconByIdMock).toHaveBeenCalledWith("focus");
  });

  it("calls onOpenGroupById when group rows are pressed", () => {
    const onOpenGroupById = jest.fn();

    renderComponent({
      onOpenGroupById,
    });

    for (const group of groups) {
      fireEvent.press(screen.getByText(group.name));
      expect(onOpenGroupById).toHaveBeenLastCalledWith(group.id);
    }

    expect(onOpenGroupById).toHaveBeenCalledTimes(groups.length);
  });
});
