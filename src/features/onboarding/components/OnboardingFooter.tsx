import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import type {
  OnboardingPrimaryAction,
  OnboardingSecondaryAction,
} from "../model/types";

import { PaginationDots } from "./PaginationDots";

type OnboardingFooterProps = {
  activeIndex: number;
  totalSlides: number;
  primaryAction: OnboardingPrimaryAction;
  secondaryAction?: OnboardingSecondaryAction;
  onPrimaryPress: () => void;
  onSecondaryActionPress: () => void;
};

export function OnboardingFooter({
  activeIndex,
  totalSlides,
  primaryAction,
  secondaryAction,
  onPrimaryPress,
  onSecondaryActionPress,
}: OnboardingFooterProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.bottomSection}>
      <Pressable
        style={styles.primaryButton}
        onPress={onPrimaryPress}
        testID="onboarding-primary-action-button"
      >
        <View style={styles.primaryButtonContent}>
          <AppText style={styles.primaryButtonText}>{primaryAction.label}</AppText>
          {primaryAction.showArrow && (
            <AppText style={styles.primaryButtonArrow}>{">"}</AppText>
          )}
        </View>
      </Pressable>

      <PaginationDots
        total={totalSlides}
        activeIndex={activeIndex}
        style={styles.dotsBelowButton}
      />

      {secondaryAction && (
        <Pressable
          style={styles.secondaryActionButton}
          onPress={onSecondaryActionPress}
          testID="onboarding-secondary-action-button"
        >
          <AppText style={styles.secondaryActionText}>{secondaryAction.label}</AppText>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bottomSection: {
      marginTop: 12,
      alignItems: "center",
    },
    dotsBelowButton: {
      marginTop: 16,
      marginBottom: 4,
    },
    primaryButton: {
      width: "100%",
      backgroundColor: colors.accentPrimary,
      borderRadius: 24,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 20,
      lineHeight: 28,
    },
    primaryButtonArrow: {
      color: colors.textPrimary,
      fontSize: 20,
      lineHeight: 28,
    },
    secondaryActionButton: {
      marginTop: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    secondaryActionText: {
      color: colors.textMuted,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}
