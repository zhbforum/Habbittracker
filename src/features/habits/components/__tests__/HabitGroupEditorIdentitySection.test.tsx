import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitGroupFormValues } from "@/test/fixtures/habits";

import { HabitIconPicker } from "../HabitIconPicker";
import { HabitSegmentedControl } from "../HabitSegmentedControl";
import { HabitWeekdaySelector } from "../HabitWeekdaySelector";
import { HabitGroupEditorIdentitySection } from "../HabitGroupEditorIdentitySection";

jest.mock("../HabitIconPicker", () => ({
  HabitIconPicker: jest.fn(() => null),
}));

jest.mock("../HabitSegmentedControl", () => ({
  HabitSegmentedControl: jest.fn(() => null),
}));

jest.mock("../HabitWeekdaySelector", () => ({
  HabitWeekdaySelector: jest.fn(() => null),
}));

const habitIconPickerMock = jest.mocked(HabitIconPicker);
const habitSegmentedControlMock = jest.mocked(HabitSegmentedControl);
const habitWeekdaySelectorMock = jest.mocked(HabitWeekdaySelector);

const styles = {
  fieldLabel: {},
  input: {},
  multilineInput: {},
} as const;

const colors = {
  textPlaceholder: "#777777",
} as const;

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitGroupEditorIdentitySection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given text and selector interactions, When editing identity fields, Then it forwards group updates to onFieldChange", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      frequency: "daily",
    });

    render(
      <HabitGroupEditorIdentitySection
        values={values}
        colors={colors as any}
        styles={styles as any}
        onFieldChange={onFieldChange}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText("Sport session"), "Morning Routine");
    fireEvent.changeText(
      screen.getByPlaceholderText("Short context for this routine"),
      "Stretches + core",
    );

    const iconPickerProps = getLastProps(habitIconPickerMock) as {
      onSelectIcon: (iconId: string) => void;
    };
    iconPickerProps.onSelectIcon("book");

    const segmentedProps = getLastProps(habitSegmentedControlMock) as {
      onSelect: (frequency: string) => void;
    };
    segmentedProps.onSelect("weekly");

    expect(onFieldChange).toHaveBeenCalledWith("name", "Morning Routine");
    expect(onFieldChange).toHaveBeenCalledWith("description", "Stretches + core");
    expect(onFieldChange).toHaveBeenCalledWith("iconId", "book");
    expect(onFieldChange).toHaveBeenCalledWith("frequency", "weekly");
  });

  it("Given weekly frequency, When toggling weekday selector, Then it updates weekly weekday field", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      frequency: "weekly",
      weeklyWeekday: 3,
    });

    render(
      <HabitGroupEditorIdentitySection
        values={values}
        colors={colors as any}
        styles={styles as any}
        onFieldChange={onFieldChange}
      />,
    );

    const weekdaySelectorProps = getLastProps(habitWeekdaySelectorMock) as {
      selectedWeekdays: number[];
      onToggleWeekday: (weekday: number) => void;
    };

    expect(weekdaySelectorProps.selectedWeekdays).toEqual([3]);

    weekdaySelectorProps.onToggleWeekday(5);

    expect(onFieldChange).toHaveBeenCalledWith("weeklyWeekday", 5);
  });

  it("Given custom frequency, When toggling custom weekdays, Then it removes selected day or adds sorted day list", () => {
    const onFieldChange = jest.fn();
    const values = createHabitGroupFormValues({
      frequency: "custom",
      customWeekdays: [1, 4],
    });

    render(
      <HabitGroupEditorIdentitySection
        values={values}
        colors={colors as any}
        styles={styles as any}
        onFieldChange={onFieldChange}
      />,
    );

    const weekdaySelectorProps = getLastProps(habitWeekdaySelectorMock) as {
      selectedWeekdays: number[];
      onToggleWeekday: (weekday: number) => void;
    };

    expect(weekdaySelectorProps.selectedWeekdays).toEqual([1, 4]);

    weekdaySelectorProps.onToggleWeekday(4);
    weekdaySelectorProps.onToggleWeekday(2);

    expect(onFieldChange).toHaveBeenNthCalledWith(1, "customWeekdays", [1]);
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "customWeekdays", [1, 2, 4]);
  });
});
