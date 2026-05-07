import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, View } from "react-native";

import { HomeProgressCard } from "../HomeProgressCard";

const mockFlame = jest.fn((_: unknown) => null);

jest.mock("lucide-react-native", () => ({
  Flame: (props: unknown) => {
    mockFlame(props);
    return null;
  },
}));

describe("HomeProgressCard", () => {
  const styles = {
    progressCard: {},
    progressHeaderRow: {},
    progressTitle: {},
    progressMeta: {},
    progressIconWrap: {},
    progressIconAuraOuter: {},
    progressIconAuraInner: {},
    progressStatusRow: {},
    progressMessage: {},
    progressPercent: {},
    progressTrack: {},
    progressFill: {},
  };

  const colors = {
    accentText: "#50b77a",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given partial progress, When rendering card, Then it shows progress text and uses default accent flame color", () => {
    render(
      <HomeProgressCard
        styles={styles as any}
        colors={colors as any}
        progress={{
          completedCount: 2,
          totalCount: 4,
          percent: 50,
          message: "Good start",
        }}
      />,
    );

    expect(screen.getByText("Daily Progress")).toBeTruthy();
    expect(screen.getByText("2 of 4 habits completed")).toBeTruthy();
    expect(screen.getByText("Good start")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
    expect(mockFlame.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        color: "#50b77a",
      }),
    );
  });

  it("Given all habits are done today, When rendering card, Then it switches flame tint to celebration color and animates glow opacity", () => {
    const timingSpy = jest
      .spyOn(Animated, "timing")
      .mockImplementation(() => ({ start: jest.fn() }) as any);

    render(
      <HomeProgressCard
        styles={styles as any}
        colors={colors as any}
        progress={{
          completedCount: 4,
          totalCount: 4,
          percent: 100,
          message: "Perfect day",
        }}
      />,
    );

    expect(mockFlame.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        color: "#F3A73B",
      }),
    );
    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toValue: 0.62,
        duration: 260,
      }),
    );

    timingSpy.mockRestore();
  });

  it("Given track width is measured and percent changes, When animating progress fill, Then width animation clamps percent into 0..100 range", () => {
    const timingSpy = jest
      .spyOn(Animated, "timing")
      .mockImplementation(() => ({ start: jest.fn() }) as any);

    const { rerender, UNSAFE_getAllByType } = render(
      <HomeProgressCard
        styles={styles as any}
        colors={colors as any}
        progress={{
          completedCount: 6,
          totalCount: 6,
          percent: 120,
          message: "Over-complete",
        }}
      />,
    );

    const trackView = UNSAFE_getAllByType(View).find(
      (node) => typeof node.props.onLayout === "function",
    );

    if (!trackView) {
      throw new Error("Expected progress track with onLayout handler.");
    }

    fireEvent(trackView, "layout", {
      nativeEvent: {
        layout: {
          width: 200,
          height: 8,
          x: 0,
          y: 0,
        },
      },
    });

    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toValue: 200,
        duration: 500,
        useNativeDriver: false,
      }),
    );

    rerender(
      <HomeProgressCard
        styles={styles as any}
        colors={colors as any}
        progress={{
          completedCount: 0,
          totalCount: 6,
          percent: -20,
          message: "Reset",
        }}
      />,
    );

    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        toValue: 0,
      }),
    );

    timingSpy.mockRestore();
  });
});
