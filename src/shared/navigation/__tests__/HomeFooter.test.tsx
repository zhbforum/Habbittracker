import { fireEvent, render, screen } from "@testing-library/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeFooter } from "../HomeFooter";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

const useSafeAreaInsetsMock = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

type AccessibilityTabNode = {
  props: {
    accessibilityRole?: string;
    onPress?: unknown;
  };
};

describe("HomeFooter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSafeAreaInsetsMock.mockReturnValue({
      top: 0,
      right: 0,
      bottom: 12,
      left: 0,
    });
  });

  it("Given footer tabs, When pressing each tab label, Then it calls onTabPress with matching tab id", () => {
    const onTabPress = jest.fn();
    render(<HomeFooter activeTab="home" onTabPress={onTabPress} />);

    fireEvent.press(screen.getByText("Home"));
    fireEvent.press(screen.getByText("Habits"));
    fireEvent.press(screen.getByText("Stats"));
    fireEvent.press(screen.getByText("Profile"));

    expect(onTabPress).toHaveBeenNthCalledWith(1, "home");
    expect(onTabPress).toHaveBeenNthCalledWith(2, "habits");
    expect(onTabPress).toHaveBeenNthCalledWith(3, "stats");
    expect(onTabPress).toHaveBeenNthCalledWith(4, "profile");
  });

  it("Given active tab is provided, When rendering footer, Then only matching tab has selected accessibility state", () => {
    const { UNSAFE_root } = render(<HomeFooter activeTab="stats" />);
    const tabs = UNSAFE_root.findAll(
      (node: AccessibilityTabNode) =>
        node.props.accessibilityRole === "tab" &&
        typeof node.props.onPress === "function",
    );

    expect(tabs).toHaveLength(4);
    expect(tabs[0]?.props.accessibilityState).toEqual({ selected: false });
    expect(tabs[1]?.props.accessibilityState).toEqual({ selected: false });
    expect(tabs[2]?.props.accessibilityState).toEqual({ selected: true });
    expect(tabs[3]?.props.accessibilityState).toEqual({ selected: false });
  });

  it("Given safe area bottom inset, When rendering container, Then it uses max(bottomInset, 8) for bottom padding", () => {
    useSafeAreaInsetsMock.mockReturnValueOnce({
      top: 0,
      right: 0,
      bottom: 2,
      left: 0,
    });

    const { toJSON, rerender } = render(<HomeFooter />);
    const firstTree = toJSON();

    if (!firstTree || Array.isArray(firstTree)) {
      throw new Error("Expected single root view from HomeFooter.");
    }

    const firstStyleList = Array.isArray(firstTree.props.style)
      ? firstTree.props.style
      : [firstTree.props.style];
    const compactInsetPadding = firstStyleList.find(
      (styleEntry: { paddingBottom?: unknown } | undefined) =>
        typeof styleEntry?.paddingBottom === "number",
    );
    expect(compactInsetPadding?.paddingBottom).toBe(8);

    useSafeAreaInsetsMock.mockReturnValueOnce({
      top: 0,
      right: 0,
      bottom: 24,
      left: 0,
    });

    rerender(<HomeFooter />);
    const secondTree = toJSON();

    if (!secondTree || Array.isArray(secondTree)) {
      throw new Error("Expected single root view from HomeFooter.");
    }

    const secondStyleList = Array.isArray(secondTree.props.style)
      ? secondTree.props.style
      : [secondTree.props.style];
    const expandedInsetPadding = secondStyleList.find(
      (styleEntry: { paddingBottom?: unknown } | undefined) =>
        typeof styleEntry?.paddingBottom === "number",
    );
    expect(expandedInsetPadding?.paddingBottom).toBe(24);
  });
});
