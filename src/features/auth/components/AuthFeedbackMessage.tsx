import { StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthFeedbackMessageProps = {
  message: string;
  kind: "success" | "error";
};

export function AuthFeedbackMessage({ message, kind }: AuthFeedbackMessageProps) {
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

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successContainer: {
    borderColor: colors.accentPrimary,
    backgroundColor: "#EAF5EC",
  },
  errorContainer: {
    borderColor: "#F2C3C3",
    backgroundColor: "#FFF2F2",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: "#1D6B2A",
  },
  errorText: {
    color: "#B42318",
  },
});
