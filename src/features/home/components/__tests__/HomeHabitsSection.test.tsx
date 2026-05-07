import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitWithMetrics } from "@/test/fixtures/habits";

import { HomeHabitCard } from "../HomeHabitCard";
import { HomeHabitsSection } from "../HomeHabitsSection";

jest.mock("../HomeHabitCard", () => ({
  HomeHabitCard: jest.fn(() => null),
}));

const homeHabitCardMock = jest.mocked(HomeHabitCard);

describe("HomeHabitsSection", () => {
  const styles = {
    sectionHeader: {},
    sectionTitle: {},
    sectionAction: {},
    errorBanner: {},
    errorBannerText: {},
    retryButton: {},
    retryButtonText: {},
    loaderCard: {},
    loaderText: {},
    emptyCard: {},
    emptyTitle: {},
    emptySubtitle: {},
    emptyActionButton: {},
    emptyActionText: {},
    listWrap: {},
  };

  const colors = {
    textPrimary: "#111111",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given request is loading, When rendering habits section, Then it shows loading placeholder", () => {
    render(
      <HomeHabitsSection
        styles={styles as never}
        colors={colors as never}
        isLoading
        isSaving={false}
        errorMessage={null}
        todayHabits={[]}
        onOpenHabits={jest.fn()}
        onOpenHabitById={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading today habits...")).toBeTruthy();
    expect(homeHabitCardMock).not.toHaveBeenCalled();
  });

  it("Given request failed, When pressing retry, Then it displays error and triggers retry callback", () => {
    const onRetry = jest.fn();

    render(
      <HomeHabitsSection
        styles={styles as never}
        colors={colors as never}
        isLoading={false}
        isSaving={false}
        errorMessage="Unable to load habits"
        todayHabits={[]}
        onOpenHabits={jest.fn()}
        onOpenHabitById={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Unable to load habits")).toBeTruthy();
    fireEvent.press(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Given no habits for today, When pressing empty action, Then it opens habits page", () => {
    const onOpenHabits = jest.fn();

    render(
      <HomeHabitsSection
        styles={styles as never}
        colors={colors as never}
        isLoading={false}
        isSaving={false}
        errorMessage={null}
        todayHabits={[]}
        onOpenHabits={onOpenHabits}
        onOpenHabitById={jest.fn()}
        onToggleTodayCompletion={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("No habits scheduled for today.")).toBeTruthy();
    fireEvent.press(screen.getByText("Open habits"));
    expect(onOpenHabits).toHaveBeenCalledTimes(1);
  });

  it("Given habits exist, When rendering list, Then it forwards list contracts and action handlers to cards", () => {
    const onOpenHabits = jest.fn();
    const onOpenHabitById = jest.fn();
    const onToggleTodayCompletion = jest.fn();
    const habits = [
      createHabitWithMetrics("habit-1", { name: "Read" }),
      createHabitWithMetrics("habit-2", { name: "Run" }),
    ];

    render(
      <HomeHabitsSection
        styles={styles as never}
        colors={colors as never}
        isLoading={false}
        isSaving
        errorMessage={null}
        todayHabits={habits}
        onOpenHabits={onOpenHabits}
        onOpenHabitById={onOpenHabitById}
        onToggleTodayCompletion={onToggleTodayCompletion}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("View All"));
    expect(onOpenHabits).toHaveBeenCalledTimes(1);

    expect(homeHabitCardMock).toHaveBeenCalledTimes(2);
    expect(homeHabitCardMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        habit: habits[0],
        isSaving: true,
        onOpenHabit: onOpenHabitById,
        onToggleTodayCompletion,
      }),
    );
  });
});
