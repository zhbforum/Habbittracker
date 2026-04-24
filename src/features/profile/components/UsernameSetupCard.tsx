import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { PROFILE_USERNAME_MAX_LENGTH } from "../model/constants";
import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type UsernameSetupCardProps = {
  value: string;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function UsernameSetupCard({
  value,
  isSaving,
  onChange,
  onSubmit,
}: UsernameSetupCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Choose your username</AppText>
      <AppText style={styles.subtitle}>
        This handle becomes your profile link and identity inside the app.
      </AppText>

      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={PROFILE_USERNAME_MAX_LENGTH}
        placeholder="e.g. habit_builder"
        placeholderTextColor={colors.textPlaceholder}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSaving}
      >
        <AppText style={styles.buttonText}>
          {isSaving ? "Saving..." : "Save Username"}
        </AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      paddingVertical: 20,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 30,
      lineHeight: 36,
    },
    subtitle: {
      marginTop: 10,
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    input: {
      marginTop: 18,
      minHeight: 54,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      lineHeight: 22,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSecondary,
    },
    button: {
      marginTop: 14,
      minHeight: 54,
      borderRadius: 14,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}

