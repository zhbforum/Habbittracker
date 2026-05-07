import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupWithMetrics } from "@/test/fixtures/habits";

import { HabitGroupSummaryCard } from "../HabitGroupSummaryCard";
import { HabitGroupsSection } from "../HabitGroupsSection";

jest.mock("../HabitGroupSummaryCard", () => ({
  HabitGroupSummaryCard: jest.fn(() => null),
}));

const habitGroupSummaryCardMock = jest.mocked(HabitGroupSummaryCard);

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitGroupsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given no base habits, When rendering groups section, Then it shows create-habits-first state and keeps New action disabled", () => {
    const onCreateGroup = jest.fn();

    render(
      <HabitGroupsSection
        groups={[]}
        isLoading={false}
        isSaving={false}
        hasHabits={false}
        onCreateGroup={onCreateGroup}
        onOpenGroup={jest.fn()}
      />,
    );

    expect(screen.getByText("Create habits first")).toBeTruthy();
    fireEvent.press(screen.getByText("New"));

    expect(onCreateGroup).not.toHaveBeenCalled();
  });

  it("Given groups are loading, When rendering section, Then it shows loading card", () => {
    render(
      <HabitGroupsSection
        groups={[]}
        isLoading
        isSaving={false}
        hasHabits
        onCreateGroup={jest.fn()}
        onOpenGroup={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading groups...")).toBeTruthy();
  });

  it("Given habits exist but no groups yet, When pressing inline create action, Then it calls onCreateGroup", () => {
    const onCreateGroup = jest.fn();

    render(
      <HabitGroupsSection
        groups={[]}
        isLoading={false}
        isSaving={false}
        hasHabits
        onCreateGroup={onCreateGroup}
        onOpenGroup={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Create first group"));

    expect(onCreateGroup).toHaveBeenCalledTimes(1);
  });

  it("Given groups are present, When card callback fires, Then it routes open action with group id", () => {
    const onOpenGroup = jest.fn();
    const groups = [
      createHabitGroupWithMetrics("group-1"),
      createHabitGroupWithMetrics("group-2"),
    ];

    render(
      <HabitGroupsSection
        groups={groups}
        isLoading={false}
        isSaving={false}
        hasHabits
        onCreateGroup={jest.fn()}
        onOpenGroup={onOpenGroup}
      />,
    );

    expect(habitGroupSummaryCardMock).toHaveBeenCalledTimes(2);

    act(() => {
      const lastCardProps = getLastProps(habitGroupSummaryCardMock) as {
        group: { id: string };
        onPress: () => void;
      };
      expect(lastCardProps.group.id).toBe("group-2");
      lastCardProps.onPress();
    });

    expect(onOpenGroup).toHaveBeenCalledWith("group-2");
  });
});
