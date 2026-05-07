import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text, TextInput } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { UsernameSetupCard } from "../UsernameSetupCard";

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

describe("UsernameSetupCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#cdcdcd",
        surface: "#ffffff",
        textPrimary: "#121212",
        textSecondary: "#676767",
        textPlaceholder: "#a3a3a3",
        surfaceSecondary: "#f0f0f0",
        accentPrimary: "#48c997",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given username setup form, When changing value and pressing save, Then it emits change and submit callbacks", () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { UNSAFE_getByType } = render(
      <UsernameSetupCard
        value="alex"
        isSaving={false}
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.changeText(UNSAFE_getByType(TextInput), "new_handle");
    fireEvent.press(screen.getByText("Save Username"));

    expect(onChange).toHaveBeenCalledWith("new_handle");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Given saving state, When pressing action button, Then it shows loading label and blocks submit callback", () => {
    const onSubmit = jest.fn();

    render(
      <UsernameSetupCard
        value="alex"
        isSaving
        onChange={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.press(screen.getByText("Saving..."));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
