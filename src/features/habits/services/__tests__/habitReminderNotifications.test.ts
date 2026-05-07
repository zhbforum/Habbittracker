import * as Notifications from "expo-notifications";

import { createHabit } from "@/test/fixtures/habits";
import {
  clearHabitReminderNotifications,
  syncHabitReminderNotifications,
} from "../habitReminderNotifications";

const getPermissionsAsyncMock =
  Notifications.getPermissionsAsync as jest.MockedFunction<typeof Notifications.getPermissionsAsync>;
const requestPermissionsAsyncMock =
  Notifications.requestPermissionsAsync as jest.MockedFunction<
    typeof Notifications.requestPermissionsAsync
  >;
const setNotificationChannelAsyncMock =
  Notifications.setNotificationChannelAsync as jest.MockedFunction<
    typeof Notifications.setNotificationChannelAsync
  >;
const getAllScheduledNotificationsAsyncMock =
  Notifications.getAllScheduledNotificationsAsync as jest.MockedFunction<
    typeof Notifications.getAllScheduledNotificationsAsync
  >;
const cancelScheduledNotificationAsyncMock =
  Notifications.cancelScheduledNotificationAsync as jest.MockedFunction<
    typeof Notifications.cancelScheduledNotificationAsync
  >;
const scheduleNotificationAsyncMock =
  Notifications.scheduleNotificationAsync as jest.MockedFunction<
    typeof Notifications.scheduleNotificationAsync
  >;

describe("habitReminderNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getPermissionsAsyncMock.mockResolvedValue({
      granted: true,
      canAskAgain: true,
    } as never);
    requestPermissionsAsyncMock.mockResolvedValue({
      granted: true,
    } as never);
    setNotificationChannelAsyncMock.mockResolvedValue({} as never);
    getAllScheduledNotificationsAsyncMock.mockResolvedValue([]);
    cancelScheduledNotificationAsyncMock.mockResolvedValue();
    scheduleNotificationAsyncMock.mockResolvedValue("reminder-id");
  });

  it("Given reminder is turned off, When syncing notifications, Then it clears old reminders and returns disabled", async () => {
    getAllScheduledNotificationsAsyncMock.mockResolvedValue([
      {
        identifier: "old-reminder-1",
        content: {
          data: {
            type: "habit-reminder",
            userId: "user-1",
            habitId: "habit-1",
          },
        },
      },
    ] as never);

    const result = await syncHabitReminderNotifications(
      createHabit("habit-1", {
        reminderTime: "",
      }),
    );

    expect(result).toBe("disabled");
    expect(cancelScheduledNotificationAsyncMock).toHaveBeenCalledWith("old-reminder-1");
    expect(scheduleNotificationAsyncMock).not.toHaveBeenCalled();
  });

  it("Given permission is denied, When syncing reminder, Then it returns permission_denied without scheduling", async () => {
    getPermissionsAsyncMock.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    } as never);

    const result = await syncHabitReminderNotifications(
      createHabit("habit-2", {
        reminderTime: "08:30",
      }),
    );

    expect(result).toBe("permission_denied");
    expect(scheduleNotificationAsyncMock).not.toHaveBeenCalled();
  });

  it("Given a daily habit, When syncing reminder, Then it schedules one daily trigger", async () => {
    const result = await syncHabitReminderNotifications(
      createHabit("habit-3", {
        frequency: "daily",
        reminderTime: "21:15",
      }),
    );

    expect(result).toBe("scheduled");
    expect(scheduleNotificationAsyncMock).toHaveBeenCalledTimes(1);
    expect(scheduleNotificationAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Habit reminder",
          body: "Time for Habit habit-3",
          data: expect.objectContaining({
            type: "habit-reminder",
            userId: "user-1",
            habitId: "habit-3",
          }),
        }),
        trigger: expect.objectContaining({
          type: "daily",
          hour: 21,
          minute: 15,
        }),
      }),
    );
  });

  it("Given a custom-frequency habit, When syncing reminder, Then it schedules one weekly trigger per selected weekday", async () => {
    await syncHabitReminderNotifications(
      createHabit("habit-4", {
        frequency: "custom",
        customWeekdays: [1, 3, 5],
        reminderTime: "06:45",
      }),
    );

    expect(scheduleNotificationAsyncMock).toHaveBeenCalledTimes(3);
    const triggerWeekdays = scheduleNotificationAsyncMock.mock.calls.map(
      (call) => (call[0] as { trigger: { weekday: number } }).trigger.weekday,
    );
    expect(triggerWeekdays).toEqual([2, 4, 6]);
  });

  it("Given stale and unrelated scheduled reminders, When clearing by habit identity, Then it cancels only matching identifiers", async () => {
    getAllScheduledNotificationsAsyncMock.mockResolvedValue([
      {
        identifier: "keep-other-habit",
        content: {
          data: {
            type: "habit-reminder",
            userId: "user-1",
            habitId: "habit-2",
          },
        },
      },
      {
        identifier: "cancel-target",
        content: {
          data: {
            type: "habit-reminder",
            userId: "user-1",
            habitId: "habit-1",
          },
        },
      },
      {
        identifier: "keep-other-type",
        content: {
          data: {
            type: "other",
            userId: "user-1",
            habitId: "habit-1",
          },
        },
      },
    ] as never);

    await clearHabitReminderNotifications("user-1", "habit-1");

    expect(cancelScheduledNotificationAsyncMock).toHaveBeenCalledTimes(1);
    expect(cancelScheduledNotificationAsyncMock).toHaveBeenCalledWith("cancel-target");
  });
});
