import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout } from "@/shared/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Main screen</Text>
          <Text style={styles.subtitle}>
            Onboarding is completed. Your app flow now works with Skip and Start
            tracking.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.secondaryButtonText}>Open onboarding again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: "700",
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
    fontWeight: "600",
  },
});
