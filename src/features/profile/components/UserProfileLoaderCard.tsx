import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type UserProfileLoaderCardProps = {
  isLoading: boolean;
  onRetry: () => void;
};

export function UserProfileLoaderCard({
  isLoading,
  onRetry,
}: UserProfileLoaderCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.loaderCard}>
      <AppText style={styles.loaderText}>
        {isLoading ? "Loading profile..." : "Profile is unavailable."}
      </AppText>
      <Pressable style={styles.reloadButton} onPress={onRetry}>
        <AppText style={styles.reloadButtonText}>Retry</AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loaderCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    loaderText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    reloadButton: {
      marginTop: 12,
      alignSelf: "flex-start",
      minHeight: 40,
      borderRadius: 10,
      backgroundColor: colors.accentPrimary,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    reloadButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
