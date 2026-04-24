import { ArrowLeft, CircleCheck } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthHeroSectionProps = {
  isSignUp: boolean;
  onBackToSignIn: () => void;
};

export function AuthHeroSection({ isSignUp, onBackToSignIn }: AuthHeroSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (isSignUp) {
    return (
      <>
        <View style={styles.signUpHeader}>
          <Pressable style={styles.headerBackButton} onPress={onBackToSignIn}>
            <ArrowLeft size={30} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <AppText style={styles.signUpHeaderText}>Create Account</AppText>
        </View>

        <View style={styles.signUpIntro}>
          <AppText style={styles.signUpTitle}>Start Your Habit Journey</AppText>
          <AppText style={styles.signUpSubtitle}>
            Join thousands of others building better lives, one habit at a time.
          </AppText>
        </View>
      </>
    );
  }

  return (
    <View style={styles.signInIntro}>
      <View style={styles.signInBadge}>
        <CircleCheck size={34} color={colors.accentText} strokeWidth={2.2} />
      </View>

      <AppText style={styles.signInTitle}>Welcome back</AppText>
      <AppText style={styles.signInSubtitle}>Log in to continue your streak</AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    signUpHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 44,
    },
    headerBackButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    signUpHeaderText: {
      color: colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
    signUpIntro: {
      marginTop: 28,
      marginBottom: 24,
    },
    signUpTitle: {
      color: colors.textPrimary,
      fontSize: 44,
      lineHeight: 50,
      letterSpacing: -0.4,
    },
    signUpSubtitle: {
      marginTop: 12,
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
    },
    signInIntro: {
      marginTop: 36,
      alignItems: "center",
    },
    signInBadge: {
      width: 88,
      height: 88,
      borderRadius: 20,
      backgroundColor: colors.accentSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    signInTitle: {
      marginTop: 26,
      color: colors.textPrimary,
      textAlign: "center",
      fontSize: 44,
      lineHeight: 50,
      letterSpacing: -0.4,
    },
    signInSubtitle: {
      marginTop: 10,
      color: colors.textSecondary,
      textAlign: "center",
      fontSize: 16,
      lineHeight: 24,
    },
  });
}
