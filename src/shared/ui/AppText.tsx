import { StyleSheet, Text as NativeText, type TextProps } from "react-native";

import { typography } from "@/shared/theme";

export function AppText({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.manropeRegular,
    fontWeight: "400",
  },
});
