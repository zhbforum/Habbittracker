import type { Habit, HabitWithMetrics } from "../types";
import {
  getCompletionActionLabel,
  getFrequencyLabel,
  getGoalLabel,
  getReminderLabel,
} from "../presenters";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  const base: Habit = {
    id: "habit-1",
    userId: "user-1",
    name: "Drink water",
    kind: "positive",
    frequency: "daily",
    reminderTime: "20:30",
    iconId: "water",
    iconColorId: "emerald",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    weeklyWeekday: 1,
    customWeekdays: [1, 3, 5],
    goal: {
      metric: "checkins",
      period: "day",
      target: 1,
      unit: "times",
    },
    completions: {},
  };

  return {
    ...base,
    ...overrides,
    goal: {
      ...base.goal,
      ...(overrides.goal ?? {}),
    },
    customWeekdays: overrides.customWeekdays ?? base.customWeekdays,
  };
}

function withCompletedToday(habit: Habit, completedToday: boolean): HabitWithMetrics {
  return {
    ...habit,
    metrics: {
      completedToday,
    } as HabitWithMetrics["metrics"],
  };
}

describe("habit presenters", () => {
  it("builds frequency labels for daily, weekly and custom habits", () => {
    expect(getFrequencyLabel(createHabit({ frequency: "daily" }))).toBe("Daily");
    expect(
      getFrequencyLabel(createHabit({ frequency: "weekly", weeklyWeekday: 2 })),
    ).toBe("Weekly on Tue");
    expect(
      getFrequencyLabel(createHabit({ frequency: "custom", customWeekdays: [1, 3, 5] })),
    ).toBe("Custom: Mon, Wed, Fri");
  });

  it("shortens long custom weekday labels", () => {
    const label = getFrequencyLabel(
      createHabit({ frequency: "custom", customWeekdays: [1, 2, 3, 4, 5] }),
    );

    expect(label).toBe("Custom: Mon, Tue, Wed +2");
  });

  it("formats reminder label into user-friendly time", () => {
    expect(getReminderLabel(createHabit({ reminderTime: "08:05" }))).toBe("8:05 AM");
    expect(getReminderLabel(createHabit({ reminderTime: "20:30" }))).toBe("8:30 PM");
    expect(getReminderLabel(createHabit({ reminderTime: "" }))).toBe("Off");
  });

  it("returns action labels based on goal metric, kind and completion state", () => {
    expect(
      getCompletionActionLabel(
        withCompletedToday(
          createHabit({
            goal: { metric: "value", period: "day", target: 2, unit: "cups" },
          }),
          false,
        ),
      ),
    ).toBe("Log value");
    expect(
      getCompletionActionLabel(
        withCompletedToday(
          createHabit({
            goal: { metric: "value", period: "day", target: 2, unit: "cups" },
          }),
          true,
        ),
      ),
    ).toBe("Goal reached");
    expect(getCompletionActionLabel(withCompletedToday(createHabit({ kind: "positive" }), false))).toBe(
      "Mark done",
    );
    expect(getCompletionActionLabel(withCompletedToday(createHabit({ kind: "positive" }), true))).toBe(
      "Done today",
    );
    expect(getCompletionActionLabel(withCompletedToday(createHabit({ kind: "negative" }), false))).toBe(
      "Mark clean day",
    );
    expect(getCompletionActionLabel(withCompletedToday(createHabit({ kind: "negative" }), true))).toBe(
      "Stayed clean",
    );
  });

  it("builds goal label with trimmed unit and period", () => {
    expect(
      getGoalLabel(
        createHabit({
          goal: {
            metric: "value",
            period: "month",
            target: 12,
            unit: "  min  ",
          },
        }),
      ),
    ).toBe("12 min/month");
  });
});
