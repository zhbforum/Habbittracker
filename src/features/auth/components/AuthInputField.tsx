import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors, typography } from "@/shared/theme";
import { AppText } from "@/shared/ui";

const PASSWORD_MASK_SYMBOL = "\u2022";

type AuthInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  leftIcon?: LucideIcon;
  rightAccessory?: ReactNode;
  labelActionText?: string;
  onLabelActionPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
};

export function AuthInputField({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon: LeftIcon,
  rightAccessory,
  labelActionText,
  onLabelActionPress,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  textContentType,
}: AuthInputFieldProps) {
  const isPasswordMasked = secureTextEntry === true;
  const maskedValue = PASSWORD_MASK_SYMBOL.repeat(value.length);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <AppText style={styles.label}>{label}</AppText>

        {labelActionText ? (
          <Pressable
            onPress={onLabelActionPress}
            disabled={!onLabelActionPress}
            hitSlop={8}
          >
            <AppText style={styles.labelActionText}>{labelActionText}</AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        {LeftIcon ? (
          <LeftIcon size={22} color={colors.textPlaceholder} strokeWidth={2} />
        ) : null}

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, isPasswordMasked && styles.hiddenInput]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry={false}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            textContentType={textContentType}
            contextMenuHidden={isPasswordMasked}
            spellCheck={false}
            autoCorrect={false}
            cursorColor={colors.textPrimary}
          />

          {isPasswordMasked ? (
            <View pointerEvents="none" style={styles.maskedOverlay}>
              {value.length > 0 ? (
                <AppText style={styles.maskedText}>{maskedValue}</AppText>
              ) : (
                <AppText style={styles.placeholderOverlayText}>{placeholder}</AppText>
              )}
            </View>
          ) : null}
        </View>

        {rightAccessory ? (
          <View style={styles.rightAccessory}>{rightAccessory}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 16,
  },
  labelRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  labelActionText: {
    color: colors.accentText,
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
    paddingVertical: 8,
    includeFontPadding: false,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  hiddenInput: {
    opacity: 0,
  },
  maskedOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
  },
  maskedText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
    paddingVertical: 8,
    includeFontPadding: false,
  },
  placeholderOverlayText: {
    color: colors.textPlaceholder,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
    paddingVertical: 8,
    includeFontPadding: false,
  },
  rightAccessory: {
    marginLeft: 8,
  },
});
