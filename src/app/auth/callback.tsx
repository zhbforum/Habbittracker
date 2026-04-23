import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/shared/theme";

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
