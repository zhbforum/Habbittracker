import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typography } from "@/shared/theme";
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
  return (
    <View style={styles.bottomSection}>
      <Pressable style={styles.primaryButton} onPress={onPrimaryPress}>
        <View style={styles.primaryButtonContent}>
          <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
          {primaryAction.showArrow && (
            <Text style={styles.primaryButtonArrow}>{">"}</Text>
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
        >
          <Text style={styles.secondaryActionText}>{secondaryAction.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
  },
  primaryButtonArrow: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
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
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
  },
});
