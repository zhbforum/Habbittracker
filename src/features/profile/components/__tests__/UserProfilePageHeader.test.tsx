import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { UserProfilePageHeader } from "../UserProfilePageHeader";

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

describe("UserProfilePageHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        textPrimary: "#111111",
        textSecondary: "#686868",
        border: "#cdcdcd",
        surfaceSecondary: "#f1f1f1",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given user page header, When pressing settings button, Then it calls open settings callback", () => {
    const onOpenSettings = jest.fn();
    const { UNSAFE_getByProps } = render(
      <UserProfilePageHeader
        title="Profile"
        onOpenSettings={onOpenSettings}
      />,
    );

    fireEvent.press(UNSAFE_getByProps({ onPress: onOpenSettings }));

    expect(screen.getByText("Profile")).toBeTruthy();
    expect(
      screen.getByText("Build identity, track consistency, and tune your app experience."),
    ).toBeTruthy();
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
