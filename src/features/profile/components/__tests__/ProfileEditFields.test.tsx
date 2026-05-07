import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text, TextInput } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileEditFields } from "../ProfileEditFields";
import { PROFILE_BIO_MAX_LENGTH } from "../../model/constants";

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

describe("ProfileEditFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d9d9d9",
        surfaceSecondary: "#efefef",
        textPrimary: "#111111",
        textSecondary: "#666666",
        textMuted: "#8a8a8a",
        textPlaceholder: "#b0b0b0",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given editable fields, When typing into inputs, Then it propagates field-specific change callbacks", () => {
    const onFieldChange = jest.fn();

    const { UNSAFE_getAllByType } = render(
      <ProfileEditFields
        values={{
          name: "Alex",
          username: "alex_1",
          bio: "Build daily momentum",
          avatarUrl: "",
        }}
        canChangeUsername
        usernameChangeHint="You can change username every 14 days."
        onFieldChange={onFieldChange}
      />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "Taylor");
    fireEvent.changeText(inputs[1], "taylor");
    fireEvent.changeText(inputs[2], "Consistency over intensity");

    expect(onFieldChange).toHaveBeenNthCalledWith(1, "name", "Taylor");
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "username", "taylor");
    expect(onFieldChange).toHaveBeenNthCalledWith(3, "bio", "Consistency over intensity");
    expect(screen.getByText("You can change username every 14 days.")).toBeTruthy();
  });

  it("Given username is locked, When rendering fields, Then username input becomes readonly and bio counter is shown", () => {
    const values = {
      name: "Alex",
      username: "alex_1",
      bio: "12345",
      avatarUrl: "",
    };

    const { UNSAFE_getAllByType } = render(
      <ProfileEditFields
        values={values}
        canChangeUsername={false}
        usernameChangeHint="Username is on cooldown."
        onFieldChange={jest.fn()}
      />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    expect(inputs[1].props.editable).toBe(false);
    expect(screen.getByText(`5/${PROFILE_BIO_MAX_LENGTH}`)).toBeTruthy();
    expect(screen.getByText("Username is on cooldown.")).toBeTruthy();
  });
});
