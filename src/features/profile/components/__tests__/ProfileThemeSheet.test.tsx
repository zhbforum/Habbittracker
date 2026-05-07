import { act, render } from "@testing-library/react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileThemeMenuView } from "../ProfileThemeMenuView";
import { ProfileThemeOptionsView } from "../ProfileThemeOptionsView";
import { ProfileThemeSheet } from "../ProfileThemeSheet";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../ProfileThemeSheet.styles", () => ({
  createProfileThemeSheetStyles: jest.fn(() => ({
    overlay: {},
    sheet: {},
  })),
}));

jest.mock("../ProfileThemeMenuView", () => ({
  ProfileThemeMenuView: jest.fn(() => null),
}));

jest.mock("../ProfileThemeOptionsView", () => ({
  ProfileThemeOptionsView: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const profileThemeMenuViewMock = jest.mocked(ProfileThemeMenuView);
const profileThemeOptionsViewMock = jest.mocked(ProfileThemeOptionsView);

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("ProfileThemeSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAppThemeMock.mockReturnValue({
      colors: {
        textPrimary: "#111111",
        textSecondary: "#666666",
        accentText: "#00aa77",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given visible sheet in menu mode, When rendering, Then it passes current theme label and sign-out props to menu view", () => {
    const onSignOut = jest.fn();

    render(
      <ProfileThemeSheet
        isVisible
        activeMode="dark"
        isSigningOut
        onSelectMode={jest.fn()}
        onSignOut={onSignOut}
        onClose={jest.fn()}
      />,
    );

    expect(getLastProps(profileThemeMenuViewMock)).toEqual(
      expect.objectContaining({
        currentThemeLabel: "Dark",
        isSigningOut: true,
        onSignOut,
      }),
    );
    expect(profileThemeOptionsViewMock).not.toHaveBeenCalled();
  });

  it("Given menu view requests theme options, When opening theme list and returning back, Then it switches between menu and theme subviews", () => {
    render(
      <ProfileThemeSheet
        isVisible
        activeMode="light"
        isSigningOut={false}
        onSelectMode={jest.fn()}
        onSignOut={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    act(() => {
      const menuProps = getLastProps(profileThemeMenuViewMock) as {
        onOpenTheme: () => void;
      };
      menuProps.onOpenTheme();
    });

    expect(profileThemeOptionsViewMock).toHaveBeenCalled();

    act(() => {
      const optionsProps = getLastProps(profileThemeOptionsViewMock) as {
        onBack: () => void;
      };
      optionsProps.onBack();
    });

    expect(getLastProps(profileThemeMenuViewMock)).toEqual(
      expect.objectContaining({
        currentThemeLabel: "Light",
      }),
    );
  });

  it("Given sheet was on theme options and becomes hidden then visible again, When visibility toggles back on, Then active view resets to menu", () => {
    const { rerender } = render(
      <ProfileThemeSheet
        isVisible
        activeMode="light"
        isSigningOut={false}
        onSelectMode={jest.fn()}
        onSignOut={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    act(() => {
      const menuProps = getLastProps(profileThemeMenuViewMock) as {
        onOpenTheme: () => void;
      };
      menuProps.onOpenTheme();
    });

    expect(profileThemeOptionsViewMock).toHaveBeenCalled();

    rerender(
      <ProfileThemeSheet
        isVisible={false}
        activeMode="light"
        isSigningOut={false}
        onSelectMode={jest.fn()}
        onSignOut={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    rerender(
      <ProfileThemeSheet
        isVisible
        activeMode="light"
        isSigningOut={false}
        onSelectMode={jest.fn()}
        onSignOut={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(getLastProps(profileThemeMenuViewMock)).toEqual(
      expect.objectContaining({
        currentThemeLabel: "Light",
      }),
    );
  });
});
