import { CirclePlus } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type HabitEmptyStateProps = {
  onCreatePress: () => void;
};

export function HabitEmptyState({ onCreatePress }: HabitEmptyStateProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <CirclePlus size={30} color={colors.accentText} strokeWidth={2.2} />
      </View>
      <AppText style={styles.title}>Start your first habit</AppText>
      <AppText style={styles.subtitle}>
        Build momentum with one meaningful action today. You can add helpful or
        harmful habits and track both with streaks and heatmap.
      </AppText>

      <Pressable style={styles.ctaButton} onPress={onCreatePress}>
        <AppText style={styles.ctaButtonText}>Create habit</AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 18,
      alignItems: "center",
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 5,
    },
    iconWrap: {
      width: 62,
      height: 62,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 12,
      color: colors.textPrimary,
      fontSize: 26,
      lineHeight: 32,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 10,
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
    ctaButton: {
      marginTop: 16,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    ctaButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}
