import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

export default function AuthCallbackScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.textPrimary} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
}
