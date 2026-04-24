import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthModeSwitchProps = {
  isSignUp: boolean;
  onSwitchToSignIn: () => void;
  onSwitchToSignUp: () => void;
};

export function AuthModeSwitch({
  isSignUp,
  onSwitchToSignIn,
  onSwitchToSignUp,
}: AuthModeSwitchProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (isSignUp) {
    return (
      <View style={styles.authSwitchRow}>
        <AppText style={styles.authSwitchText}>Already have an account?</AppText>
        <Pressable onPress={onSwitchToSignIn}>
          <AppText style={styles.authSwitchStrongAction}>Log In</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.authSwitchRow}>
      <AppText style={styles.authSwitchText}>Don&apos;t have an account?</AppText>
      <Pressable onPress={onSwitchToSignUp}>
        <AppText style={styles.authSwitchAccentAction}>Sign up for free</AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    authSwitchRow: {
      marginTop: 18,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    authSwitchText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    authSwitchAccentAction: {
      color: colors.accentText,
      fontSize: 16,
      lineHeight: 22,
    },
    authSwitchStrongAction: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
  });
}
