import { render } from "@testing-library/react-native";

import { ActionConfirmDialog } from "@/shared/ui";

import { ProfileSignOutDialog } from "../ProfileSignOutDialog";

jest.mock("@/shared/ui", () => ({
  ActionConfirmDialog: jest.fn(() => null),
}));

const actionConfirmDialogMock = jest.mocked(ActionConfirmDialog);

describe("ProfileSignOutDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given dialog props, When rendering sign out dialog, Then it forwards danger confirmation contract to shared dialog", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ProfileSignOutDialog
        isVisible
        isSigningOut
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(actionConfirmDialogMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        isVisible: true,
        title: "Sign out",
        confirmLabel: "Sign out",
        confirmLoadingLabel: "Signing out...",
        isConfirming: true,
        onCancel,
        onConfirm,
        confirmTone: "danger",
      }),
    );
  });
});
