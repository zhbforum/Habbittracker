import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Modal, ScrollView } from "react-native";

import { createHabitGroupFormValues, createHabitWithMetrics } from "@/test/fixtures/habits";

import { HabitGroupEditorGoalSection } from "../HabitGroupEditorGoalSection";
import { HabitGroupEditorIdentitySection } from "../HabitGroupEditorIdentitySection";
import { HabitGroupEditorScheduleSection } from "../HabitGroupEditorScheduleSection";
import { HabitGroupEditorSheet } from "../HabitGroupEditorSheet";

jest.mock("../HabitGroupEditorIdentitySection", () => ({
  HabitGroupEditorIdentitySection: jest.fn(() => null),
}));

jest.mock("../HabitGroupEditorScheduleSection", () => ({
  HabitGroupEditorScheduleSection: jest.fn(() => null),
}));

jest.mock("../HabitGroupEditorGoalSection", () => ({
  HabitGroupEditorGoalSection: jest.fn(() => null),
}));

const habitGroupEditorIdentitySectionMock = jest.mocked(HabitGroupEditorIdentitySection);
const habitGroupEditorScheduleSectionMock = jest.mocked(HabitGroupEditorScheduleSection);
const habitGroupEditorGoalSectionMock = jest.mocked(HabitGroupEditorGoalSection);

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

describe("HabitGroupEditorSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given create mode sheet, When pressing close/save and modal close, Then it forwards actions and section props", () => {
    const onFieldChange = jest.fn();
    const onToggleHabit = jest.fn();
    const onSave = jest.fn();
    const onClose = jest.fn();
    const values = createHabitGroupFormValues();
    const availableHabits = [createHabitWithMetrics("habit-1")];

    const { UNSAFE_getByType } = render(
      <HabitGroupEditorSheet
        isVisible
        mode="create"
        values={values}
        errorMessage={null}
        isSaving={false}
        availableHabits={availableHabits}
        onFieldChange={onFieldChange}
        onToggleHabit={onToggleHabit}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Create Group")).toBeTruthy();
    expect(screen.getByText("Create")).toBeTruthy();
    expect(habitGroupEditorIdentitySectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        values,
        onFieldChange,
      }),
      undefined,
    );
    expect(habitGroupEditorGoalSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        values,
        availableHabits,
        onToggleHabit,
      }),
      undefined,
    );

    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByText("Create"));
    act(() => {
      const modal = UNSAFE_getByType(Modal);
      modal.props.onRequestClose();
    });

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("Given reminder pickers are open and saving in edit mode, When rendering sheet, Then it disables scroll/save and shows error banner", () => {
    const onSave = jest.fn();
    const values = createHabitGroupFormValues();

    const { UNSAFE_getByType } = render(
      <HabitGroupEditorSheet
        isVisible
        mode="edit"
        values={values}
        errorMessage="Group validation failed"
        isSaving
        availableHabits={[]}
        onFieldChange={jest.fn()}
        onToggleHabit={jest.fn()}
        onSave={onSave}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Edit Group")).toBeTruthy();
    expect(screen.getByText("Group validation failed")).toBeTruthy();
    expect(screen.getByText("Saving...")).toBeTruthy();

    const scheduleProps = getLastProps(habitGroupEditorScheduleSectionMock) as {
      setIsStartPickerOpen: (value: boolean) => void;
      setIsEndPickerOpen: (value: boolean) => void;
    };

    act(() => {
      scheduleProps.setIsStartPickerOpen(true);
    });

    expect(UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(false);

    act(() => {
      scheduleProps.setIsStartPickerOpen(false);
      scheduleProps.setIsEndPickerOpen(true);
    });

    expect(UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(false);

    fireEvent.press(screen.getByText("Saving..."));

    expect(onSave).not.toHaveBeenCalled();
  });
});
