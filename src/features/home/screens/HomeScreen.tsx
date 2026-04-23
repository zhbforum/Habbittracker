import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter, type HomeTabId } from "@/features/home/components/HomeFooter";
import { routes } from "@/shared/navigation/routes";
import { colors, layout } from "@/shared/theme";
import { AppText } from "@/shared/ui";

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HomeTabId>("home");

  const handleTabPress = (tabId: HomeTabId) => {
    if (tabId === "profile") {
      router.push(routes.profile);
      return;
    }

    setActiveTab(tabId);
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <View style={styles.container}>
            <AppText style={styles.title}>Main screen</AppText>
            <AppText style={styles.subtitle}>
              Onboarding is completed. Your app flow now works with Skip and Start
              tracking.
            </AppText>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.replace(routes.onboarding)}
            >
              <AppText style={styles.secondaryButtonText}>
                Open onboarding again
              </AppText>
            </Pressable>
          </View>
        </View>
        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.horizontalPadding,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    lineHeight: 42,
  },
  subtitle: {
    marginTop: 16,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  secondaryButton: {
    marginTop: 32,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
