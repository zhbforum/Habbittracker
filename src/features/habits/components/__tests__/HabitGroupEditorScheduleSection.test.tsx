import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupFormValues } from "@/test/fixtures/habits";

import { HabitReminderField } from "../HabitReminderField";
import { HabitGroupEditorScheduleSection } from "../HabitGroupEditorScheduleSection";

jest.mock("../HabitReminderField", () => ({
  HabitReminderField: jest.fn(() => null),
}));

const habitReminderFieldMock = jest.mocked(HabitReminderField);

const styles = {
  fieldLabel: {},
  input: {},
  inlineDateActions: {},
  inlineDateButton: {},
  inlineDateButtonText: {},
} as const;

const colors = {
  textPlaceholder: "#777777",
} as const;

function getReminderProps(callIndex: number) {
  return habitReminderFieldMock.mock.calls[callIndex]?.[0] as {
    onChange: (nextValue: string) => void;
    onPickerVisibilityChange: (isOpen: boolean) => void;
  };
}

describe("HabitGroupEditorScheduleSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("Given schedule fields, When editing dates and quick actions, Then it forwards updated dates", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      startDate: "2026-05-01",
      endDate: "2026-06-01",
    });

    render(
      <HabitGroupEditorScheduleSection
        isVisible
        values={values}
        colors={colors as never}
        styles={styles as never}
        onFieldChange={onFieldChange}
        setIsStartPickerOpen={jest.fn()}
        setIsEndPickerOpen={jest.fn()}
      />,
    );

    fireEvent.changeText(screen.getAllByPlaceholderText("YYYY-MM-DD")[0], "2026-05-11");
    fireEvent.changeText(screen.getAllByPlaceholderText("YYYY-MM-DD")[1], "2026-07-01");
    fireEvent.press(screen.getByText("Today"));
    fireEvent.press(screen.getByText("+30 days"));
    fireEvent.press(screen.getByText("+90 days"));

    expect(onFieldChange).toHaveBeenCalledWith("startDate", "2026-05-11");
    expect(onFieldChange).toHaveBeenCalledWith("endDate", "2026-07-01");
    expect(onFieldChange).toHaveBeenCalledWith("startDate", "2026-05-10");
    expect(onFieldChange).toHaveBeenCalledWith("endDate", "2026-06-09");
    expect(onFieldChange).toHaveBeenCalledWith("endDate", "2026-08-08");
  });

  it("Given reminder fields, When invoking reminder callbacks, Then it maps changes to start/end reminder and picker states", () => {
    const onFieldChange = jest.fn();
    const setIsStartPickerOpen = jest.fn();
    const setIsEndPickerOpen = jest.fn();
    const values = createHabitGroupFormValues();

    render(
      <HabitGroupEditorScheduleSection
        isVisible
        values={values}
        colors={colors as never}
        styles={styles as never}
        onFieldChange={onFieldChange}
        setIsStartPickerOpen={setIsStartPickerOpen}
        setIsEndPickerOpen={setIsEndPickerOpen}
      />,
    );

    act(() => {
      getReminderProps(0).onChange("06:30");
      getReminderProps(0).onPickerVisibilityChange(true);
      getReminderProps(1).onChange("20:15");
      getReminderProps(1).onPickerVisibilityChange(false);
    });

    expect(onFieldChange).toHaveBeenCalledWith("reminderStartTime", "06:30");
    expect(onFieldChange).toHaveBeenCalledWith("reminderEndTime", "20:15");
    expect(setIsStartPickerOpen).toHaveBeenCalledWith(true);
    expect(setIsEndPickerOpen).toHaveBeenCalledWith(false);
  });
});
