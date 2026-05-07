import { fireEvent, render, screen } from "@testing-library/react-native";

import { createAchievementProgress } from "@/test/fixtures/profile";

import { AchievementBadge } from "../AchievementBadge";

const mockMaterialCommunityIcons = jest.fn((_: unknown) => null);

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: (props: unknown) => {
    mockMaterialCommunityIcons(props);
    return null;
  },
}));

describe("AchievementBadge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given unlocked achievement, When rendering badge, Then it displays icon name and unlocked label", () => {
    const achievement = createAchievementProgress({
      iconName: "star-four-points",
      isUnlocked: true,
      progress: 4,
      target: 10,
    });
    const onPress = jest.fn();

    render(
      <AchievementBadge achievement={achievement} onPress={onPress} />,
    );

    fireEvent.press(screen.getByText("Unlocked"));

    expect(screen.getByText("Unlocked")).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockMaterialCommunityIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "star-four-points",
      }),
    );
  });

  it("Given locked public achievement with oversized progress and no onPress, When rendering badge, Then it hides real icon and caps progress label", () => {
    const achievement = createAchievementProgress({
      isUnlocked: false,
      progress: 22,
      target: 9,
      iconName: "rocket",
    });

    const { UNSAFE_getByProps } = render(
      <AchievementBadge achievement={achievement} isPublicView />,
    );

    const pressable = UNSAFE_getByProps({ disabled: true });

    expect(pressable.props.disabled).toBe(true);
    expect(screen.getByText("9/9")).toBeTruthy();
    expect(mockMaterialCommunityIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "help-circle-outline",
      }),
    );
  });
});
