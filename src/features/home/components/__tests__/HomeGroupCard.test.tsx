import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupWithMetrics } from "@/test/fixtures/habits";
import {
  getGroupDateRangeLabel,
  getGroupFrequencyLabel,
  getGroupHint,
  getGroupSessionWindowLabel,
} from "@features/home/model/groupView";

import { HomeGroupCard } from "../HomeGroupCard";

const mockGroupIcon = jest.fn(() => null);

jest.mock("@entities/habit/model/icons", () => ({
  getHabitIconById: jest.fn(() => mockGroupIcon),
}));

jest.mock("@features/home/model/groupView", () => ({
  getGroupSessionWindowLabel: jest.fn(() => "07:00 - 21:00"),
  getGroupDateRangeLabel: jest.fn(() => "Jun 1 - Jul 1"),
  getGroupFrequencyLabel: jest.fn(() => "Daily"),
  getGroupHint: jest.fn(() => "Keep consistency high"),
}));

const getGroupSessionWindowLabelMock = jest.mocked(getGroupSessionWindowLabel);
const getGroupDateRangeLabelMock = jest.mocked(getGroupDateRangeLabel);
const getGroupFrequencyLabelMock = jest.mocked(getGroupFrequencyLabel);
const getGroupHintMock = jest.mocked(getGroupHint);

describe("HomeGroupCard", () => {
  const styles = {
    groupCard: {},
    groupCardHeader: {},
    groupIconWrap: {},
    groupIdentityWrap: {},
    groupName: {},
    groupDescription: {},
    groupMetaRow: {},
    groupMetaChip: {},
    groupMetaText: {},
    groupProgressRow: {},
    groupProgressCaption: {},
    groupProgressPercent: {},
    groupProgressTrack: {},
    groupProgressFill: {},
    groupProgressFillDone: {},
    groupHint: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given group card press and zero target count, When rendering and pressing card, Then it uses daily goal fallback and triggers open callback", () => {
    const onOpenGroup = jest.fn();
    const baseGroup = createHabitGroupWithMetrics("group-1");
    const group = {
      ...baseGroup,
      name: "Health",
      description: "",
      dailyGoal: 3,
      metrics: {
        ...baseGroup.metrics,
        targetCount: 0,
        completedHabitsCount: 2,
        progressPercent: 66,
        isCompletedToday: true,
      },
    };

    render(<HomeGroupCard group={group} styles={styles as never} onOpenGroup={onOpenGroup} />);

    fireEvent.press(screen.getByText("Health"));

    expect(screen.getByText("Health")).toBeTruthy();
    expect(screen.getByText("No description yet")).toBeTruthy();
    expect(screen.getByText("Goal 3")).toBeTruthy();
    expect(screen.getByText("2/1 done")).toBeTruthy();
    expect(screen.getByText("66%")).toBeTruthy();
    expect(screen.getByText("Keep consistency high")).toBeTruthy();
    expect(onOpenGroup).toHaveBeenCalledWith("group-1");
  });

  it("Given group with explicit target and description, When rendering, Then it shows target count and description values", () => {
    const baseGroup = createHabitGroupWithMetrics("group-2");
    const group = {
      ...baseGroup,
      description: "Short note",
      metrics: {
        ...baseGroup.metrics,
        targetCount: 5,
        completedHabitsCount: 4,
        progressPercent: 80,
        isCompletedToday: false,
      },
    };

    render(
      <HomeGroupCard
        group={group}
        styles={styles as never}
        onOpenGroup={jest.fn()}
      />,
    );

    expect(screen.getByText("Short note")).toBeTruthy();
    expect(screen.getByText("Goal 5")).toBeTruthy();
    expect(screen.getByText("4/5 done")).toBeTruthy();
    expect(getGroupSessionWindowLabelMock).toHaveBeenCalledWith(group);
    expect(getGroupDateRangeLabelMock).toHaveBeenCalledWith(group);
    expect(getGroupFrequencyLabelMock).toHaveBeenCalledWith(group);
    expect(getGroupHintMock).toHaveBeenCalledWith(group);
  });
});
