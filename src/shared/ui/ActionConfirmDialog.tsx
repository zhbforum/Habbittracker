import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import { AppText } from "./AppText";

type ActionConfirmDialogProps = {
  isVisible: boolean;
  title: string;
  message: string;
  icon?: ReactNode;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmTone?: "default" | "danger";
};

export function ActionConfirmDialog({
  isVisible,
  title,
  message,
  icon,
  confirmLabel,
  confirmLoadingLabel,
  isConfirming = false,
  onCancel,
  onConfirm,
  confirmTone = "danger",
}: ActionConfirmDialogProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const confirmButtonStyle =
    confirmTone === "danger" ? styles.dangerButton : styles.defaultButton;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={styles.card}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}

          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.message}>{message}</AppText>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.secondaryButton, isConfirming && styles.buttonDisabled]}
              onPress={onCancel}
              disabled={isConfirming}
            >
              <AppText style={styles.secondaryButtonText}>Cancel</AppText>
            </Pressable>

            <Pressable
              style={[confirmButtonStyle, isConfirming && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={isConfirming}
            >
              <AppText style={styles.primaryButtonText}>
                {isConfirming
                  ? (confirmLoadingLabel ?? `${confirmLabel}...`)
                  : confirmLabel}
              </AppText>
            </Pressable>
          </View>
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
    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      shadowColor: colors.cardShadow,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 9,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 10,
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    message: {
      marginTop: 8,
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    actionsRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },
    secondaryButton: {
      minWidth: 86,
      minHeight: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textTransform: "uppercase",
    },
    dangerButton: {
      minWidth: 96,
      minHeight: 42,
      borderRadius: 10,
      backgroundColor: "#C54D4D",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    defaultButton: {
      minWidth: 96,
      minHeight: 42,
      borderRadius: 10,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      lineHeight: 20,
      textTransform: "uppercase",
    },
    buttonDisabled: {
      opacity: 0.65,
    },
  });
}
