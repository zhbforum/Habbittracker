import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { UserProfileLoaderCard } from "../UserProfileLoaderCard";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

describe("UserProfileLoaderCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d6d6d6",
        surface: "#ffffff",
        textSecondary: "#666666",
        accentPrimary: "#56ca9a",
        textPrimary: "#111111",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given loading state, When rendering loader card, Then it shows loading copy and retry callback", () => {
    const onRetry = jest.fn();

    render(
      <UserProfileLoaderCard
        isLoading
        onRetry={onRetry}
      />,
    );

    fireEvent.press(screen.getByText("Retry"));
    expect(screen.getByText("Loading profile...")).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Given unavailable state, When rendering loader card, Then it shows unavailable copy", () => {
    render(
      <UserProfileLoaderCard
        isLoading={false}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("Profile is unavailable.")).toBeTruthy();
  });
});
