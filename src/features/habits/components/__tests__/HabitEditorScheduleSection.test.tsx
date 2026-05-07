import { render } from "@testing-library/react-native";

import { createHabitFormValues } from "@/test/fixtures/habits";

import { HabitIconColorPicker } from "../HabitIconColorPicker";
import { HabitIconPicker } from "../HabitIconPicker";
import { HabitReminderField } from "../HabitReminderField";
import { HabitWeekdaySelector } from "../HabitWeekdaySelector";
import { HabitEditorScheduleSection } from "../HabitEditorScheduleSection";

jest.mock("../HabitWeekdaySelector", () => ({
  HabitWeekdaySelector: jest.fn(() => null),
}));

jest.mock("../HabitReminderField", () => ({
  HabitReminderField: jest.fn(() => null),
}));

jest.mock("../HabitIconPicker", () => ({
  HabitIconPicker: jest.fn(() => null),
}));

jest.mock("../HabitIconColorPicker", () => ({
  HabitIconColorPicker: jest.fn(() => null),
}));

const habitWeekdaySelectorMock = jest.mocked(HabitWeekdaySelector);
const habitReminderFieldMock = jest.mocked(HabitReminderField);
const habitIconPickerMock = jest.mocked(HabitIconPicker);
const habitIconColorPickerMock = jest.mocked(HabitIconColorPicker);

const styles = {
  fieldLabel: {},
} as const;

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitEditorScheduleSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given weekly frequency, When selecting weekday and reminder/icon values, Then it forwards all updates", () => {
    const onFieldChange = jest.fn();
    const onToggleCustomWeekday = jest.fn();
    const setIsReminderPickerOpen = jest.fn();
    const values = createHabitFormValues({
      frequency: "weekly",
      weeklyWeekday: 2,
      customWeekdays: [1, 3, 5],
      reminderTime: "09:30",
    });

    render(
      <HabitEditorScheduleSection
        isVisible
        values={values}
        styles={styles as never}
        onToggleCustomWeekday={onToggleCustomWeekday}
        onFieldChange={onFieldChange}
        setIsReminderPickerOpen={setIsReminderPickerOpen}
      />,
    );

    const weekdayProps = getLastProps(habitWeekdaySelectorMock) as {
      selectedWeekdays: number[];
      onToggleWeekday: (weekday: number) => void;
    };
    const reminderProps = getLastProps(habitReminderFieldMock) as {
      onChange: (nextValue: string) => void;
      onPickerVisibilityChange: (isOpen: boolean) => void;
    };
    const iconPickerProps = getLastProps(habitIconPickerMock) as {
      onSelectIcon: (iconId: string) => void;
    };
    const iconColorPickerProps = getLastProps(habitIconColorPickerMock) as {
      onSelectColor: (colorId: string) => void;
    };

    expect(weekdayProps.selectedWeekdays).toEqual([2]);

    weekdayProps.onToggleWeekday(4);
    reminderProps.onChange("10:45");
    reminderProps.onPickerVisibilityChange(true);
    iconPickerProps.onSelectIcon("reading");
    iconColorPickerProps.onSelectColor("ocean");

    expect(onFieldChange).toHaveBeenCalledWith("weeklyWeekday", 4);
    expect(onFieldChange).toHaveBeenCalledWith("reminderTime", "10:45");
    expect(setIsReminderPickerOpen).toHaveBeenCalledWith(true);
    expect(onFieldChange).toHaveBeenCalledWith("iconId", "reading");
    expect(onFieldChange).toHaveBeenCalledWith("iconColorId", "ocean");
    expect(onToggleCustomWeekday).not.toHaveBeenCalled();
  });

  it("Given custom frequency, When toggling weekday selector, Then it delegates to custom weekday handler", () => {
    const onToggleCustomWeekday = jest.fn();
    const values = createHabitFormValues({
      frequency: "custom",
      customWeekdays: [1, 4],
    });

    render(
      <HabitEditorScheduleSection
        isVisible
        values={values}
        styles={styles as never}
        onToggleCustomWeekday={onToggleCustomWeekday}
        onFieldChange={jest.fn()}
        setIsReminderPickerOpen={jest.fn()}
      />,
    );

    const weekdayProps = getLastProps(habitWeekdaySelectorMock) as {
      selectedWeekdays: number[];
      onToggleWeekday: (weekday: number) => void;
    };

    expect(weekdayProps.selectedWeekdays).toEqual([1, 4]);

    weekdayProps.onToggleWeekday(6);

    expect(onToggleCustomWeekday).toHaveBeenCalledWith(6);
  });
});
