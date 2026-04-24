import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Toast, { BaseToast } from "react-native-toast-message";
import type { ToastConfig, ToastShowParams } from "react-native-toast-message";

import type { ThemeColors } from "@/shared/theme";
import { typography, useAppTheme } from "@/shared/theme";

const TOAST_TOP_OFFSET = 52;
const TOAST_SUCCESS_VISIBILITY_MS = 2400;
const TOAST_ERROR_VISIBILITY_MS = 3200;

type AppToastPayload = {
  title: string;
  message?: string;
  visibilityTime?: number;
};

function createToastConfig(colors: ThemeColors): ToastConfig {
  return {
    success: (props) => (
      <BaseToast
        {...props}
        style={[
          styles.toastContainer,
          {
            borderColor: colors.successBorder,
            borderLeftColor: colors.successText,
            backgroundColor: colors.surface,
            shadowColor: colors.cardShadow,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.titleText, { color: colors.textPrimary }]}
        text2Style={[styles.messageText, { color: colors.textSecondary }]}
        text2NumberOfLines={3}
      />
    ),
    error: (props) => (
      <BaseToast
        {...props}
        style={[
          styles.toastContainer,
          {
            borderColor: colors.errorBorder,
            borderLeftColor: colors.errorText,
            backgroundColor: colors.surface,
            shadowColor: colors.cardShadow,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.titleText, { color: colors.textPrimary }]}
        text2Style={[styles.messageText, { color: colors.textSecondary }]}
        text2NumberOfLines={3}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={[
          styles.toastContainer,
          {
            borderColor: colors.border,
            borderLeftColor: colors.accentText,
            backgroundColor: colors.surface,
            shadowColor: colors.cardShadow,
          },
        ]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.titleText, { color: colors.textPrimary }]}
        text2Style={[styles.messageText, { color: colors.textSecondary }]}
        text2NumberOfLines={3}
      />
    ),
  };
}

function showToast(
  type: "success" | "error" | "info",
  { title, message, visibilityTime }: AppToastPayload,
) {
  const toastParams: ToastShowParams = {
    type,
    position: "top",
    autoHide: true,
    topOffset: TOAST_TOP_OFFSET,
    visibilityTime:
      visibilityTime ??
      (type === "error" ? TOAST_ERROR_VISIBILITY_MS : TOAST_SUCCESS_VISIBILITY_MS),
    text1: title,
  };

  if (message) {
    toastParams.text2 = message;
  }

  Toast.show(toastParams);
}

export function showSuccessToast(title: string, message?: string) {
  showToast("success", { title, message });
}

export function showErrorToast(title: string, message?: string) {
  showToast("error", { title, message });
}

export function showInfoToast(title: string, message?: string) {
  showToast("info", { title, message });
}

export function hideAppToast() {
  Toast.hide();
}

export function AppToastHost() {
  const { colors } = useAppTheme();
  const toastConfig = useMemo(() => createToastConfig(colors), [colors]);

  return (
    <Toast
      config={toastConfig}
      position="top"
      topOffset={TOAST_TOP_OFFSET}
      visibilityTime={TOAST_SUCCESS_VISIBILITY_MS}
      autoHide
      swipeable
    />
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: "94%",
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 4,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  titleText: {
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 19,
  },
  messageText: {
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 17,
  },
});
