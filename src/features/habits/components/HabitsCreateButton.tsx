import { CirclePlus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { layout, useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type HabitsCreateButtonProps = {
  onPress: () => void;
};

export function HabitsCreateButton({ onPress }: HabitsCreateButtonProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={styles.floatingButton} onPress={onPress}>
      <CirclePlus size={22} color={colors.textPrimary} strokeWidth={2.4} />
      <AppText style={styles.floatingButtonText}>New habit</AppText>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    floatingButton: {
      position: "absolute",
      right: layout.horizontalPadding,
      bottom: 18,
      minHeight: 52,
      borderRadius: 15,
      backgroundColor: colors.accentPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.24,
      shadowRadius: 14,
      elevation: 8,
    },
    floatingButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
