import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import { HABIT_ICON_OPTIONS, getHabitIconColorById } from "../model/icons";
import type { HabitIconColorId, HabitIconId } from "../model/types";

type HabitIconPickerProps = {
  selectedIconId: HabitIconId;
  selectedIconColorId: HabitIconColorId;
  onSelectIcon: (iconId: HabitIconId) => void;
};

export function HabitIconPicker({
  selectedIconId,
  selectedIconColorId,
  onSelectIcon,
}: HabitIconPickerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const selectedIconColor = getHabitIconColorById(selectedIconColorId);

  return (
    <View style={styles.grid}>
      {HABIT_ICON_OPTIONS.map((option) => {
        const isSelected = option.id === selectedIconId;
        const Icon = option.Icon;

        return (
          <Pressable
            key={option.id}
            style={[styles.iconButton, isSelected && styles.iconButtonActive]}
            onPress={() => onSelectIcon(option.id)}
          >
            <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
              <Icon
                size={24}
                color={isSelected ? selectedIconColor : colors.textPrimary}
                strokeWidth={2.2}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    iconButton: {
      width: 58,
      height: 58,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    iconCircleActive: {
      borderColor: colors.accentText,
    },
  });
}
