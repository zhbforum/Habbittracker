import { act, fireEvent, render } from "@testing-library/react-native";
import { ScrollView } from "react-native";

import { TimeWheelColumn } from "../TimeWheelColumn";

type ScrollEventPayload = {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
    velocity?: {
      y?: number;
    };
  };
};

function createScrollEvent(offsetY: number, velocityY?: number): ScrollEventPayload {
  return {
    nativeEvent: {
      contentOffset: {
        y: offsetY,
      },
      velocity: typeof velocityY === "number" ? { y: velocityY } : undefined,
    },
  };
}

describe("TimeWheelColumn", () => {
  it("Given scroll offsets outside value bounds, When scrolling, Then preview uses clamped edge values", () => {
    const onPreviewChange = jest.fn();
    const onFinalize = jest.fn();

    const { UNSAFE_getByType } = render(
      <TimeWheelColumn
        values={[4, 5, 6]}
        selectedValue={5}
        keyPrefix="hours"
        itemHeight={10}
        edgePadding={20}
        onPreviewChange={onPreviewChange}
        onFinalize={onFinalize}
      />,
    );
    const wheel = UNSAFE_getByType(ScrollView);

    fireEvent.scroll(wheel, createScrollEvent(-42));
    fireEvent.scroll(wheel, createScrollEvent(999));

    expect(onPreviewChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPreviewChange).toHaveBeenNthCalledWith(2, 6);
    expect(onFinalize).not.toHaveBeenCalled();
  });

  it("Given momentum scroll ends, When snapping target item, Then it finalizes selected value", () => {
    const onPreviewChange = jest.fn();
    const onFinalize = jest.fn();

    const { UNSAFE_getByType } = render(
      <TimeWheelColumn
        values={[10, 20, 30]}
        selectedValue={10}
        keyPrefix="minutes"
        itemHeight={12}
        edgePadding={16}
        onPreviewChange={onPreviewChange}
        onFinalize={onFinalize}
      />,
    );
    const wheel = UNSAFE_getByType(ScrollView);

    fireEvent(wheel, "momentumScrollEnd", createScrollEvent(23));

    expect(onPreviewChange).toHaveBeenCalledWith(30);
    expect(onFinalize).toHaveBeenCalledWith(30);
  });

  it("Given drag end velocity is high, When drag ends, Then it defers finalize until momentum end", () => {
    const onPreviewChange = jest.fn();
    const onFinalize = jest.fn();

    const { UNSAFE_getByType } = render(
      <TimeWheelColumn
        values={[0, 15, 30]}
        selectedValue={0}
        keyPrefix="minutes"
        itemHeight={10}
        edgePadding={20}
        onPreviewChange={onPreviewChange}
        onFinalize={onFinalize}
      />,
    );
    const wheel = UNSAFE_getByType(ScrollView);

    fireEvent(wheel, "scrollEndDrag", createScrollEvent(10, 0.5));
    expect(onFinalize).not.toHaveBeenCalled();

    act(() => {
      fireEvent(wheel, "scrollEndDrag", createScrollEvent(10, 0.05));
    });

    expect(onPreviewChange).toHaveBeenCalledWith(15);
    expect(onFinalize).toHaveBeenCalledWith(15);
  });
});
