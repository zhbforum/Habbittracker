import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Check, ChevronLeft, ChevronRight } from "lucide-react-native";

import type { ThemeColors, ThemeMode } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

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
  const styles = createStyles(colors);
  const [activeView, setActiveView] = useState<"menu" | "theme">("menu");

  const themeOptions: { id: ThemeMode; label: string; caption: string }[] = [
    {
      id: "light",
      label: "Light Theme",
      caption: "Soft, bright, and minimal.",
    },
    {
      id: "dark",
      label: "Dark Theme",
      caption: "High-contrast mode for night focus.",
    },
  ];

  useEffect(() => {
    if (isVisible) {
      setActiveView("menu");
    }
  }, [isVisible]);

  const currentThemeLabel = activeMode === "dark" ? "Dark" : "Light";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {activeView === "menu" ? (
            <>
              <AppText style={styles.title}>Settings</AppText>

              <View style={styles.menuSection}>
                <Pressable
                  style={styles.menuRow}
                  onPress={() => setActiveView("theme")}
                >
                  <View style={styles.menuRowTextWrap}>
                    <AppText style={styles.menuRowTitle}>Theme</AppText>
                    <AppText style={styles.menuRowCaption}>
                      {currentThemeLabel}
                    </AppText>
                  </View>

                  <ChevronRight
                    size={20}
                    color={colors.textSecondary}
                    strokeWidth={2.2}
                  />
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
          ) : (
            <>
              <View style={styles.headerRow}>
                <Pressable
                  style={styles.backButton}
                  onPress={() => setActiveView("menu")}
                >
                  <ChevronLeft
                    size={18}
                    color={colors.textPrimary}
                    strokeWidth={2.4}
                  />
                </Pressable>
                <AppText style={styles.title}>Theme</AppText>
              </View>

              <AppText style={styles.sectionTitle}>Choose appearance</AppText>
              <View style={styles.optionsList}>
                {themeOptions.map((option) => {
                  const isActive = option.id === activeMode;

                  return (
                    <Pressable
                      key={option.id}
                      style={[styles.optionCard, isActive && styles.optionCardActive]}
                      onPress={() => onSelectMode(option.id)}
                    >
                      <View style={styles.optionTextWrap}>
                        <AppText style={styles.optionTitle}>{option.label}</AppText>
                        <AppText style={styles.optionCaption}>{option.caption}</AppText>
                      </View>

                      {isActive ? (
                        <Check
                          size={20}
                          color={colors.accentText}
                          strokeWidth={2.4}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(8, 14, 28, 0.46)",
      paddingHorizontal: 20,
    },
    sheet: {
      width: "100%",
      maxWidth: 440,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    menuSection: {
      marginTop: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      overflow: "hidden",
    },
    menuRow: {
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    menuRowTextWrap: {
      flex: 1,
    },
    menuRowTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    menuRowCaption: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionTitle: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    optionsList: {
      marginTop: 10,
      gap: 10,
    },
    optionCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    optionCardActive: {
      borderColor: colors.accentText,
    },
    optionTextWrap: {
      flex: 1,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    optionCaption: {
      marginTop: 4,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    signOutButton: {
      marginTop: 18,
      borderRadius: 12,
      backgroundColor: "#C54D4D",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    signOutButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 22,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}
