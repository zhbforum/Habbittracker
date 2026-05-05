import AsyncStorage from "@react-native-async-storage/async-storage";

import { toDateKey } from "@entities/habit/model/date";
import { createHabitFormValues } from "@/test/fixtures/habits";
import {
  createHabitForUser,
  deleteHabitForUser,
  fetchHabitsForUser,
  fetchLocalHabitStatsForUser,
  setHabitProgressForDate,
  toggleHabitCompletionForDate,
  updateHabitForUser,
} from "../habitStorage";

describe("habitStorage integration", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-02T09:30:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("runs end-to-end check-in flow: create -> toggle -> update -> delete", async () => {
    const userId = "user-1";
    const created = await createHabitForUser(
      userId,
      createHabitFormValues({
        name: "Drink water",
      }),
    );

    expect(created.id).toMatch(/^[a-z0-9]+-[a-z0-9]{6}$/);
    expect(created.name).toBe("Drink water");
    expect(created.createdAt).toBe("2026-06-02T09:30:00.000Z");
    expect(created.updatedAt).toBe("2026-06-02T09:30:00.000Z");

    const dateKey = toDateKey(new Date());
    await toggleHabitCompletionForDate(userId, created.id, dateKey);

    let habits = await fetchHabitsForUser(userId);
    expect(habits).toHaveLength(1);
    expect(habits[0]?.completions[dateKey]?.value).toBe(1);

    await toggleHabitCompletionForDate(userId, created.id, dateKey);
    habits = await fetchHabitsForUser(userId);
    expect(habits[0]?.completions[dateKey]).toBeUndefined();

    await updateHabitForUser(
      userId,
      created.id,
      createHabitFormValues({
        name: "Drink tea",
      }),
    );
    habits = await fetchHabitsForUser(userId);
    expect(habits[0]?.name).toBe("Drink tea");

    await deleteHabitForUser(userId, created.id);
    await expect(fetchHabitsForUser(userId)).resolves.toEqual([]);
  });

  it("runs end-to-end value progress flow and computes local stats", async () => {
    const userId = "user-2";
    const created = await createHabitForUser(
      userId,
      createHabitFormValues({
        name: "Run",
        goalMetric: "value",
        goalTarget: 2,
        goalUnit: "km",
      }),
    );
    const dateKey = toDateKey(new Date());

    await setHabitProgressForDate(userId, created.id, dateKey, 2.345);

    const habits = await fetchHabitsForUser(userId);
    expect(habits).toHaveLength(1);
    expect(habits[0]?.completions[dateKey]?.value).toBe(2.35);

    const stats = await fetchLocalHabitStatsForUser(userId);
    expect(stats.totalHabits).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });
});
