import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  CircleCheck,
} from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout } from "@/shared/theme";
import { AppText, GoogleIcon } from "@/shared/ui";

import { AuthDivider } from "../components/AuthDivider";
import { AuthFeedbackMessage } from "../components/AuthFeedbackMessage";
import { OAuthButton } from "../components/OAuthButton";
import { SignInForm } from "../components/SignInForm";
import { SignUpForm } from "../components/SignUpForm";
import { useAuthScreenController } from "../hooks/useAuthScreenController";

export default function AuthScreen() {
  const {
    isSignInPasswordVisible,
    isSignUpPasswordVisible,
    isSignUp,
    isSubmitting,
    feedback,
    setSignInField,
    setSignUpField,
    setIsSignInPasswordVisible,
    setIsSignUpPasswordVisible,
    handlePrimaryActionPress,
    handleGoogleOAuthPress,
    signInValues,
    signUpValues,
    switchToSignIn,
    switchToSignUp,
  } = useAuthScreenController();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.panel, isSignUp && styles.signUpPanel]}>
              {isSignUp ? (
                <>
                  <View style={styles.signUpHeader}>
                    <Pressable
                      style={styles.headerBackButton}
                      onPress={switchToSignIn}
                    >
                      <ArrowLeft size={30} color={colors.textPrimary} strokeWidth={2.2} />
                    </Pressable>
                    <AppText style={styles.signUpHeaderText}>Create Account</AppText>
                  </View>

                  <View style={styles.signUpIntro}>
                    <AppText style={styles.signUpTitle}>Start Your Habit Journey</AppText>
                    <AppText style={styles.signUpSubtitle}>
                      Join thousands of others building better lives, one habit at a
                      time.
                    </AppText>
                  </View>
                </>
              ) : (
                <View style={styles.signInIntro}>
                  <View style={styles.signInBadge}>
                    <CircleCheck size={34} color={colors.accentText} strokeWidth={2.2} />
                  </View>

                  <AppText style={styles.signInTitle}>Welcome back</AppText>
                  <AppText style={styles.signInSubtitle}>
                    Log in to continue your streak
                  </AppText>
                </View>
              )}

              <View style={styles.formSection}>
                {isSignUp ? (
                  <SignUpForm
                    values={signUpValues}
                    isPasswordVisible={isSignUpPasswordVisible}
                    onFullNameChange={(value) => setSignUpField("fullName", value)}
                    onEmailChange={(value) => setSignUpField("email", value)}
                    onPasswordChange={(value) => setSignUpField("password", value)}
                    onTogglePasswordVisibility={() =>
                      setIsSignUpPasswordVisible((value) => !value)
                    }
                    onToggleAcceptedTerms={() =>
                      setSignUpField("acceptedTerms", !signUpValues.acceptedTerms)
                    }
                  />
                ) : (
                  <SignInForm
                    values={signInValues}
                    isPasswordVisible={isSignInPasswordVisible}
                    onEmailChange={(value) => setSignInField("email", value)}
                    onPasswordChange={(value) => setSignInField("password", value)}
                    onTogglePasswordVisibility={() =>
                      setIsSignInPasswordVisible((value) => !value)
                    }
                  />
                )}

                <Pressable
                  style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                  onPress={handlePrimaryActionPress}
                  disabled={isSubmitting}
                >
                  <AppText style={styles.primaryButtonText}>
                    {isSubmitting
                      ? isSignUp
                        ? "Creating..."
                        : "Logging in..."
                      : isSignUp
                        ? "Create Account"
                        : "Login"}
                  </AppText>
                </Pressable>

                {feedback.kind !== "idle" ? (
                  <AuthFeedbackMessage kind={feedback.kind} message={feedback.message} />
                ) : null}
              </View>

              <AuthDivider label="OR CONTINUE WITH" />

              <View style={styles.oauthRow}>
                <OAuthButton
                  label="Google"
                  icon={<GoogleIcon size={20} />}
                  onPress={handleGoogleOAuthPress}
                  disabled={isSubmitting}
                />
              </View>

              {isSignUp ? (
                <View style={styles.authSwitchRow}>
                  <AppText style={styles.authSwitchText}>Already have an account?</AppText>
                  <Pressable onPress={switchToSignIn}>
                    <AppText style={styles.authSwitchStrongAction}>Log In</AppText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.authSwitchRow}>
                  <AppText style={styles.authSwitchText}>
                    Don&apos;t have an account?
                  </AppText>
                  <Pressable onPress={switchToSignUp}>
                    <AppText style={styles.authSwitchAccentAction}>Sign up for free</AppText>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 8,
    paddingBottom: 24,
  },
  panel: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
  signUpPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
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
  formSection: {
    marginTop: 26,
  },
  primaryButton: {
    width: "100%",
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
  },
  oauthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
