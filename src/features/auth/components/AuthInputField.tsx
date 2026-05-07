import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { typography, useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  inputTestID?: string;
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
  inputTestID,
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
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          testID={inputTestID}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          contextMenuHidden={secureTextEntry === true}
          spellCheck={false}
          autoCorrect={false}
          cursorColor={colors.textPrimary}
        />

        {rightAccessory ? (
          <View style={styles.rightAccessory}>{rightAccessory}</View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    rightAccessory: {
      marginLeft: 8,
    },
  });
}
