import {
  createHabitGroup,
  deleteHabitGroupForUser,
  getItemMock,
  mapRawToHabitGroupMock,
  parsePersistedGroups,
  removeHabitFromGroupsForUser,
} from "../testUtils/habitGroupStorageTestSetup";

describe("habitGroupStorage (delete/remove)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-02T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("deletes group by id and persists remaining groups", async () => {
    const firstGroup = createHabitGroup("group-1");
    const secondGroup = createHabitGroup("group-2");

    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }, { id: "raw-2" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(firstGroup).mockReturnValueOnce(secondGroup);

    await deleteHabitGroupForUser("user-1", "group-1");

    expect(parsePersistedGroups()).toEqual([secondGroup]);
  });

  it("removes habit from related groups and clamps daily goal", async () => {
    const unaffectedGroup = createHabitGroup("group-1", {
      habitIds: ["habit-9"],
      dailyGoal: 1,
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
    const affectedGroup = createHabitGroup("group-2", {
      habitIds: ["habit-1", "habit-2", "habit-3"],
      dailyGoal: 3,
      updatedAt: "2026-06-01T00:00:00.000Z",
    });

    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }, { id: "raw-2" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(unaffectedGroup).mockReturnValueOnce(affectedGroup);

    await removeHabitFromGroupsForUser("user-1", "habit-2");

    expect(parsePersistedGroups()).toEqual([
      unaffectedGroup,
      {
        ...affectedGroup,
        habitIds: ["habit-1", "habit-3"],
        dailyGoal: 2,
        updatedAt: "2026-06-02T10:00:00.000Z",
      },
    ]);
  });

  it("keeps groups unchanged when removed habit is not present", async () => {
    const firstGroup = createHabitGroup("group-1", { habitIds: ["habit-1"], dailyGoal: 1 });
    const secondGroup = createHabitGroup("group-2", { habitIds: ["habit-2"], dailyGoal: 1 });

    getItemMock.mockResolvedValueOnce(JSON.stringify([{ id: "raw-1" }, { id: "raw-2" }]));
    mapRawToHabitGroupMock.mockReturnValueOnce(firstGroup).mockReturnValueOnce(secondGroup);

    await removeHabitFromGroupsForUser("user-1", "habit-999");

    expect(parsePersistedGroups()).toEqual([firstGroup, secondGroup]);
  });
});
