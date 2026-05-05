import AsyncStorage from "@react-native-async-storage/async-storage";

import { createHabit } from "@/test/fixtures/habits";
import { HABIT_STORAGE_KEY_PREFIX } from "../../model/constants";
import { mapHabitToPersistenceDto } from "../../model/mappers";
import {
  createHabitId,
  persistHabits,
  readHabitStoragePayload,
} from "../habitStoragePersistence";

jest.mock("../../model/mappers", () => ({
  mapHabitToPersistenceDto: jest.fn(),
}));

const mapHabitToPersistenceDtoMock =
  mapHabitToPersistenceDto as jest.MockedFunction<typeof mapHabitToPersistenceDto>;
const setItemMock = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const getItemMock = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;

describe("habitStoragePersistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates deterministic id from date and random chunks", () => {
    jest.spyOn(Date, "now").mockReturnValue(1714910400000);
    jest.spyOn(Math, "random").mockReturnValue(0.987654321);

    const id = createHabitId();

    expect(id).toBe(`${(1714910400000).toString(36)}-${(0.987654321).toString(36).slice(2, 8)}`);
  });

  it("maps habits to dto payload and persists by user key", async () => {
    const habits = [createHabit("habit-1"), createHabit("habit-2")];
    mapHabitToPersistenceDtoMock
      .mockReturnValueOnce({ id: "dto-1" } as ReturnType<typeof mapHabitToPersistenceDto>)
      .mockReturnValueOnce({ id: "dto-2" } as ReturnType<typeof mapHabitToPersistenceDto>);

    await persistHabits("user-1", habits);

    expect(mapHabitToPersistenceDtoMock).toHaveBeenNthCalledWith(1, habits[0], 0, habits);
    expect(mapHabitToPersistenceDtoMock).toHaveBeenNthCalledWith(2, habits[1], 1, habits);
    expect(setItemMock).toHaveBeenCalledWith(
      `${HABIT_STORAGE_KEY_PREFIX}.user-1`,
      JSON.stringify([{ id: "dto-1" }, { id: "dto-2" }]),
    );
  });

  it("reads habit payload from user-specific storage key", async () => {
    getItemMock.mockResolvedValueOnce("payload-value");

    await expect(readHabitStoragePayload("user-1")).resolves.toBe("payload-value");
    expect(getItemMock).toHaveBeenCalledWith(`${HABIT_STORAGE_KEY_PREFIX}.user-1`);
  });
});
