import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import type { OnboardingBackButtonVariant } from "../model/types";

type OnboardingTopBarProps = {
  showSkip: boolean;
  backButtonVariant: OnboardingBackButtonVariant;
  onBackPress: () => void;
  onSkipPress: () => void;
};

export function OnboardingTopBar({
  showSkip,
  backButtonVariant,
  onBackPress,
  onSkipPress,
}: OnboardingTopBarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const isBackButtonHidden = backButtonVariant === "hidden";
  const isBackButtonPlain = backButtonVariant === "plain";

  return (
    <View style={styles.topBar}>
      {isBackButtonHidden ? (
        <View style={styles.topBarSpacer} />
      ) : (
        <Pressable
          style={[styles.backButton, isBackButtonPlain && styles.backButtonPlain]}
          onPress={onBackPress}
          testID="onboarding-back-button"
        >
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>
      )}

      <View style={styles.topBarTitleSpacer} />

      {showSkip ? (
        <Pressable
          style={styles.skipButton}
          onPress={onSkipPress}
          testID="onboarding-skip-button"
        >
          <AppText style={styles.skipText}>Skip</AppText>
        </Pressable>
      ) : (
        <View style={styles.topBarSpacer} />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    topBar: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    topBarSpacer: {
      width: 44,
      height: 44,
    },
    topBarTitleSpacer: {
      flex: 1,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accentSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonPlain: {
      width: 44,
      height: 44,
      borderRadius: 0,
      backgroundColor: "transparent",
    },
    skipButton: {
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    skipText: {
      color: colors.textMuted,
      fontSize: 18,
    },
  });
}
