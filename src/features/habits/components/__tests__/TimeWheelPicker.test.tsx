import { act, render } from "@testing-library/react-native";
import type { ComponentProps } from "react";

import { TimeWheelPicker } from "../TimeWheelPicker";
import { TimeWheelColumn } from "../TimeWheelColumn";

jest.mock("../TimeWheelColumn", () => ({
  TimeWheelColumn: jest.fn(() => null),
}));

const timeWheelColumnMock = TimeWheelColumn as jest.MockedFunction<typeof TimeWheelColumn>;

type TimeWheelColumnProps = ComponentProps<typeof TimeWheelColumn>;

function getLatestColumnProps(keyPrefix: "hours" | "minutes"): TimeWheelColumnProps {
  const calls = timeWheelColumnMock.mock.calls
    .map(([props]) => props as TimeWheelColumnProps)
    .filter((props) => props.keyPrefix === keyPrefix);
  const latestCall = calls.at(-1);

  if (!latestCall) {
    throw new Error(`Expected ${keyPrefix} column to be rendered.`);
  }

  return latestCall;
}

describe("TimeWheelPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given invalid incoming time, When picker initializes, Then it falls back to 20:00 wheel selection", () => {
    const onChange = jest.fn();
    render(<TimeWheelPicker value="invalid-time" onChange={onChange} />);

    expect(getLatestColumnProps("hours").selectedValue).toBe(20);
    expect(getLatestColumnProps("minutes").selectedValue).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Given finalized hour changes selected time, When hours column finalizes, Then it emits normalized HH:mm value", () => {
    const onChange = jest.fn();
    render(<TimeWheelPicker value="07:05" onChange={onChange} />);

    act(() => {
      getLatestColumnProps("hours").onFinalize(8);
    });

    expect(onChange).toHaveBeenCalledWith("08:05");
  });

  it("Given finalized hour keeps same normalized time, When hours column finalizes current value, Then it does not emit duplicate onChange", () => {
    const onChange = jest.fn();
    render(<TimeWheelPicker value="07:05" onChange={onChange} />);

    act(() => {
      getLatestColumnProps("hours").onFinalize(7);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("Given hours preview changed before minute finalize, When minutes finalize, Then it uses latest preview hour in emitted value", () => {
    const onChange = jest.fn();
    render(<TimeWheelPicker value="07:05" onChange={onChange} />);

    act(() => {
      getLatestColumnProps("hours").onPreviewChange(12);
    });

    act(() => {
      getLatestColumnProps("minutes").onFinalize(9);
    });

    expect(onChange).toHaveBeenCalledWith("12:09");
  });

  it("Given external value prop changes, When rerendering picker, Then preview values resync from normalized external time", () => {
    const onChange = jest.fn();
    const { rerender } = render(<TimeWheelPicker value="01:30" onChange={onChange} />);

    expect(getLatestColumnProps("hours").selectedValue).toBe(1);
    expect(getLatestColumnProps("minutes").selectedValue).toBe(30);

    rerender(<TimeWheelPicker value="23:45" onChange={onChange} />);

    expect(getLatestColumnProps("hours").selectedValue).toBe(23);
    expect(getLatestColumnProps("minutes").selectedValue).toBe(45);
  });
});
