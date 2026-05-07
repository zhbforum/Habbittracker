import { render, screen } from "@testing-library/react-native";

import { createHabitSummary } from "@/test/fixtures/habits";

import { HabitsSummaryStrip } from "../HabitsSummaryStrip";

describe("HabitsSummaryStrip", () => {
  it("Given habits summary values, When rendering summary strip, Then all metric labels and values are shown", () => {
    render(
      <HabitsSummaryStrip
        summary={createHabitSummary({
          total: 7,
          positive: 5,
          negative: 2,
          completedToday: 3,
        })}
      />,
    );

    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Helpful")).toBeTruthy();
    expect(screen.getByText("Harmful")).toBeTruthy();
    expect(screen.getByText("Completed today")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });
});
