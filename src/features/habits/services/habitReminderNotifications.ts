import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { parseTimeToMinutes } from "@entities/habit/model/date";
import type { Habit, HabitWeekday } from "@entities/habit/model/types";

const REMINDER_NOTIFICATION_DATA_TYPE = "habit-reminder";
const REMINDER_ANDROID_CHANNEL_ID = "habit-reminders";

type ReminderData = {
  type: string;
  userId: string;
  habitId: string;
};

export type HabitReminderSyncStatus =
  | "scheduled"
  | "disabled"
  | "permission_denied"
  | "invalid_time";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return null;
}

function matchesReminderNotification(
  value: unknown,
  userId: string,
  habitId: string,
): boolean {
  const data = asRecord(value);

  if (!data) {
    return false;
  }

  return (
    data.type === REMINDER_NOTIFICATION_DATA_TYPE &&
    data.userId === userId &&
    data.habitId === habitId
  );
}

function normalizeWeekdays(weekdays: HabitWeekday[]): HabitWeekday[] {
  return Array.from(new Set(weekdays))
    .map((weekday) => (((weekday % 7) + 7) % 7) as HabitWeekday)
    .sort((left, right) => left - right);
}

function toReminderWeekdays(habit: Habit): HabitWeekday[] {
  if (habit.frequency === "daily") {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (habit.frequency === "weekly") {
    return [habit.weeklyWeekday];
  }

  return normalizeWeekdays(habit.customWeekdays);
}

function toNotificationsWeekday(weekday: HabitWeekday): number {
  return weekday === 0 ? 1 : weekday + 1;
}

async function ensureNotificationPermission(): Promise<boolean> {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted) {
    return true;
  }

  if (currentPermission.canAskAgain === false) {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_ANDROID_CHANNEL_ID, {
      name: "Habit reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      sound: "default",
    });
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
}

function buildReminderNotificationData(habit: Habit): ReminderData {
  return {
    type: REMINDER_NOTIFICATION_DATA_TYPE,
    userId: habit.userId,
    habitId: habit.id,
  };
}

async function clearHabitReminderNotificationsByIdentity(
  userId: string,
  habitId: string,
): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const matchedIds = scheduledNotifications
    .filter((notification) =>
      matchesReminderNotification(notification.content.data, userId, habitId),
    )
    .map((notification) => notification.identifier);

  await Promise.all(
    matchedIds.map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId),
    ),
  );
}

function createNotificationTrigger(
  weekday: HabitWeekday | null,
  hour: number,
  minute: number,
): Notifications.SchedulableNotificationTriggerInput {
  const channelConfig =
    Platform.OS === "android" ? { channelId: REMINDER_ANDROID_CHANNEL_ID } : {};

  if (weekday === null) {
    return {
      type: "daily",
      hour,
      minute,
      ...channelConfig,
    } as Notifications.SchedulableNotificationTriggerInput;
  }

  return {
    type: "weekly",
    weekday: toNotificationsWeekday(weekday),
    hour,
    minute,
    ...channelConfig,
  } as Notifications.SchedulableNotificationTriggerInput;
}

async function scheduleHabitReminderNotifications(habit: Habit): Promise<number> {
  const reminderMinutes = parseTimeToMinutes(habit.reminderTime);

  if (reminderMinutes === null) {
    return 0;
  }

  const hour = Math.floor(reminderMinutes / 60);
  const minute = reminderMinutes % 60;
  const reminderData = buildReminderNotificationData(habit);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_ANDROID_CHANNEL_ID, {
      name: "Habit reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      sound: "default",
    });
  }

  const weekdays = toReminderWeekdays(habit);
  const triggerWeekdays = habit.frequency === "daily" ? [null] : weekdays;

  await Promise.all(
    triggerWeekdays.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Habit reminder",
          body: `Time for ${habit.name}`,
          sound: "default",
          data: reminderData,
        },
        trigger: createNotificationTrigger(weekday, hour, minute),
      }),
    ),
  );

  return triggerWeekdays.length;
}

export async function clearHabitReminderNotifications(
  userId: string,
  habitId: string,
): Promise<void> {
  await clearHabitReminderNotificationsByIdentity(userId, habitId);
}

export async function syncHabitReminderNotifications(
  habit: Habit,
): Promise<HabitReminderSyncStatus> {
  await clearHabitReminderNotificationsByIdentity(habit.userId, habit.id);

  if (!habit.reminderTime.trim()) {
    return "disabled";
  }

  const reminderMinutes = parseTimeToMinutes(habit.reminderTime);

  if (reminderMinutes === null) {
    return "invalid_time";
  }

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    return "permission_denied";
  }

  await scheduleHabitReminderNotifications(habit);
  return "scheduled";
}
