import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type OAuthButtonProps = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
};

export function OAuthButton({ label, icon, disabled, onPress }: OAuthButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <AppText style={styles.label}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
