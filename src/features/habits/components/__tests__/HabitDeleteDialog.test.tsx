import { fireEvent, render, screen } from "@testing-library/react-native";

import { HabitDeleteDialog } from "../HabitDeleteDialog";

describe("HabitDeleteDialog", () => {
  it("renders delete confirmation and forwards cancel/confirm actions", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <HabitDeleteDialog
        isVisible
        isDeleting={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Delete habit")).toBeTruthy();
    expect(
      screen.getByText("This habit and all activity history will be removed."),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByText("Delete"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows loading label and disables actions while deletion is in progress", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <HabitDeleteDialog
        isVisible
        isDeleting
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Deleting...")).toBeTruthy();

    fireEvent.press(screen.getByText("Cancel"));
    fireEvent.press(screen.getByText("Deleting..."));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
