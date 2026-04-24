import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { HabitKind } from "../model/types";

type HabitTypeBadgeProps = {
  kind: HabitKind;
};

export function HabitTypeBadge({ kind }: HabitTypeBadgeProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const isPositive = kind === "positive";

  return (
    <View
      style={[styles.badge, isPositive ? styles.positiveBadge : styles.negativeBadge]}
    >
      <AppText
        style={[
          styles.badgeText,
          isPositive ? styles.positiveText : styles.negativeText,
        ]}
      >
        {isPositive ? "Helpful" : "Harmful"}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      minHeight: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    positiveBadge: {
      backgroundColor: colors.successSurface,
      borderColor: colors.successBorder,
    },
    negativeBadge: {
      backgroundColor: colors.errorSurface,
      borderColor: colors.errorBorder,
    },
    badgeText: {
      fontSize: 12,
      lineHeight: 16,
    },
    positiveText: {
      color: colors.successText,
    },
    negativeText: {
      color: colors.errorText,
    },
  });
}
