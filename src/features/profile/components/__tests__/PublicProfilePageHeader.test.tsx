import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { PublicProfilePageHeader } from "../PublicProfilePageHeader";

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

describe("PublicProfilePageHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        textPrimary: "#121212",
        border: "#cecece",
        surfaceSecondary: "#f0f0f0",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given public header, When pressing back button, Then it calls back navigation callback", () => {
    const onBackPress = jest.fn();
    const { UNSAFE_getByProps } = render(
      <PublicProfilePageHeader onBackPress={onBackPress} />,
    );

    fireEvent.press(UNSAFE_getByProps({ onPress: onBackPress }));

    expect(screen.getByText("Public profile")).toBeTruthy();
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });
});
