import { Eye, EyeOff } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { AuthInputField } from "./AuthInputField";
import type { SignInFormValues } from "../model/types";

type SignInFormProps = {
  values: SignInFormValues;
  isPasswordVisible: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
};

export function SignInForm({
  values,
  isPasswordVisible,
  onEmailChange,
  onPasswordChange,
  onTogglePasswordVisibility,
}: SignInFormProps) {
  const { colors } = useAppTheme();

  const passwordRightAccessory = (
    <Pressable
      style={styles.inputIconButton}
      onPress={onTogglePasswordVisibility}
      accessibilityRole="button"
      accessibilityLabel={
        isPasswordVisible ? "Hide sign in password" : "Show sign in password"
      }
      testID="auth-sign-in-password-visibility-button"
      hitSlop={8}
    >
      {isPasswordVisible ? (
        <EyeOff size={24} color={colors.textPlaceholder} strokeWidth={2} />
      ) : (
        <Eye size={24} color={colors.textPlaceholder} strokeWidth={2} />
      )}
    </Pressable>
  );

  return (
    <>
      <AuthInputField
        label="Email"
        value={values.email}
        onChangeText={onEmailChange}
        placeholder="name@example.com"
        inputTestID="auth-sign-in-email-input"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <AuthInputField
        label="Password"
        value={values.password}
        onChangeText={onPasswordChange}
        placeholder="Enter your password"
        inputTestID="auth-sign-in-password-input"
        secureTextEntry={!isPasswordVisible}
        autoComplete="current-password"
        textContentType="password"
        labelActionText="Forgot Password?"
        rightAccessory={passwordRightAccessory}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputIconButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
