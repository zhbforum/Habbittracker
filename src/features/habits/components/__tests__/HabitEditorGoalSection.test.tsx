import { fireEvent, render, screen } from "@testing-library/react-native";

import { createHabitFormValues } from "@/test/fixtures/habits";

import { HabitSegmentedControl } from "../HabitSegmentedControl";
import { HabitEditorGoalSection } from "../HabitEditorGoalSection";

jest.mock("../HabitSegmentedControl", () => ({
  HabitSegmentedControl: jest.fn(() => null),
}));

const habitSegmentedControlMock = jest.mocked(HabitSegmentedControl);

const styles = {
  fieldLabel: {},
  input: {},
  goalInputsRow: {},
  goalInputColumn: {},
} as const;

const colors = {
  textPlaceholder: "#777777",
} as const;

describe("HabitEditorGoalSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given goal section inputs, When editing values and selectors, Then it forwards handlers and field changes", () => {
    const onFieldChange = jest.fn();
    const handleGoalMetricSelect = jest.fn();
    const handleGoalTargetChange = jest.fn();
    const values = createHabitFormValues({
      goalMetric: "checkins",
      goalPeriod: "day",
      goalTarget: 1,
      goalUnit: "times",
    });

    render(
      <HabitEditorGoalSection
        values={values}
        colors={colors as never}
        styles={styles as never}
        handleGoalMetricSelect={handleGoalMetricSelect}
        handleGoalTargetChange={handleGoalTargetChange}
        onFieldChange={onFieldChange}
      />,
    );

    const metricControlProps = habitSegmentedControlMock.mock.calls[0]?.[0] as {
      onSelect: (nextValue: "checkins" | "value") => void;
    };
    const periodControlProps = habitSegmentedControlMock.mock.calls[1]?.[0] as {
      onSelect: (nextValue: "day" | "week" | "month") => void;
    };

    metricControlProps.onSelect("value");
    periodControlProps.onSelect("week");
    fireEvent.changeText(screen.getByPlaceholderText("1"), "2.5");
    fireEvent.changeText(screen.getByPlaceholderText("times"), "cups");

    expect(handleGoalMetricSelect).toHaveBeenCalledWith("value");
    expect(onFieldChange).toHaveBeenCalledWith("goalPeriod", "week");
    expect(handleGoalTargetChange).toHaveBeenCalledWith("2.5");
    expect(onFieldChange).toHaveBeenCalledWith("goalUnit", "cups");
  });

  it("Given value metric, When rendering unit input, Then it uses value-oriented placeholder", () => {
    const values = createHabitFormValues({
      goalMetric: "value",
    });

    render(
      <HabitEditorGoalSection
        values={values}
        colors={colors as never}
        styles={styles as never}
        handleGoalMetricSelect={jest.fn()}
        handleGoalTargetChange={jest.fn()}
        onFieldChange={jest.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("ml, min, steps")).toBeTruthy();
  });
});
