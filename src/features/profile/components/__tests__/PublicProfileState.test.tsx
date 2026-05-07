import { ActivityIndicator, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";

import { useAppTheme } from "@/shared/theme";
import { PublicProfileState } from "../PublicProfileState";

function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

const useAppThemeMock = jest.mocked(useAppTheme);

describe("PublicProfileState", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAppThemeMock.mockReturnValue({
      colors: {
        textPrimary: "#ffffff",
        textSecondary: "#a3a3a3",
        errorBorder: "#ff6767",
        errorSurface: "#221010",
        errorText: "#ffd5d5",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given loading state, When rendering, Then it shows progress indicator and helper text", () => {
    const { UNSAFE_getByType } = render(
      <PublicProfileState isLoading errorMessage={null} isNotFound={false} />,
    );

    const loader = UNSAFE_getByType(ActivityIndicator);

    expect(loader.props.size).toBe("small");
    expect(loader.props.color).toBe("#ffffff");
    expect(screen.getByText("Loading profile...")).toBeTruthy();
  });

  it("Given no loading, no error and not-found is false, When rendering, Then it returns null state body", () => {
    render(<PublicProfileState isLoading={false} errorMessage={null} isNotFound={false} />);

    expect(screen.queryByText("Loading profile...")).toBeNull();
    expect(screen.queryByText("User not found.")).toBeNull();
  });

  it("Given error message exists, When rendering, Then it shows provided error banner text", () => {
    render(
      <PublicProfileState
        isLoading={false}
        errorMessage="Profile request failed"
        isNotFound={false}
      />,
    );

    expect(screen.getByText("Profile request failed")).toBeTruthy();
  });

  it("Given profile is not found without explicit error, When rendering, Then it shows default not-found message", () => {
    render(<PublicProfileState isLoading={false} errorMessage={null} isNotFound />);

    expect(screen.getByText("User not found.")).toBeTruthy();
  });
});
