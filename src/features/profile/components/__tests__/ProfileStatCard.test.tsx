import { render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileStatCard } from "../ProfileStatCard";

const mockFlame = jest.fn((_: unknown) => null);
function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  Flame: (props: unknown) => {
    mockFlame(props);
    return null;
  },
}));

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

const useAppThemeMock = jest.mocked(useAppTheme);

describe("ProfileStatCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#cfcfcf",
        surface: "#ffffff",
        textPrimary: "#1a1a1a",
        textMuted: "#707070",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given plain stat card, When flame is disabled, Then it renders value and label without icon", () => {
    render(
      <ProfileStatCard
        label="Total habits"
        value="14"
      />,
    );

    expect(screen.getByText("14")).toBeTruthy();
    expect(screen.getByText("Total habits")).toBeTruthy();
    expect(mockFlame).not.toHaveBeenCalled();
  });

  it("Given streak card, When flame flag is enabled, Then it renders streak icon", () => {
    render(
      <ProfileStatCard
        label="Current streak"
        value="5d"
        showFlame
      />,
    );

    expect(screen.getByText("5d")).toBeTruthy();
    expect(mockFlame).toHaveBeenCalledTimes(1);
  });
});
