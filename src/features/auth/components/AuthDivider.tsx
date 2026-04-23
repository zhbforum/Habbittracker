import { StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type AuthDividerProps = {
  label: string;
};

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.1,
  },
});
