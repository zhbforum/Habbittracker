import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { TimeWheelPicker } from "../TimeWheelPicker";
import { HabitReminderField } from "../HabitReminderField";

jest.mock("../TimeWheelPicker", () => ({
  TimeWheelPicker: jest.fn(() => null),
}));

const timeWheelPickerMock = jest.mocked(TimeWheelPicker);

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitReminderField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given enabled reminder value, When rendering field, Then it shows On state and formatted time", () => {
    render(<HabitReminderField value="07:05" isParentVisible onChange={jest.fn()} />);

    expect(screen.getByText("Reminder time")).toBeTruthy();
    expect(screen.getByText("Tap to set reminder")).toBeTruthy();
    expect(screen.getByText("7:05 AM")).toBeTruthy();
    expect(screen.getByText("On")).toBeTruthy();
    expect(screen.getByText("Off")).toBeTruthy();
    expect(screen.getByText("Change")).toBeTruthy();
    expect(timeWheelPickerMock).not.toHaveBeenCalled();
  });

  it("Given reminder is enabled, When tapping off toggle, Then it emits empty value and closes picker", () => {
    const onChange = jest.fn();

    render(<HabitReminderField value="18:30" isParentVisible onChange={onChange} />);

    fireEvent.press(screen.getByText("Off"));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("Given reminder is disabled, When tapping on toggle, Then it restores default reminder time", () => {
    const onChange = jest.fn();

    render(<HabitReminderField value="" isParentVisible onChange={onChange} />);

    expect(screen.getAllByText("Off").length).toBeGreaterThan(0);
    expect(screen.getByText("Disabled")).toBeTruthy();

    fireEvent.press(screen.getByText("On"));

    expect(onChange).toHaveBeenCalledWith("20:00");
  });

  it("Given picker is closed, When tapping change action, Then it opens picker and forwards picker callbacks", () => {
    const onChange = jest.fn();
    const onPickerVisibilityChange = jest.fn();

    render(
      <HabitReminderField
        value="18:30"
        isParentVisible
        onChange={onChange}
        onPickerVisibilityChange={onPickerVisibilityChange}
      />,
    );

    fireEvent.press(screen.getByText("Change"));

    expect(screen.getByText("Close")).toBeTruthy();
    expect(timeWheelPickerMock).toHaveBeenCalledTimes(1);
    expect(getLastProps(timeWheelPickerMock)).toEqual(
      expect.objectContaining({
        value: "18:30",
      }),
    );
    expect(onPickerVisibilityChange).toHaveBeenCalledWith(true);

    act(() => {
      const pickerProps = getLastProps(timeWheelPickerMock) as {
        onChange: (nextValue: string) => void;
      };
      pickerProps.onChange("20:45");
    });

    expect(onChange).toHaveBeenCalledWith("20:45");
  });

  it("Given picker is open, When tapping done action, Then it closes picker and emits closed visibility", () => {
    const onPickerVisibilityChange = jest.fn();

    render(
      <HabitReminderField
        value="09:00"
        isParentVisible
        onChange={jest.fn()}
        onPickerVisibilityChange={onPickerVisibilityChange}
      />,
    );

    fireEvent.press(screen.getByText("Change"));
    fireEvent.press(screen.getByText("Done"));

    expect(screen.getByText("Change")).toBeTruthy();
    expect(onPickerVisibilityChange).toHaveBeenLastCalledWith(false);
  });

  it("Given parent visibility turns off while picker is open, When rerendering hidden parent, Then picker closes automatically", () => {
    const onPickerVisibilityChange = jest.fn();
    const { rerender } = render(
      <HabitReminderField
        value="10:15"
        isParentVisible
        onChange={jest.fn()}
        onPickerVisibilityChange={onPickerVisibilityChange}
      />,
    );

    fireEvent.press(screen.getByText("Change"));

    rerender(
      <HabitReminderField
        value="10:15"
        isParentVisible={false}
        onChange={jest.fn()}
        onPickerVisibilityChange={onPickerVisibilityChange}
      />,
    );

    expect(screen.getByText("Change")).toBeTruthy();
    expect(onPickerVisibilityChange).toHaveBeenLastCalledWith(false);
  });
});
