import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

export function HabitsPageHeader() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.headerWrap}>
      <AppText style={styles.pageTitle}>Habits</AppText>
      <AppText style={styles.pageSubtitle}>
        Build your routine, break harmful patterns, and track progress with streaks and
        heatmap.
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    headerWrap: {
      gap: 8,
    },
    pageTitle: {
      color: colors.textPrimary,
      fontSize: 36,
      lineHeight: 42,
    },
    pageSubtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 340,
    },
  });
}
