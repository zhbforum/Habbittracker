import { fireEvent, render, screen } from "@testing-library/react-native";

import { ProfileThemeMenuView } from "../ProfileThemeMenuView";

describe("ProfileThemeMenuView", () => {
  const styles = {
    title: {},
    menuSection: {},
    menuRow: {},
    menuRowTextWrap: {},
    menuRowTitle: {},
    menuRowCaption: {},
    signOutButton: {},
    signOutButtonText: {},
    buttonDisabled: {},
  };

  const colors = {
    textSecondary: "#7a7a7a",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given settings menu, When pressing theme and sign-out actions, Then it triggers both callbacks", () => {
    const onOpenTheme = jest.fn();
    const onSignOut = jest.fn();

    render(
      <ProfileThemeMenuView
        currentThemeLabel="Light"
        isSigningOut={false}
        colors={colors as never}
        styles={styles as never}
        onOpenTheme={onOpenTheme}
        onSignOut={onSignOut}
      />,
    );

    fireEvent.press(screen.getByText("Theme"));
    fireEvent.press(screen.getByText("Sign out"));

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Light")).toBeTruthy();
    expect(onOpenTheme).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("Given sign out is in progress, When pressing sign out button, Then callback is blocked and loading label is shown", () => {
    const onSignOut = jest.fn();

    render(
      <ProfileThemeMenuView
        currentThemeLabel="Dark"
        isSigningOut
        colors={colors as never}
        styles={styles as never}
        onOpenTheme={jest.fn()}
        onSignOut={onSignOut}
      />,
    );

    fireEvent.press(screen.getByText("Signing out..."));
    expect(onSignOut).not.toHaveBeenCalled();
  });
});
