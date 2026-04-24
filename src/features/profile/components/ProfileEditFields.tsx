import { StyleSheet, TextInput, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
} from "../model/constants";
import type { ProfileFormValues } from "../model/types";

type ProfileEditFieldsProps = {
  values: ProfileFormValues;
  canChangeUsername: boolean;
  usernameChangeHint: string;
  onFieldChange: (field: keyof ProfileFormValues, value: string) => void;
};

export function ProfileEditFields({
  values,
  canChangeUsername,
  usernameChangeHint,
  onFieldChange,
}: ProfileEditFieldsProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <>
      <View>
        <AppText style={styles.fieldLabel}>Name</AppText>
        <TextInput
          value={values.name}
          onChangeText={(value) => onFieldChange("name", value)}
          placeholder="Alex"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={PROFILE_NAME_MAX_LENGTH}
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
        />
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Username</AppText>
        <TextInput
          value={values.username}
          onChangeText={(value) => onFieldChange("username", value)}
          placeholder="u_testing"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={PROFILE_USERNAME_MAX_LENGTH}
          style={[styles.input, !canChangeUsername && styles.inputDisabled]}
          placeholderTextColor={colors.textPlaceholder}
          editable={canChangeUsername}
        />
        <AppText style={styles.helperText}>{usernameChangeHint}</AppText>
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Bio</AppText>
        <TextInput
          value={values.bio}
          onChangeText={(value) => onFieldChange("bio", value)}
          placeholder="Tell us who you are building for."
          multiline
          maxLength={PROFILE_BIO_MAX_LENGTH}
          style={[styles.input, styles.bioInput]}
          placeholderTextColor={colors.textPlaceholder}
        />
        <AppText style={styles.counterText}>
          {values.bio.length}/{PROFILE_BIO_MAX_LENGTH}
        </AppText>
      </View>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    fieldLabel: {
      marginBottom: 8,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
      backgroundColor: colors.surfaceSecondary,
    },
    inputDisabled: {
      opacity: 0.6,
    },
    helperText: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    bioInput: {
      minHeight: 104,
      textAlignVertical: "top",
      paddingTop: 12,
    },
    counterText: {
      marginTop: 6,
      textAlign: "right",
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
