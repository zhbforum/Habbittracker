import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { Text } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileAvatar } from "../ProfileAvatar";
import { ProfileEditAvatarSection } from "../ProfileEditAvatarSection";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../ProfileAvatar", () => ({
  ProfileAvatar: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const profileAvatarMock = jest.mocked(ProfileAvatar);
function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

describe("ProfileEditAvatarSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        accentPrimary: "#44caa1",
        border: "#c4c4c4",
        surfaceSecondary: "#f2f2f2",
        textPrimary: "#121212",
        textSecondary: "#666666",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given plain state without pending avatar, When pressing choose button, Then it opens picker and hides reset action", () => {
    const onPickAvatar = jest.fn();

    render(
      <ProfileEditAvatarSection
        seed="user-seed"
        avatarPreviewUrl={null}
        pendingAvatarUri={null}
        isSaving={false}
        isPickingAvatar={false}
        onPickAvatar={onPickAvatar}
        onResetAvatar={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Choose from gallery"));

    expect(onPickAvatar).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Use generated avatar")).toBeNull();
    expect(profileAvatarMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        seed: "user-seed",
        avatarUrl: null,
        size: 92,
      }),
    );
  });

  it("Given avatar preview and reset action, When pressing reset button, Then it restores generated avatar source", () => {
    const onResetAvatar = jest.fn();

    render(
      <ProfileEditAvatarSection
        seed="user-seed"
        avatarPreviewUrl="https://example.com/new-avatar.png"
        pendingAvatarUri="file://pending-avatar.jpg"
        isSaving={false}
        isPickingAvatar={false}
        onPickAvatar={jest.fn()}
        onResetAvatar={onResetAvatar}
      />,
    );

    fireEvent.press(screen.getByText("Use generated avatar"));

    expect(onResetAvatar).toHaveBeenCalledTimes(1);
  });

  it("Given picker is opening, When pressing choose button, Then button is disabled and no callback fires", () => {
    const onPickAvatar = jest.fn();

    render(
      <ProfileEditAvatarSection
        seed="user-seed"
        avatarPreviewUrl={null}
        pendingAvatarUri={null}
        isSaving={false}
        isPickingAvatar
        onPickAvatar={onPickAvatar}
        onResetAvatar={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("Opening..."));
    expect(onPickAvatar).not.toHaveBeenCalled();
  });
});
