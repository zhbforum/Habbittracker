import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { AchievementsSection } from "@entities/achievement";
import { useAppTheme } from "@/shared/theme";
import {
  createAchievementProgress,
  createAchievementSummary,
  createUserProfile,
  createUserStats,
} from "@/test/fixtures/profile";

import { ProfileAvatar } from "../ProfileAvatar";
import { ProfileStatCard } from "../ProfileStatCard";
import { UserProfileDetailsSection } from "../UserProfileDetailsSection";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("@entities/achievement", () => ({
  AchievementsSection: jest.fn(() => null),
}));

jest.mock("../ProfileAvatar", () => ({
  ProfileAvatar: jest.fn(() => null),
}));

jest.mock("../ProfileStatCard", () => ({
  ProfileStatCard: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const achievementsSectionMock = jest.mocked(AchievementsSection);
const profileAvatarMock = jest.mocked(ProfileAvatar);
const profileStatCardMock = jest.mocked(ProfileStatCard);
function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

describe("UserProfileDetailsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d8d8d8",
        surface: "#ffffff",
        textPrimary: "#101010",
        accentText: "#4ac89a",
        textMuted: "#747474",
        surfaceSecondary: "#efefef",
        textSecondary: "#6a6a6a",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given profile details, When rendering and pressing edit action, Then it filters unlocked achievements and wires explorer callback", () => {
    const onOpenEdit = jest.fn();
    const onOpenAchievementsExplorer = jest.fn();
    const achievements = [
      createAchievementProgress({
        id: "first_habit",
        isUnlocked: true,
      }),
      createAchievementProgress({
        id: "streak_3",
        isUnlocked: false,
        progress: 1,
        target: 3,
        unlockedAt: null,
      }),
    ];

    render(
      <UserProfileDetailsSection
        profile={createUserProfile({
          name: "Taylor",
          username: "taylor",
          bio: "Learning through consistency.",
        })}
        profileSeed="seed-taylor"
        usernameLabel="@taylor"
        publicProfilePath="app.link/u/taylor"
        stats={createUserStats({
          totalHabits: 11,
          currentStreak: 5,
        })}
        achievements={achievements}
        achievementSummary={createAchievementSummary({
          total: 2,
          unlocked: 1,
        })}
        onOpenEdit={onOpenEdit}
        onOpenAchievementsExplorer={onOpenAchievementsExplorer}
      />,
    );

    fireEvent.press(screen.getByText("Edit profile"));

    expect(screen.getByText("Taylor")).toBeTruthy();
    expect(screen.getByText("@taylor")).toBeTruthy();
    expect(screen.getByText("app.link/u/taylor")).toBeTruthy();
    expect(screen.getByText("Learning through consistency.")).toBeTruthy();
    expect(onOpenEdit).toHaveBeenCalledTimes(1);

    expect(profileAvatarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        seed: "seed-taylor",
        editable: true,
        onPress: onOpenEdit,
      }),
    );
    expect(profileStatCardMock.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        label: "Current streak",
        value: "5d",
        showFlame: true,
      }),
    );

    const achievementsProps = achievementsSectionMock.mock.calls.at(-1)?.[0] as {
      achievements: unknown[];
      onPressHeaderAction: () => void;
    };
    expect(achievementsProps.achievements).toHaveLength(1);
    achievementsProps.onPressHeaderAction();
    expect(onOpenAchievementsExplorer).toHaveBeenCalledTimes(1);
  });

  it("Given empty bio, When rendering details section, Then it shows profile bio fallback message", () => {
    render(
      <UserProfileDetailsSection
        profile={createUserProfile({
          bio: null,
        })}
        profileSeed="seed-fallback"
        usernameLabel="@alex"
        publicProfilePath="app.link/u/alex"
        stats={createUserStats()}
        achievements={[]}
        achievementSummary={createAchievementSummary({
          total: 0,
          unlocked: 0,
        })}
        onOpenEdit={jest.fn()}
        onOpenAchievementsExplorer={jest.fn()}
      />,
    );

    expect(
      screen.getByText("No bio yet. Add a short intro to personalize your page."),
    ).toBeTruthy();
  });
});
