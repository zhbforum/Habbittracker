import { Check, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { AuthInputField } from "./AuthInputField";
import type { SignUpFormValues } from "../model/types";

type SignUpFormProps = {
  values: SignUpFormValues;
  isPasswordVisible: boolean;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onToggleAcceptedTerms: () => void;
};

export function SignUpForm({
  values,
  isPasswordVisible,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePasswordVisibility,
  onToggleAcceptedTerms,
}: SignUpFormProps) {
  const passwordRightAccessory = (
    <Pressable
      style={styles.inputIconButton}
      onPress={onTogglePasswordVisibility}
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
        label="Full Name"
        value={values.fullName}
        onChangeText={onFullNameChange}
        placeholder="Enter your full name"
        leftIcon={UserRound}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />

      <AuthInputField
        label="Email Address"
        value={values.email}
        onChangeText={onEmailChange}
        placeholder="example@email.com"
        leftIcon={Mail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      <AuthInputField
        label="Password"
        value={values.password}
        onChangeText={onPasswordChange}
        placeholder="Min. 8 characters"
        leftIcon={Lock}
        secureTextEntry={!isPasswordVisible}
        autoComplete="new-password"
        textContentType="newPassword"
        rightAccessory={passwordRightAccessory}
      />

      <Pressable style={styles.termsRow} onPress={onToggleAcceptedTerms}>
        <View
          style={[styles.termsCheckbox, values.acceptedTerms && styles.termsCheckboxActive]}
        >
          {values.acceptedTerms ? (
            <Check size={16} color={colors.textPrimary} strokeWidth={2.8} />
          ) : null}
        </View>

        <AppText style={styles.termsText}>
          I agree to the <AppText style={styles.termsLinkText}>Terms of Service</AppText>{" "}
          and <AppText style={styles.termsLinkText}>Privacy Policy</AppText>.
        </AppText>
      </Pressable>
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
  termsRow: {
    marginTop: 2,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  termsCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  termsCheckboxActive: {
    borderColor: colors.accentText,
    backgroundColor: colors.accentSecondary,
  },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  termsLinkText: {
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
});
