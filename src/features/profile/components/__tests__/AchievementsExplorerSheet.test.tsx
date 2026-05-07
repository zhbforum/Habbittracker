import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Animated, Modal, Text } from "react-native";

import { AchievementsSection } from "@entities/achievement";
import {
  useAchievementsExplorerSheetState,
} from "@features/profile/hooks/useAchievementsExplorerSheetState";
import { useAppTheme } from "@shared/theme";

import { createAchievementsExplorerSheetStyles } from "../AchievementsExplorerSheet.styles";
import { AchievementsExplorerSheet } from "../AchievementsExplorerSheet";

jest.mock("@shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    right: 0,
    bottom: 24,
    left: 0,
  })),
}));

jest.mock("@entities/achievement", () => ({
  AchievementsSection: jest.fn(() => null),
}));

jest.mock("@features/profile/hooks/useAchievementsExplorerSheetState", () => ({
  ACHIEVEMENT_FILTER_OPTIONS: [
    { value: "all", label: "All" },
    { value: "unlocked", label: "Unlocked" },
    { value: "locked", label: "Locked" },
  ],
  useAchievementsExplorerSheetState: jest.fn(),
}));

jest.mock("../AchievementsExplorerSheet.styles", () => ({
  createAchievementsExplorerSheetStyles: jest.fn(() => ({
    overlay: {},
    sheet: {},
    handle: {},
    headerRow: {},
    headerTextWrap: {},
    title: {},
    subtitle: {},
    closeButton: {},
    filtersRow: {},
    filterButton: {},
    filterButtonActive: {},
    filterButtonText: {},
    filterButtonTextActive: {},
    scrollWrap: {},
    scrollView: {},
    content: {},
  })),
}));

function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@shared/ui", () => ({
  AppText: mockAppText,
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const achievementsSectionMock = jest.mocked(AchievementsSection);
const useAchievementsExplorerSheetStateMock = jest.mocked(useAchievementsExplorerSheetState);
const createAchievementsExplorerSheetStylesMock = jest.mocked(createAchievementsExplorerSheetStyles);

describe("AchievementsExplorerSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        textSecondary: "#666666",
        border: "#d3d3d3",
        surface: "#ffffff",
        textPrimary: "#121212",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given visible sheet with filter controls, When selecting filters and closing modal, Then it delegates state actions and renders achievements contract", () => {
    const onClose = jest.fn();
    const handleSelectFilter = jest.fn();

    useAchievementsExplorerSheetStateMock.mockReturnValue({
      activeFilter: "all",
      filteredAchievements: [
        {
          id: "first_habit",
          title: "First Habit",
          description: "Create first habit.",
          tier: "starter",
          iconName: "sparkles",
          progress: 1,
          target: 1,
          unlockedAt: "2026-06-01T00:00:00.000Z",
          isUnlocked: true,
        },
      ],
      emptyText: "No achievements available.",
      filterStatsLabel: "1/2 unlocked",
      contentOpacity: new Animated.Value(1),
      contentTranslateY: new Animated.Value(0),
      handleSelectFilter,
    });

    const { UNSAFE_getByType } = render(
      <AchievementsExplorerSheet
        isVisible
        achievements={[]}
        summary={{
          total: 2,
          unlocked: 1,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText("Unlocked"));
    fireEvent.press(screen.getByText("Locked"));
    UNSAFE_getByType(Modal).props.onRequestClose();

    expect(screen.getByText("All achievements")).toBeTruthy();
    expect(screen.getByText("1/2 unlocked")).toBeTruthy();
    expect(handleSelectFilter).toHaveBeenCalledWith("unlocked");
    expect(handleSelectFilter).toHaveBeenCalledWith("locked");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(achievementsSectionMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        emptyText: "No achievements available.",
        summary: {
          total: 2,
          unlocked: 1,
        },
      }),
    );
    expect(createAchievementsExplorerSheetStylesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        textSecondary: "#666666",
      }),
      32,
    );
  });
});
