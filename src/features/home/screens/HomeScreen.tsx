import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@/features/home/components/HomeFooter";
import type { ThemeColors } from "@/shared/theme";
import { layout, useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import { useHomeScreenController } from "../hooks/useHomeScreenController";

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors);
  const { activeTab, handleTabPress, openHabits, openProfile, revisitOnboarding } =
    useHomeScreenController();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={styles.container}>
            <AppText style={styles.title}>Welcome back</AppText>
            <AppText style={styles.subtitle}>
              Your routine hub is ready. Add a new habit or review your current streaks.
            </AppText>

            <View style={styles.actionsWrap}>
              <Pressable
                style={styles.primaryButton}
                onPress={openHabits}
              >
                <AppText style={styles.primaryButtonText}>Open habits</AppText>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={openProfile}
              >
                <AppText style={styles.secondaryButtonText}>Open profile</AppText>
              </Pressable>
            </View>

            <Pressable
              style={styles.onboardingButton}
              onPress={revisitOnboarding}
            >
              <AppText style={styles.onboardingButtonText}>
                Revisit onboarding
              </AppText>
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
    },
    container: {
      flex: 1,
      width: "100%",
      maxWidth: layout.maxContentWidth,
      alignSelf: "center",
      paddingHorizontal: layout.horizontalPadding,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    title: {
      color: colors.textPrimary,
      fontSize: 36,
      lineHeight: 42,
    },
    subtitle: {
      marginTop: 10,
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      maxWidth: 340,
    },
    actionsWrap: {
      marginTop: 22,
      width: "100%",
      gap: 10,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    secondaryButton: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    onboardingButton: {
      marginTop: 16,
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    onboardingButtonText: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
