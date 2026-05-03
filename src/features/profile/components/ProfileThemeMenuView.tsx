import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { ProfileThemeSheetStyles } from "./ProfileThemeSheet.styles";

type ProfileThemeMenuViewProps = {
  currentThemeLabel: string;
  isSigningOut: boolean;
  colors: ThemeColors;
  styles: ProfileThemeSheetStyles;
  onOpenTheme: () => void;
  onSignOut: () => void;
};

export function ProfileThemeMenuView({
  currentThemeLabel,
  isSigningOut,
  colors,
  styles,
  onOpenTheme,
  onSignOut,
}: ProfileThemeMenuViewProps) {
  return (
    <>
      <AppText style={styles.title}>Settings</AppText>

      <View style={styles.menuSection}>
        <Pressable style={styles.menuRow} onPress={onOpenTheme}>
          <View style={styles.menuRowTextWrap}>
            <AppText style={styles.menuRowTitle}>Theme</AppText>
            <AppText style={styles.menuRowCaption}>{currentThemeLabel}</AppText>
          </View>

          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]}
        onPress={onSignOut}
        disabled={isSigningOut}
      >
        <AppText style={styles.signOutButtonText}>
          {isSigningOut ? "Signing out..." : "Sign out"}
        </AppText>
      </Pressable>
    </>
  );
}
