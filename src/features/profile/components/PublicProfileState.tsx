import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type PublicProfileStateProps = {
  isLoading: boolean;
  errorMessage: string | null;
  isNotFound: boolean;
};

export function PublicProfileState({
  isLoading,
  errorMessage,
  isNotFound,
}: PublicProfileStateProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (isLoading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
        <AppText style={styles.helperText}>Loading profile...</AppText>
      </View>
    );
  }

  if (!errorMessage && !isNotFound) {
    return null;
  }

  return (
    <View style={styles.errorBanner}>
      <AppText style={styles.errorText}>{errorMessage ?? "User not found."}</AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    centerWrap: {
      marginTop: 26,
      alignItems: "center",
      gap: 10,
    },
    helperText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    errorBanner: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
