import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthScreen } from "@features/auth";
import { useAuthSession } from "@/shared/auth";
import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import StatsScreen from "./StatsScreen";

export default function StatsGateScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { isLoading, user } = useAuthSession();

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <StatsScreen user={user} />;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loaderWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
}
