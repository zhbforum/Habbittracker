import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typography } from "@/shared/theme";
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
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      )}

      <View style={styles.topBarTitleSpacer} />

      {showSkip ? (
        <Pressable style={styles.skipButton} onPress={onSkipPress}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      ) : (
        <View style={styles.topBarSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
  },
});
