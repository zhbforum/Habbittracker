import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import OnboardingScreen from "@/features/onboarding/screens/OnboardingScreen";
import { useIndexScreenController } from "@/features/root/hooks/useIndexScreenController";
import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

export default function IndexScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { isLoading, shouldShowOnboarding, redirectRoute } = useIndexScreenController();

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
      </View>
    );
  }

  if (redirectRoute) {
    return <Redirect href={redirectRoute} />;
  }

  if (shouldShowOnboarding) {
    return <OnboardingScreen />;
  }

  return null;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loaderWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
}
