import { render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { AchievementsSection } from "@entities/achievement";
import { useAppTheme } from "@/shared/theme";
import {
  createAchievementProgress,
  createAchievementSummary,
  createProfileBundle,
} from "@/test/fixtures/profile";

import { ProfileAvatar } from "../ProfileAvatar";
import { ProfileStatCard } from "../ProfileStatCard";
import { PublicProfileCard } from "../PublicProfileCard";

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

describe("PublicProfileCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d3d3d3",
        surface: "#ffffff",
        textPrimary: "#121212",
        accentText: "#33b388",
        surfaceSecondary: "#f4f4f4",
        textMuted: "#767676",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given public profile data, When rendering card, Then it maps avatar, stats, bio and achievements contracts", () => {
    const profileData = createProfileBundle({
      profile: {
        ...createProfileBundle().profile,
        id: "public-user-1",
        name: "Taylor",
        username: "taylor",
        bio: "Habit systems over hacks.",
        avatarUrl: "https://example.com/public.png",
      },
      stats: {
        totalHabits: 9,
        currentStreak: 4,
      },
      achievements: [createAchievementProgress({ id: "first_habit" })],
      achievementSummary: createAchievementSummary({ total: 1, unlocked: 1 }),
    });

    render(<PublicProfileCard profileData={profileData} />);

    expect(screen.getByText("Taylor")).toBeTruthy();
    expect(screen.getByText("@taylor")).toBeTruthy();
    expect(screen.getByText("Habit systems over hacks.")).toBeTruthy();

    expect(profileAvatarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        seed: "taylor",
        avatarUrl: "https://example.com/public.png",
        size: 106,
      }),
    );
    expect(profileStatCardMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        label: "Total habits",
        value: "9",
      }),
    );
    expect(profileStatCardMock.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        label: "Current streak",
        value: "4d",
        showFlame: true,
      }),
    );
    expect(achievementsSectionMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        achievements: profileData.achievements,
        summary: profileData.achievementSummary,
        isPublicView: true,
      }),
    );
  });

  it("Given empty bio, When rendering profile card, Then it shows default bio fallback copy", () => {
    const profileData = createProfileBundle({
      profile: {
        ...createProfileBundle().profile,
        username: "alex",
        bio: null,
      },
    });

    render(<PublicProfileCard profileData={profileData} />);

    expect(screen.getByText("No bio provided yet.")).toBeTruthy();
  });
});
