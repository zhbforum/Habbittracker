import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { routes } from "@/shared/navigation/routes";

import {
  INITIAL_AUTH_FEEDBACK,
  INITIAL_SIGN_IN_VALUES,
  INITIAL_SIGN_UP_VALUES,
} from "../model/constants";
import {
  validateSignInForm,
  validateSignUpForm,
  normalizeEmail,
} from "../model/validators";
import {
  loginWithEmail,
  loginWithGoogleOAuth,
  registerWithEmail,
} from "../services/authService";
import type {
  AuthFeedbackState,
  AuthMode,
  SignInFormValues,
  SignUpFormValues,
} from "../model/types";

export function useAuthScreenController() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signIn");

  const [signInValues, setSignInValues] =
    useState<SignInFormValues>(INITIAL_SIGN_IN_VALUES);
  const [signUpValues, setSignUpValues] =
    useState<SignUpFormValues>(INITIAL_SIGN_UP_VALUES);

  const [isSignInPasswordVisible, setIsSignInPasswordVisible] = useState(false);
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedbackState>(INITIAL_AUTH_FEEDBACK);

  const isSignUp = mode === "signUp";

  const setErrorFeedback = useCallback((message: string) => {
    setFeedback({
      kind: "error",
      message,
    });
  }, []);

  const setSuccessFeedback = useCallback((message: string) => {
    setFeedback({
      kind: "success",
      message,
    });
  }, []);

  const setSignInField = useCallback(
    <K extends keyof SignInFormValues>(field: K, value: SignInFormValues[K]) => {
      setSignInValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [],
  );

  const setSignUpField = useCallback(
    <K extends keyof SignUpFormValues>(field: K, value: SignUpFormValues[K]) => {
      setSignUpValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }));
    },
    [],
  );

  const switchToSignIn = useCallback(() => {
    setMode("signIn");
    setFeedback(INITIAL_AUTH_FEEDBACK);
    setSignInField("email", normalizeEmail(signUpValues.email));
  }, [setSignInField, signUpValues.email]);

  const switchToSignUp = useCallback(() => {
    setMode("signUp");
    setFeedback(INITIAL_AUTH_FEEDBACK);
    setSignUpField("email", normalizeEmail(signInValues.email));
  }, [setSignUpField, signInValues.email]);

  const submitSignIn = useCallback(async () => {
    const validationError = validateSignInForm(signInValues);

    if (validationError) {
      setErrorFeedback(validationError);
      return;
    }

    setIsSubmitting(true);
    setFeedback(INITIAL_AUTH_FEEDBACK);

    const result = await loginWithEmail(signInValues);

    setIsSubmitting(false);

    if (result.status === "error") {
      setErrorFeedback(result.message);
      return;
    }

    setSuccessFeedback(result.message);
    router.replace(routes.profile);
  }, [router, setErrorFeedback, setSuccessFeedback, signInValues]);

  const submitSignUp = useCallback(async () => {
    const validationError = validateSignUpForm(signUpValues);

    if (validationError) {
      setErrorFeedback(validationError);
      return;
    }

    setIsSubmitting(true);
    setFeedback(INITIAL_AUTH_FEEDBACK);

    const result = await registerWithEmail(signUpValues);

    setIsSubmitting(false);

    if (result.status === "error") {
      setErrorFeedback(result.message);
      return;
    }

    setSuccessFeedback(result.message);

    if (result.requiresEmailConfirmation) {
      setMode("signIn");
      setSignInValues({
        email: normalizeEmail(signUpValues.email),
        password: "",
      });
      return;
    }

    router.replace(routes.profile);
  }, [router, setErrorFeedback, setSuccessFeedback, signUpValues]);

  const handlePrimaryActionPress = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isSignUp) {
      void submitSignUp();
      return;
    }

    void submitSignIn();
  }, [isSignUp, isSubmitting, submitSignIn, submitSignUp]);

  const handleGoogleOAuthPress = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(INITIAL_AUTH_FEEDBACK);

    const result = await loginWithGoogleOAuth();

    setIsSubmitting(false);

    if (result.status === "error") {
      setErrorFeedback(result.message);
      return;
    }

    setSuccessFeedback(result.message);

    if (result.status === "success") {
      router.replace(routes.profile);
    }
  }, [isSubmitting, router, setErrorFeedback, setSuccessFeedback]);

  return useMemo(
    () => ({
      mode,
      isSignUp,
      feedback,
      isSubmitting,
      signInValues,
      signUpValues,
      isSignInPasswordVisible,
      isSignUpPasswordVisible,
      setSignInField,
      setSignUpField,
      setIsSignInPasswordVisible,
      setIsSignUpPasswordVisible,
      handlePrimaryActionPress,
      handleGoogleOAuthPress,
      switchToSignIn,
      switchToSignUp,
    }),
    [
      feedback,
      handleGoogleOAuthPress,
      handlePrimaryActionPress,
      isSignInPasswordVisible,
      isSignUp,
      isSignUpPasswordVisible,
      isSubmitting,
      mode,
      setSignInField,
      setSignUpField,
      signInValues,
      signUpValues,
      switchToSignIn,
      switchToSignUp,
    ],
  );
}
