import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/shared/theme";

type PaginationDotsProps = {
  total: number;
  activeIndex: number;
  style?: StyleProp<ViewStyle>;
};

export function PaginationDots({ total, activeIndex, style }: PaginationDotsProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[styles.dot, index === activeIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: colors.accentSecondary,
  },
  activeDot: {
    width: 42,
    borderRadius: 7,
    backgroundColor: colors.accentPrimary,
  },
});
