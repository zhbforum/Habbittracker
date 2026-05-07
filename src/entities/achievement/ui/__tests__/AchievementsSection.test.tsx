import { fireEvent, render, screen } from "@testing-library/react-native";

import { createAchievementProgress } from "@/test/fixtures/profile";

import { AchievementBadge } from "../AchievementBadge";
import { AchievementsSection } from "../AchievementsSection";

jest.mock("../AchievementBadge", () => ({
  AchievementBadge: jest.fn(() => null),
}));

const achievementBadgeMock = jest.mocked(AchievementBadge);

describe("AchievementsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given explicit summary and header action, When rendering section, Then it uses summary counters and invokes header action", () => {
    const onPressHeaderAction = jest.fn();
    const achievements = [
      createAchievementProgress({ id: "first_habit", isUnlocked: true }),
      createAchievementProgress({ id: "streak_3", isUnlocked: false }),
    ];

    render(
      <AchievementsSection
        achievements={achievements}
        summary={{ unlocked: 7, total: 12 }}
        headerActionLabel="View all"
        onPressHeaderAction={onPressHeaderAction}
      />,
    );

    expect(screen.getByText("7/12 unlocked")).toBeTruthy();
    fireEvent.press(screen.getByText("View all"));
    expect(onPressHeaderAction).toHaveBeenCalledTimes(1);
    expect(achievementBadgeMock).toHaveBeenCalledTimes(2);
    expect(achievementBadgeMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        achievement: achievements[0],
        isPublicView: false,
      }),
    );
  });

  it("Given private empty achievements and no custom empty text, When rendering section, Then it shows private fallback copy", () => {
    render(<AchievementsSection achievements={[]} isPublicView={false} />);

    expect(
      screen.getByText(
        "No achievements yet. Complete habits and groups to unlock badges.",
      ),
    ).toBeTruthy();
  });

  it("Given public empty achievements and custom empty text, When rendering section, Then it prefers provided empty message", () => {
    render(
      <AchievementsSection
        achievements={[]}
        isPublicView
        emptyText="Public badges are still locked."
      />,
    );

    expect(screen.getByText("Public badges are still locked.")).toBeTruthy();
  });

  it("Given summary is omitted, When rendering populated achievements, Then it derives unlocked counters from achievements list", () => {
    const achievements = [
      createAchievementProgress({ id: "first_habit", isUnlocked: true }),
      createAchievementProgress({
        id: "streak_3",
        isUnlocked: false,
        progress: 1,
        target: 3,
        unlockedAt: null,
      }),
    ];

    render(<AchievementsSection achievements={achievements} />);

    expect(screen.getByText("1/2 unlocked")).toBeTruthy();
  });
});
