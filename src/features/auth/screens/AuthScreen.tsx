import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/theme";
import { GoogleIcon } from "@/shared/ui";

import { AuthCredentialsSection } from "../components/AuthCredentialsSection";
import { AuthDivider } from "../components/AuthDivider";
import { AuthHeroSection } from "../components/AuthHeroSection";
import { AuthModeSwitch } from "../components/AuthModeSwitch";
import { OAuthButton } from "../components/OAuthButton";
import { useAuthScreenController } from "../hooks/useAuthScreenController";
import { createAuthScreenStyles } from "./AuthScreen.styles";

export default function AuthScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = createAuthScreenStyles(colors);

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
      <StatusBar style={isDark ? "light" : "dark"} />
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
              <AuthHeroSection isSignUp={isSignUp} onBackToSignIn={switchToSignIn} />

              <AuthCredentialsSection
                isSignUp={isSignUp}
                isSubmitting={isSubmitting}
                feedback={feedback}
                signInValues={signInValues}
                signUpValues={signUpValues}
                isSignInPasswordVisible={isSignInPasswordVisible}
                isSignUpPasswordVisible={isSignUpPasswordVisible}
                onSignInFieldChange={setSignInField}
                onSignUpFieldChange={setSignUpField}
                onToggleSignInPasswordVisibility={() =>
                  setIsSignInPasswordVisible((value) => !value)
                }
                onToggleSignUpPasswordVisibility={() =>
                  setIsSignUpPasswordVisible((value) => !value)
                }
                onPrimaryActionPress={handlePrimaryActionPress}
              />

              <AuthDivider label="OR CONTINUE WITH" />

              <View style={styles.oauthRow}>
                <OAuthButton
                  label="Google"
                  icon={<GoogleIcon size={20} />}
                  onPress={handleGoogleOAuthPress}
                  disabled={isSubmitting}
                />
              </View>

              <AuthModeSwitch
                isSignUp={isSignUp}
                onSwitchToSignIn={switchToSignIn}
                onSwitchToSignUp={switchToSignUp}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
