import AsyncStorage from "@react-native-async-storage/async-storage";

import { HABIT_STORAGE_KEY_PREFIX } from "../../model/constants";
import { toDateKey } from "../../model/date";
import { createHabitFormValues } from "@/test/fixtures/habits";
import {
  createHabitForUser,
  fetchHabitsForUser,
  fetchLocalHabitStatsForUser,
  setHabitProgressForDate,
  toggleHabitCompletionForDate,
  updateHabitForUser,
} from "../habitStorage";

function getStorageKey(userId: string): string {
  return `${HABIT_STORAGE_KEY_PREFIX}.${userId}`;
}

describe("habitStorage", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-20T10:00:00.000Z"));
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns empty list for missing, invalid, and malformed payloads", async () => {
    const userId = "user-1";

    await expect(fetchHabitsForUser(userId)).resolves.toEqual([]);

    await AsyncStorage.setItem(getStorageKey(userId), "{}");
    await expect(fetchHabitsForUser(userId)).resolves.toEqual([]);

    await AsyncStorage.setItem(getStorageKey(userId), "{");
    await expect(fetchHabitsForUser(userId)).resolves.toEqual([]);
  });

  it("maps valid records, falls back to user id, and filters invalid items", async () => {
    const userId = "user-1";

    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify([
        {
          id: "habit-1",
          userId: "",
          name: "  Read books  ",
          kind: "positive",
          frequency: "daily",
          reminderTime: "08:00",
          iconId: "reading",
          iconColorId: "emerald",
          createdAt: "2026-05-10T10:00:00.000Z",
          updatedAt: "2026-05-10T10:00:00.000Z",
          weeklyWeekday: 1,
          customWeekdays: [1, 3, 5],
          goal: {
            metric: "checkins",
            period: "day",
            target: 1,
            unit: "times",
          },
          completions: {},
        },
        { id: "" },
        null,
      ]),
    );

    const habits = await fetchHabitsForUser(userId);

    expect(habits).toHaveLength(1);
    expect(habits[0]?.id).toBe("habit-1");
    expect(habits[0]?.userId).toBe(userId);
    expect(habits[0]?.name).toBe("Read books");
  });

  it("returns empty list when storage read throws", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("storage failed"));

    await expect(fetchHabitsForUser("user-1")).resolves.toEqual([]);
  });

  it("creates new habits on top of existing list", async () => {
    const userId = "user-1";

    const existing = await createHabitForUser(
      userId,
      createHabitFormValues({ name: "Existing" }),
    );
    const created = await createHabitForUser(
      userId,
      createHabitFormValues({ name: "Created" }),
    );

    const habits = await fetchHabitsForUser(userId);

    expect(habits).toHaveLength(2);
    expect(habits[0]?.id).toBe(created.id);
    expect(habits[0]?.name).toBe("Created");
    expect(habits[1]?.id).toBe(existing.id);
    expect(habits[1]?.name).toBe("Existing");
  });

  it("throws when trying to update a missing habit", async () => {
    await expect(
      updateHabitForUser(
        "user-1",
        "missing-id",
        createHabitFormValues({ name: "Updated" }),
      ),
    ).rejects.toThrow("Habit was not found.");
  });

  it("throws when trying to toggle completion for a missing habit", async () => {
    await expect(
      toggleHabitCompletionForDate("user-1", "missing-id", toDateKey(new Date())),
    ).rejects.toThrow("Habit was not found.");
  });

  it("throws when trying to set progress for a missing habit", async () => {
    await expect(
      setHabitProgressForDate("user-1", "missing-id", toDateKey(new Date()), 2),
    ).rejects.toThrow("Habit was not found.");
  });

  it("returns zeroed local stats when there are no habits", async () => {
    await expect(fetchLocalHabitStatsForUser("user-1")).resolves.toEqual({
      totalHabits: 0,
      currentStreak: 0,
    });
  });
});
