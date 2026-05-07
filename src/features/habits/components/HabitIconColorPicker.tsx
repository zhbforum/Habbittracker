import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import { HABIT_ICON_COLOR_OPTIONS } from "../model/icons";
import type { HabitIconColorId } from "../model/types";

type HabitIconColorPickerProps = {
  selectedColorId: HabitIconColorId;
  onSelectColor: (colorId: HabitIconColorId) => void;
};

export function HabitIconColorPicker({
  selectedColorId,
  onSelectColor,
}: HabitIconColorPickerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      {HABIT_ICON_COLOR_OPTIONS.map((colorOption) => {
        const isSelected = selectedColorId === colorOption.id;

        return (
          <Pressable
            key={colorOption.id}
            testID={`habit-icon-color-${colorOption.id}`}
            style={[styles.colorButton, isSelected && styles.colorButtonActive]}
            onPress={() => onSelectColor(colorOption.id)}
          >
            <View
              style={[styles.colorDot, { backgroundColor: colorOption.color }]}
            >
              {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={2.8} /> : null}
            </View>
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
      flexWrap: "wrap",
      gap: 10,
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    colorButtonActive: {
      borderColor: colors.textPrimary,
    },
    colorDot: {
      width: 28,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
