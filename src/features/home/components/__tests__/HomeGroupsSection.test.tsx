import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupWithMetrics } from "@/test/fixtures/habits";

import { HomeGroupCard } from "../HomeGroupCard";
import { HomeGroupsSection } from "../HomeGroupsSection";

jest.mock("../HomeGroupCard", () => ({
  HomeGroupCard: jest.fn(() => null),
}));

const homeGroupCardMock = jest.mocked(HomeGroupCard);

describe("HomeGroupsSection", () => {
  const styles = {
    groupSectionWrap: {},
    groupSectionHeader: {},
    groupSectionTitle: {},
    groupSectionAction: {},
    groupLoaderCard: {},
    groupLoaderText: {},
    groupEmptyCard: {},
    groupEmptyTitle: {},
    groupEmptySubtitle: {},
    groupEmptyActionButton: {},
    groupEmptyActionText: {},
    groupListWrap: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given loading state, When rendering groups section, Then it shows loader placeholder", () => {
    render(
      <HomeGroupsSection
        styles={styles as never}
        isLoading
        todayGroups={[]}
        hasAnyGroups={false}
        hasMoreGroups={false}
        onOpenHabits={jest.fn()}
        onOpenGroupById={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading groups...")).toBeTruthy();
    expect(homeGroupCardMock).not.toHaveBeenCalled();
  });

  it("Given no today groups but user has groups, When rendering and pressing empty action, Then it shows schedule-specific empty copy and opens habits list", () => {
    const onOpenHabits = jest.fn();

    render(
      <HomeGroupsSection
        styles={styles as never}
        isLoading={false}
        todayGroups={[]}
        hasAnyGroups
        hasMoreGroups
        onOpenHabits={onOpenHabits}
        onOpenGroupById={jest.fn()}
      />,
    );

    expect(screen.getByText("View All")).toBeTruthy();
    expect(screen.getByText("No groups scheduled today")).toBeTruthy();
    expect(
      screen.getByText("Your groups exist, but none match today's schedule or date range."),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("View all groups"));
    expect(onOpenHabits).toHaveBeenCalledTimes(1);
  });

  it("Given no groups at all, When rendering and pressing header action, Then it shows onboarding copy and calls open habits", () => {
    const onOpenHabits = jest.fn();

    render(
      <HomeGroupsSection
        styles={styles as never}
        isLoading={false}
        todayGroups={[]}
        hasAnyGroups={false}
        hasMoreGroups={false}
        onOpenHabits={onOpenHabits}
        onOpenGroupById={jest.fn()}
      />,
    );

    expect(screen.getByText("Manage")).toBeTruthy();
    expect(screen.getByText("No groups yet")).toBeTruthy();
    expect(
      screen.getByText("Create groups on the Habits page to bundle routines like Sport or Focus."),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Manage"));
    expect(onOpenHabits).toHaveBeenCalledTimes(1);
  });

  it("Given scheduled groups list, When rendering cards, Then it forwards group and open callbacks to each group card", () => {
    const onOpenGroupById = jest.fn();
    const groups = [
      createHabitGroupWithMetrics("group-1", { name: "Morning" }),
      createHabitGroupWithMetrics("group-2", { name: "Focus" }),
    ];

    render(
      <HomeGroupsSection
        styles={styles as never}
        isLoading={false}
        todayGroups={groups}
        hasAnyGroups
        hasMoreGroups={false}
        onOpenHabits={jest.fn()}
        onOpenGroupById={onOpenGroupById}
      />,
    );

    expect(homeGroupCardMock).toHaveBeenCalledTimes(2);
    expect(homeGroupCardMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        group: groups[0],
        onOpenGroup: onOpenGroupById,
      }),
    );
    expect(homeGroupCardMock.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        group: groups[1],
        onOpenGroup: onOpenGroupById,
      }),
    );
  });
});
