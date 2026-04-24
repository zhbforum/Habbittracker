import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type PublicProfilePageHeaderProps = {
  onBackPress: () => void;
};

export function PublicProfilePageHeader({ onBackPress }: PublicProfilePageHeaderProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.topRow}>
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2.2} />
      </Pressable>
      <AppText style={styles.topRowTitle}>Public profile</AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    topRowTitle: {
      color: colors.textPrimary,
      fontSize: 28,
      lineHeight: 34,
    },
    backButton: {
      width: 40,
      height: 40,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
