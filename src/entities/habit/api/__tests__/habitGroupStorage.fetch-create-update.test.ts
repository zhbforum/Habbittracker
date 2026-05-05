import type { HabitGroup } from "../../model/types";
import {
  createHabitGroup,
  createHabitGroupForUser,
  createCreateGroupValues,
  createUpdateGroupValues,
  DEFAULT_HABIT_GROUP_FORM_VALUES,
  fetchHabitGroupsForUser,
  getItemMock,
  HABIT_GROUP_STORAGE_KEY_PREFIX,
  mapRawToHabitGroupMock,
  normalizeHabitGroupFormValuesMock,
  parsePersistedGroups,
  setItemMock,
  updateHabitGroupForUser,
} from "../testUtils/habitGroupStorageTestSetup";

describe("habitGroupStorage (fetch/create/update)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-02T10:00:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("fetches groups and filters out invalid mapped values", async () => {
    const mappedGroup = createHabitGroup("group-1");
    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }, { id: "raw-2" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(mappedGroup).mockReturnValueOnce(null);

    const result = await fetchHabitGroupsForUser("user-1");

    expect(result).toEqual([mappedGroup]);
    expect(mapRawToHabitGroupMock).toHaveBeenNthCalledWith(1, { id: "raw-1" }, "user-1");
    expect(mapRawToHabitGroupMock).toHaveBeenNthCalledWith(2, { id: "raw-2" }, "user-1");
  });

  it("returns empty list for empty, malformed, non-array, or read-failure payload", async () => {
    getItemMock.mockResolvedValueOnce(null);
    await expect(fetchHabitGroupsForUser("user-1")).resolves.toEqual([]);

    getItemMock.mockResolvedValueOnce("{");
    await expect(fetchHabitGroupsForUser("user-1")).resolves.toEqual([]);

    getItemMock.mockResolvedValueOnce("{}");
    await expect(fetchHabitGroupsForUser("user-1")).resolves.toEqual([]);

    getItemMock.mockRejectedValueOnce(new Error("storage failed"));
    await expect(fetchHabitGroupsForUser("user-1")).resolves.toEqual([]);
  });

  it("creates group from normalized values and persists it before existing groups", async () => {
    const { rawValues, normalizedValues } = createCreateGroupValues();
    const existingGroup = createHabitGroup("existing");

    normalizeHabitGroupFormValuesMock.mockReturnValueOnce(normalizedValues);
    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-existing" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(existingGroup);

    const result = await createHabitGroupForUser("user-1", rawValues);

    expect(normalizeHabitGroupFormValuesMock).toHaveBeenCalledWith(rawValues);
    expect(setItemMock).toHaveBeenCalledTimes(1);
    expect(setItemMock.mock.calls[0]?.[0]).toBe(`${HABIT_GROUP_STORAGE_KEY_PREFIX}.user-1`);

    const persisted = parsePersistedGroups();
    expect(persisted).toHaveLength(2);
    expect(persisted[0]).toEqual(result);
    expect(persisted[1]).toEqual(existingGroup);
    expect(result).toEqual({
      id: expect.any(String),
      userId: "user-1",
      name: normalizedValues.name,
      description: normalizedValues.description,
      iconId: normalizedValues.iconId,
      frequency: normalizedValues.frequency,
      weeklyWeekday: normalizedValues.weeklyWeekday,
      customWeekdays: normalizedValues.customWeekdays,
      startDate: normalizedValues.startDate,
      endDate: normalizedValues.endDate,
      reminderStartTime: normalizedValues.reminderStartTime,
      reminderEndTime: normalizedValues.reminderEndTime,
      dailyGoal: normalizedValues.dailyGoal,
      habitIds: normalizedValues.habitIds,
      createdAt: "2026-06-02T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
    });
    expect(result.id).toMatch(/^[a-z0-9]+-[a-z0-9]{6}$/);
  });

  it("updates existing group and persists updated values", async () => {
    const { rawValues, normalizedValues } = createUpdateGroupValues();
    const firstGroup = createHabitGroup("group-1");
    const targetGroup = createHabitGroup("group-2", {
      name: "Old name",
      description: "Old description",
      dailyGoal: 3,
      habitIds: ["habit-1", "habit-2", "habit-3"],
    });

    normalizeHabitGroupFormValuesMock.mockReturnValueOnce(normalizedValues);
    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }, { id: "raw-2" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(firstGroup).mockReturnValueOnce(targetGroup);

    const result = await updateHabitGroupForUser("user-1", "group-2", rawValues);

    expect(normalizeHabitGroupFormValuesMock).toHaveBeenCalledWith(rawValues);
    const persisted = parsePersistedGroups();
    expect(persisted).toEqual([
      firstGroup,
      {
        ...targetGroup,
        name: normalizedValues.name,
        description: normalizedValues.description,
        iconId: normalizedValues.iconId,
        frequency: normalizedValues.frequency,
        weeklyWeekday: normalizedValues.weeklyWeekday,
        customWeekdays: normalizedValues.customWeekdays,
        startDate: normalizedValues.startDate,
        endDate: normalizedValues.endDate,
        reminderStartTime: normalizedValues.reminderStartTime,
        reminderEndTime: normalizedValues.reminderEndTime,
        dailyGoal: normalizedValues.dailyGoal,
        habitIds: normalizedValues.habitIds,
        updatedAt: "2026-06-02T10:00:00.000Z",
      },
    ]);
    expect(result).toEqual(persisted[1] as HabitGroup);
  });

  it("throws when updating missing group", async () => {
    normalizeHabitGroupFormValuesMock.mockReturnValueOnce(DEFAULT_HABIT_GROUP_FORM_VALUES);
    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(createHabitGroup("group-1"));

    await expect(
      updateHabitGroupForUser("user-1", "missing-group", DEFAULT_HABIT_GROUP_FORM_VALUES),
    ).rejects.toThrow("Group was not found.");
    expect(setItemMock).not.toHaveBeenCalled();
  });
});
