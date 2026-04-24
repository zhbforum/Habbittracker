import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthFeedbackMessageProps = {
  message: string;
  kind: "success" | "error";
};

export function AuthFeedbackMessage({ message, kind }: AuthFeedbackMessageProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.container,
        kind === "success" ? styles.successContainer : styles.errorContainer,
      ]}
    >
      <AppText style={[styles.text, kind === "success" ? styles.successText : styles.errorText]}>
        {message}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    successContainer: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    errorContainer: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
    },
    successText: {
      color: colors.successText,
    },
    errorText: {
      color: colors.errorText,
    },
  });
}
