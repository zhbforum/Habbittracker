import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import type { ThemeMode } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import { ProfileThemeMenuView } from "./ProfileThemeMenuView";
import { ProfileThemeOptionsView } from "./ProfileThemeOptionsView";
import { createProfileThemeSheetStyles } from "./ProfileThemeSheet.styles";

type ProfileThemeSheetProps = {
  isVisible: boolean;
  activeMode: ThemeMode;
  isSigningOut: boolean;
  onSelectMode: (mode: ThemeMode) => void;
  onSignOut: () => void;
  onClose: () => void;
};

export function ProfileThemeSheet({
  isVisible,
  activeMode,
  isSigningOut,
  onSelectMode,
  onSignOut,
  onClose,
}: ProfileThemeSheetProps) {
  const { colors } = useAppTheme();
  const styles = createProfileThemeSheetStyles(colors);
  const [activeView, setActiveView] = useState<"menu" | "theme">("menu");

  useEffect(() => {
    if (isVisible) {
      setActiveView("menu");
    }
  }, [isVisible]);

  const currentThemeLabel = activeMode === "dark" ? "Dark" : "Light";

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {activeView === "menu" ? (
            <ProfileThemeMenuView
              currentThemeLabel={currentThemeLabel}
              isSigningOut={isSigningOut}
              colors={colors}
              styles={styles}
              onOpenTheme={() => setActiveView("theme")}
              onSignOut={onSignOut}
            />
          ) : (
            <ProfileThemeOptionsView
              activeMode={activeMode}
              colors={colors}
              styles={styles}
              onBack={() => setActiveView("menu")}
              onSelectMode={onSelectMode}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
