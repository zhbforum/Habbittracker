import { Settings2 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type UserProfilePageHeaderProps = {
  title: string;
  onOpenSettings: () => void;
};

export function UserProfilePageHeader({
  title,
  onOpenSettings,
}: UserProfilePageHeaderProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.pageHeader}>
      <View>
        <AppText style={styles.pageTitle}>{title}</AppText>
        <AppText style={styles.pageSubtitle}>
          Build identity, track consistency, and tune your app experience.
        </AppText>
      </View>

      <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
        <Settings2 size={20} color={colors.textPrimary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pageHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
    },
    pageTitle: {
      color: colors.textPrimary,
      fontSize: 36,
      lineHeight: 42,
    },
    pageSubtitle: {
      marginTop: 8,
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 320,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
