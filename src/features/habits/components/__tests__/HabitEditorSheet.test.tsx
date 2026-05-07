import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal, ScrollView } from "react-native";

import { createHabitFormValues } from "@/test/fixtures/habits";
import { useHabitEditorState } from "@features/habits/hooks/useHabitEditorState";

import { HabitEditorGoalSection } from "../HabitEditorGoalSection";
import { HabitEditorIdentitySection } from "../HabitEditorIdentitySection";
import { HabitEditorScheduleSection } from "../HabitEditorScheduleSection";
import { HabitEditorSheet } from "../HabitEditorSheet";

jest.mock("@features/habits/hooks/useHabitEditorState", () => ({
  useHabitEditorState: jest.fn(),
}));

jest.mock("../HabitEditorIdentitySection", () => ({
  HabitEditorIdentitySection: jest.fn(() => null),
}));

jest.mock("../HabitEditorGoalSection", () => ({
  HabitEditorGoalSection: jest.fn(() => null),
}));

jest.mock("../HabitEditorScheduleSection", () => ({
  HabitEditorScheduleSection: jest.fn(() => null),
}));

const useHabitEditorStateMock = jest.mocked(useHabitEditorState);
const habitEditorIdentitySectionMock = jest.mocked(HabitEditorIdentitySection);
const habitEditorGoalSectionMock = jest.mocked(HabitEditorGoalSection);
const habitEditorScheduleSectionMock = jest.mocked(HabitEditorScheduleSection);

describe("HabitEditorSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given create mode editor, When pressing cancel/save and modal close, Then it forwards handlers and section props", () => {
    const onFieldChange = jest.fn();
    const onToggleCustomWeekday = jest.fn();
    const onSave = jest.fn();
    const onClose = jest.fn();
    const setIsReminderPickerOpen = jest.fn();
    const handleGoalMetricSelect = jest.fn();
    const handleGoalTargetChange = jest.fn();
    const values = createHabitFormValues();

    useHabitEditorStateMock.mockReturnValue({
      isReminderPickerOpen: false,
      setIsReminderPickerOpen,
      handleGoalMetricSelect,
      handleGoalTargetChange,
      saveButtonLabel: "Create",
    });

    const { UNSAFE_getByType } = render(
      <HabitEditorSheet
        isVisible
        mode="create"
        values={values}
        errorMessage={null}
        isSaving={false}
        onFieldChange={onFieldChange}
        onToggleCustomWeekday={onToggleCustomWeekday}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Create Habit")).toBeTruthy();
    expect(useHabitEditorStateMock).toHaveBeenCalledWith({
      mode: "create",
      isSaving: false,
      values,
      onFieldChange,
    });
    expect(habitEditorIdentitySectionMock).toHaveBeenCalled();
    expect(habitEditorGoalSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        values,
        handleGoalMetricSelect,
        handleGoalTargetChange,
      }),
      undefined,
    );
    expect(habitEditorScheduleSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        onToggleCustomWeekday,
        setIsReminderPickerOpen,
      }),
      undefined,
    );

    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByText("Create"));
    UNSAFE_getByType(Modal).props.onRequestClose();

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("Given edit mode with saving and open reminder picker, When rendering sheet, Then it shows error banner and disables save action", () => {
    const onSave = jest.fn();
    const values = createHabitFormValues();

    useHabitEditorStateMock.mockReturnValue({
      isReminderPickerOpen: true,
      setIsReminderPickerOpen: jest.fn(),
      handleGoalMetricSelect: jest.fn(),
      handleGoalTargetChange: jest.fn(),
      saveButtonLabel: "Saving...",
    });

    const { UNSAFE_getByType } = render(
      <HabitEditorSheet
        isVisible
        mode="edit"
        values={values}
        errorMessage="Invalid reminder"
        isSaving
        onFieldChange={jest.fn()}
        onToggleCustomWeekday={jest.fn()}
        onSave={onSave}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Edit Habit")).toBeTruthy();
    expect(screen.getByText("Invalid reminder")).toBeTruthy();

    const scrollView = UNSAFE_getByType(ScrollView);
    expect(scrollView.props.scrollEnabled).toBe(false);

    fireEvent.press(screen.getByText("Saving..."));

    expect(onSave).not.toHaveBeenCalled();
  });
});
