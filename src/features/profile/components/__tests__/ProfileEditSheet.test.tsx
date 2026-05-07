import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Modal, Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileEditAvatarSection } from "../ProfileEditAvatarSection";
import { ProfileEditFields } from "../ProfileEditFields";
import { ProfileEditSheet } from "../ProfileEditSheet";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../ProfileEditAvatarSection", () => ({
  ProfileEditAvatarSection: jest.fn(() => null),
}));

jest.mock("../ProfileEditFields", () => ({
  ProfileEditFields: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const profileEditAvatarSectionMock = jest.mocked(ProfileEditAvatarSection);
const profileEditFieldsMock = jest.mocked(ProfileEditFields);
function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

describe("ProfileEditSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d0d0d0",
        surface: "#ffffff",
        accentPrimary: "#54c38f",
        textPrimary: "#121212",
        surfaceSecondary: "#f5f5f5",
        textSecondary: "#717171",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given visible edit sheet, When rendering and using actions, Then it forwards child props and triggers close/save callbacks", () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    const { UNSAFE_getByType } = render(
      <ProfileEditSheet
        isVisible
        values={{
          name: "Alex",
          username: "alex",
          bio: "Bio",
          avatarUrl: "https://example.com/current.png",
        }}
        pendingAvatarUri="file://updated.jpg"
        isSaving={false}
        isPickingAvatar={false}
        canChangeUsername
        usernameChangeHint="You can update this now."
        onFieldChange={jest.fn()}
        onPickAvatar={jest.fn()}
        onResetAvatar={jest.fn()}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    expect(profileEditAvatarSectionMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        seed: "alex",
        avatarPreviewUrl: "file://updated.jpg",
        pendingAvatarUri: "file://updated.jpg",
      }),
    );
    expect(profileEditFieldsMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        canChangeUsername: true,
        usernameChangeHint: "You can update this now.",
      }),
    );

    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByText("Save"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);

    UNSAFE_getByType(Modal).props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("Given saving state, When pressing save action, Then it keeps loading label and blocks save callback", () => {
    const onSave = jest.fn();

    render(
      <ProfileEditSheet
        isVisible
        values={{
          name: "Alex",
          username: "",
          bio: "",
          avatarUrl: "",
        }}
        pendingAvatarUri={null}
        isSaving
        isPickingAvatar={false}
        canChangeUsername={false}
        usernameChangeHint="Username cooldown active."
        onFieldChange={jest.fn()}
        onPickAvatar={jest.fn()}
        onResetAvatar={jest.fn()}
        onSave={onSave}
        onClose={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Saving..."));
    expect(onSave).not.toHaveBeenCalled();
  });
});
