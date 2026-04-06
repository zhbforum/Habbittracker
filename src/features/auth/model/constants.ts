import type { AuthFeedbackState, SignInFormValues, SignUpFormValues } from "./types";

export const AUTH_PASSWORD_MIN_LENGTH = 8;

export const INITIAL_AUTH_FEEDBACK: AuthFeedbackState = {
  kind: "idle",
  message: "",
};

export const INITIAL_SIGN_IN_VALUES: SignInFormValues = {
  email: "",
  password: "",
};

export const INITIAL_SIGN_UP_VALUES: SignUpFormValues = {
  fullName: "",
  email: "",
  password: "",
  acceptedTerms: false,
};
