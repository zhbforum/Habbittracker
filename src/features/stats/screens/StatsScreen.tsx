import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@/features/home/components/HomeFooter";
import type { ThemeColors } from "@/shared/theme";
import { layout, useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import { useStatsScreenController } from "../hooks/useStatsScreenController";

export default function StatsScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors);
  const { activeTab, handleTabPress, openHabits } = useStatsScreenController();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={styles.card}>
            <AppText style={styles.title}>Stats</AppText>
            <AppText style={styles.subtitle}>
              Weekly performance and heatmap are available inside each habit card.
              A dedicated global analytics dashboard is the next step.
            </AppText>

            <Pressable
              style={styles.button}
              onPress={openHabits}
            >
              <AppText style={styles.buttonText}>Open habits</AppText>
            </Pressable>
          </View>
        </View>
        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: layout.horizontalPadding,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: "100%",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 18,
      gap: 10,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 34,
      lineHeight: 40,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    button: {
      marginTop: 6,
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
