import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitFormValues } from "@/test/fixtures/habits";

import { HabitSegmentedControl } from "../HabitSegmentedControl";
import { HabitEditorIdentitySection } from "../HabitEditorIdentitySection";

jest.mock("../HabitSegmentedControl", () => ({
  HabitSegmentedControl: jest.fn(() => null),
}));

const habitSegmentedControlMock = jest.mocked(HabitSegmentedControl);

const styles = {
  fieldLabel: {},
  input: {},
} as const;

const colors = {
  textPlaceholder: "#777777",
} as const;

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitEditorIdentitySection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given identity fields, When changing name, type and frequency, Then it forwards updates", () => {
    const onFieldChange = jest.fn();
    const values = createHabitFormValues({
      name: "Water",
      kind: "positive",
      frequency: "daily",
    });

    render(
      <HabitEditorIdentitySection
        values={values}
        colors={colors as never}
        styles={styles as never}
        onFieldChange={onFieldChange}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText("Drink 2L water"), "Deep work");

    const calls = habitSegmentedControlMock.mock.calls;
    const typeControlProps = calls[0]?.[0] as {
      onSelect: (nextValue: "positive" | "negative") => void;
    };
    const frequencyControlProps = calls[1]?.[0] as {
      onSelect: (nextValue: "daily" | "weekly" | "custom") => void;
    };

    typeControlProps.onSelect("negative");
    frequencyControlProps.onSelect("custom");

    expect(onFieldChange).toHaveBeenCalledWith("name", "Deep work");
    expect(onFieldChange).toHaveBeenCalledWith("kind", "negative");
    expect(onFieldChange).toHaveBeenCalledWith("frequency", "custom");
  });

  it("Given rendered section, When checking segmented props, Then it passes selected values from form", () => {
    const values = createHabitFormValues({
      kind: "negative",
      frequency: "weekly",
    });

    render(
      <HabitEditorIdentitySection
        values={values}
        colors={colors as never}
        styles={styles as never}
        onFieldChange={jest.fn()}
      />,
    );

    const typeControlProps = habitSegmentedControlMock.mock.calls[0]?.[0] as {
      selectedValue: string;
    };
    const frequencyControlProps = getLastProps(habitSegmentedControlMock) as {
      selectedValue: string;
    };

    expect(typeControlProps.selectedValue).toBe("negative");
    expect(frequencyControlProps.selectedValue).toBe("weekly");
  });
});
