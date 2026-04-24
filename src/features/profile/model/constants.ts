import type { ProfileFormValues, UserStats } from "./types";

export const PROFILE_USERNAME_MIN_LENGTH = 3;
export const PROFILE_USERNAME_MAX_LENGTH = 24;
export const PROFILE_NAME_MAX_LENGTH = 48;
export const PROFILE_BIO_MAX_LENGTH = 180;
export const USERNAME_CHANGE_COOLDOWN_DAYS = 14;

export const INITIAL_USER_STATS: UserStats = {
  totalHabits: 0,
  currentStreak: 0,
};

export const INITIAL_PROFILE_FORM_VALUES: ProfileFormValues = {
  name: "",
  username: "",
  bio: "",
  avatarUrl: "",
};
