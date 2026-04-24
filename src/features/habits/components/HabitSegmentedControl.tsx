import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

export type HabitSegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type HabitSegmentedControlProps<T extends string> = {
  options: readonly HabitSegmentedControlOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  size?: "default" | "compact";
};

export function HabitSegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
  size = "default",
}: HabitSegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const isCompact = size === "compact";

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.button,
              isCompact && styles.buttonCompact,
              isSelected && styles.buttonActive,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <AppText
              style={[
                styles.buttonText,
                isCompact && styles.buttonTextCompact,
                isSelected && styles.buttonTextActive,
              ]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    button: {
      flex: 1,
      minHeight: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    buttonCompact: {
      minHeight: 38,
      paddingHorizontal: 4,
    },
    buttonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    buttonText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
    buttonTextCompact: {
      fontSize: 12,
      lineHeight: 16,
    },
    buttonTextActive: {
      color: colors.textPrimary,
    },
  });
}
