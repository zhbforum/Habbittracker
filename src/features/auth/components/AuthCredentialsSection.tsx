import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type {
  AuthFeedbackState,
  SignInFormValues,
  SignUpFormValues,
} from "../model/types";
import { AuthFeedbackMessage } from "./AuthFeedbackMessage";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

type AuthCredentialsSectionProps = {
  isSignUp: boolean;
  isSubmitting: boolean;
  feedback: AuthFeedbackState;
  signInValues: SignInFormValues;
  signUpValues: SignUpFormValues;
  isSignInPasswordVisible: boolean;
  isSignUpPasswordVisible: boolean;
  onSignInFieldChange: (field: keyof SignInFormValues, value: string) => void;
  onSignUpFieldChange: (field: keyof SignUpFormValues, value: string | boolean) => void;
  onToggleSignInPasswordVisibility: () => void;
  onToggleSignUpPasswordVisibility: () => void;
  onPrimaryActionPress: () => void;
};

export function AuthCredentialsSection({
  isSignUp,
  isSubmitting,
  feedback,
  signInValues,
  signUpValues,
  isSignInPasswordVisible,
  isSignUpPasswordVisible,
  onSignInFieldChange,
  onSignUpFieldChange,
  onToggleSignInPasswordVisibility,
  onToggleSignUpPasswordVisibility,
  onPrimaryActionPress,
}: AuthCredentialsSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.formSection}>
      {isSignUp ? (
        <SignUpForm
          values={signUpValues}
          isPasswordVisible={isSignUpPasswordVisible}
          onFullNameChange={(value) => onSignUpFieldChange("fullName", value)}
          onEmailChange={(value) => onSignUpFieldChange("email", value)}
          onPasswordChange={(value) => onSignUpFieldChange("password", value)}
          onTogglePasswordVisibility={onToggleSignUpPasswordVisibility}
          onToggleAcceptedTerms={() =>
            onSignUpFieldChange("acceptedTerms", !signUpValues.acceptedTerms)
          }
        />
      ) : (
        <SignInForm
          values={signInValues}
          isPasswordVisible={isSignInPasswordVisible}
          onEmailChange={(value) => onSignInFieldChange("email", value)}
          onPasswordChange={(value) => onSignInFieldChange("password", value)}
          onTogglePasswordVisibility={onToggleSignInPasswordVisibility}
        />
      )}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
        onPress={onPrimaryActionPress}
        disabled={isSubmitting}
      >
        <AppText style={styles.primaryButtonText}>
          {isSubmitting
            ? isSignUp
              ? "Creating..."
              : "Logging in..."
            : isSignUp
              ? "Create Account"
              : "Login"}
        </AppText>
      </Pressable>

      {feedback.kind !== "idle" ? (
        <AuthFeedbackMessage kind={feedback.kind} message={feedback.message} />
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    formSection: {
      marginTop: 26,
    },
    primaryButton: {
      width: "100%",
      minHeight: 58,
      borderRadius: 16,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonDisabled: {
      opacity: 0.65,
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
  });
}
