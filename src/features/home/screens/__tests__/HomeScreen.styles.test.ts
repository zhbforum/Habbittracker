import { StyleSheet } from "react-native";

import type { ThemeColors } from "@shared/theme";

import { createHomeScreenStyles } from "../HomeScreen.styles";

const mockCreateHomeBaseStyles = jest.fn();
const mockCreateHomeProgressStyles = jest.fn();
const mockCreateHomeGroupsStyles = jest.fn();
const mockCreateHomeHabitsStyles = jest.fn();

jest.mock("../homeBaseStyles", () => ({
  createHomeBaseStyles: (colors: unknown) => mockCreateHomeBaseStyles(colors),
}));

jest.mock("../homeProgressStyles", () => ({
  createHomeProgressStyles: (colors: unknown) =>
    mockCreateHomeProgressStyles(colors),
}));

jest.mock("../homeGroupsStyles", () => ({
  createHomeGroupsStyles: (colors: unknown) =>
    mockCreateHomeGroupsStyles(colors),
}));

jest.mock("../homeHabitsStyles", () => ({
  createHomeHabitsStyles: (colors: unknown) =>
    mockCreateHomeHabitsStyles(colors),
}));

const colors = {
  background: "#111111",
  surface: "#222222",
  textPrimary: "#333333",
} as unknown as ThemeColors;

describe("createHomeScreenStyles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the home screen stylesheet from all home style sections", () => {
    const baseStyles = {
      safeArea: {
        flex: 1,
      },
      title: {
        color: "#base-title",
      },
    };

    const progressStyles = {
      progressCard: {
        borderRadius: 22,
      },
      progressFill: {
        width: 0,
      },
    };

    const groupsStyles = {
      groupSectionWrap: {
        gap: 10,
      },
      groupProgressFill: {
        height: "100%",
      },
    };

    const habitsStyles = {
      habitCard: {
        borderRadius: 18,
      },
      completeCircle: {
        width: 56,
      },
    };

    mockCreateHomeBaseStyles.mockReturnValue(baseStyles);
    mockCreateHomeProgressStyles.mockReturnValue(progressStyles);
    mockCreateHomeGroupsStyles.mockReturnValue(groupsStyles);
    mockCreateHomeHabitsStyles.mockReturnValue(habitsStyles);

    const createSpy = jest
      .spyOn(StyleSheet, "create")
      .mockImplementation((styles) => styles);

    const styles = createHomeScreenStyles(colors);

    expect(mockCreateHomeBaseStyles).toHaveBeenCalledWith(colors);
    expect(mockCreateHomeProgressStyles).toHaveBeenCalledWith(colors);
    expect(mockCreateHomeGroupsStyles).toHaveBeenCalledWith(colors);
    expect(mockCreateHomeHabitsStyles).toHaveBeenCalledWith(colors);

    expect(createSpy).toHaveBeenCalledWith({
      ...baseStyles,
      ...progressStyles,
      ...groupsStyles,
      ...habitsStyles,
    });

    expect(styles).toEqual({
      ...baseStyles,
      ...progressStyles,
      ...groupsStyles,
      ...habitsStyles,
    });

    createSpy.mockRestore();
  });

  it("keeps later style sections able to override earlier duplicate keys", () => {
    mockCreateHomeBaseStyles.mockReturnValue({
      sharedKey: {
        color: "base",
      },
    });

    mockCreateHomeProgressStyles.mockReturnValue({
      sharedKey: {
        color: "progress",
      },
    });

    mockCreateHomeGroupsStyles.mockReturnValue({
      sharedKey: {
        color: "groups",
      },
    });

    mockCreateHomeHabitsStyles.mockReturnValue({
      sharedKey: {
        color: "habits",
      },
    });

    const createSpy = jest
      .spyOn(StyleSheet, "create")
      .mockImplementation((styles) => styles);

    const styles = createHomeScreenStyles(colors);

    expect(createSpy).toHaveBeenCalledWith({
      sharedKey: {
        color: "habits",
      },
    });

    expect(styles).toEqual({
      sharedKey: {
        color: "habits",
      },
    });

    createSpy.mockRestore();
  });
});
