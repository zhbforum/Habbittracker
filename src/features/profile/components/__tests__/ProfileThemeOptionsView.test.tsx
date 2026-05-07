import { fireEvent, render, screen } from "@testing-library/react-native";

import { ProfileThemeOptionsView } from "../ProfileThemeOptionsView";

const mockCheck = jest.fn((_: unknown) => null);

jest.mock("lucide-react-native", () => ({
  Check: (props: unknown) => {
    mockCheck(props);
    return null;
  },
  ChevronLeft: () => null,
}));

describe("ProfileThemeOptionsView", () => {
  const styles = {
    headerRow: {},
    backButton: {},
    title: {},
    sectionTitle: {},
    optionsList: {},
    optionCard: {},
    optionCardActive: {},
    optionTextWrap: {},
    optionTitle: {},
    optionCaption: {},
  };

  const colors = {
    textPrimary: "#101010",
    accentText: "#44c08a",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given active light mode, When selecting dark option and back action, Then it emits expected callbacks", () => {
    const onBack = jest.fn();
    const onSelectMode = jest.fn();
    const { UNSAFE_getByProps } = render(
      <ProfileThemeOptionsView
        activeMode="light"
        colors={colors as never}
        styles={styles as never}
        onBack={onBack}
        onSelectMode={onSelectMode}
      />,
    );

    fireEvent.press(UNSAFE_getByProps({ onPress: onBack }));
    fireEvent.press(screen.getByText("Dark Theme"));

    expect(screen.getByText("Choose appearance")).toBeTruthy();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSelectMode).toHaveBeenCalledWith("dark");
    expect(mockCheck).toHaveBeenCalledTimes(1);
  });

  it("Given active dark mode, When selecting light option, Then callback receives light theme mode", () => {
    const onSelectMode = jest.fn();

    render(
      <ProfileThemeOptionsView
        activeMode="dark"
        colors={colors as never}
        styles={styles as never}
        onBack={jest.fn()}
        onSelectMode={onSelectMode}
      />,
    );

    fireEvent.press(screen.getByText("Light Theme"));
    expect(onSelectMode).toHaveBeenCalledWith("light");
  });
});
