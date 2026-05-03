import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
  PROFILE_USERNAME_MIN_LENGTH,
} from "./constants";

const USERNAME_ALLOWED_PATTERN = /^[a-z0-9_]+$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function sanitizeBio(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function validateName(value: string): string | null {
  const name = sanitizeName(value);

  if (!name) {
    return "Name is required.";
  }

  if (name.length > PROFILE_NAME_MAX_LENGTH) {
    return `Name must be at most ${PROFILE_NAME_MAX_LENGTH} characters.`;
  }

  return null;
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);

  if (!username) {
    return "Username is required.";
  }

  if (username.length < PROFILE_USERNAME_MIN_LENGTH) {
    return `Username must be at least ${PROFILE_USERNAME_MIN_LENGTH} characters.`;
  }

  if (username.length > PROFILE_USERNAME_MAX_LENGTH) {
    return `Username must be at most ${PROFILE_USERNAME_MAX_LENGTH} characters.`;
  }

  if (!USERNAME_ALLOWED_PATTERN.test(username)) {
    return "Use only lowercase letters, numbers, and underscores.";
  }

  return null;
}

export function validateBio(value: string): string | null {
  const bio = sanitizeBio(value);

  if (bio.length > PROFILE_BIO_MAX_LENGTH) {
    return `Bio must be at most ${PROFILE_BIO_MAX_LENGTH} characters.`;
  }

  return null;
}

export function validateProfileFormValues(values: {
  name: string;
  username: string;
  bio: string;
}): string | null {
  const nameError = validateName(values.name);

  if (nameError) {
    return nameError;
  }

  const usernameError = validateUsername(values.username);

  if (usernameError) {
    return usernameError;
  }

  return validateBio(values.bio);
}
