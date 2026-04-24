import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthSession } from "@/shared/auth";
import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import AuthScreen from "@/features/auth/screens/AuthScreen";

import { UserProfileScreen } from "./UserProfileScreen";

export default function ProfileGateScreen() {
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

  return <UserProfileScreen user={user} />;
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

