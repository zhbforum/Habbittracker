import AsyncStorage from "@react-native-async-storage/async-storage";

import { createHabitGroupFormValues } from "@/test/fixtures/habits";
import {
  createHabitGroupForUser,
  deleteHabitGroupForUser,
  fetchHabitGroupsForUser,
  removeHabitFromGroupsForUser,
  updateHabitGroupForUser,
} from "../habitGroupStorage";

describe("habitGroupStorage integration", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-02T09:30:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.456789123);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("runs end-to-end group flow: create -> update -> remove habit -> delete", async () => {
    const userId = "user-1";
    const createdGroup = await createHabitGroupForUser(
      userId,
      createHabitGroupFormValues({
        name: "Morning routine",
        description: "Start focused",
        habitIds: ["habit-1", "habit-2", "habit-1"],
        dailyGoal: 2,
      }),
    );

    expect(createdGroup.id).toMatch(/^[a-z0-9]+-[a-z0-9]{6}$/);
    expect(createdGroup.name).toBe("Morning routine");
    expect(createdGroup.habitIds).toEqual(["habit-1", "habit-2"]);
    expect(createdGroup.createdAt).toBe("2026-06-02T09:30:00.000Z");
    expect(createdGroup.updatedAt).toBe("2026-06-02T09:30:00.000Z");

    await updateHabitGroupForUser(
      userId,
      createdGroup.id,
      createHabitGroupFormValues({
        name: "Morning flow",
        description: "Updated description",
        habitIds: ["habit-2"],
        dailyGoal: 1,
      }),
    );

    let groups = await fetchHabitGroupsForUser(userId);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.name).toBe("Morning flow");
    expect(groups[0]?.habitIds).toEqual(["habit-2"]);

    await removeHabitFromGroupsForUser(userId, "habit-2");
    groups = await fetchHabitGroupsForUser(userId);
    expect(groups[0]?.habitIds).toEqual([]);
    expect(groups[0]?.dailyGoal).toBe(1);

    await deleteHabitGroupForUser(userId, createdGroup.id);
    await expect(fetchHabitGroupsForUser(userId)).resolves.toEqual([]);
  });
});
