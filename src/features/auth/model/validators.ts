import { AUTH_PASSWORD_MIN_LENGTH } from "./constants";
import type { SignInFormValues, SignUpFormValues } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateSignInForm(values: SignInFormValues): string | null {
  const email = normalizeEmail(values.email);
  const password = values.password.trim();

  if (!email) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  return null;
}

export function validateSignUpForm(values: SignUpFormValues): string | null {
  const fullName = values.fullName.trim();
  const email = normalizeEmail(values.email);
  const password = values.password;

  if (!fullName) {
    return "Full name is required.";
  }

  if (!email) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    return `Password must contain at least ${AUTH_PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!values.acceptedTerms) {
    return "Please accept Terms of Service and Privacy Policy.";
  }

  return null;
}
