import { Flame } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type ProfileStatCardProps = {
  label: string;
  value: string;
  showFlame?: boolean;
};

export function ProfileStatCard({ label, value, showFlame = false }: ProfileStatCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.valueRow}>
        {showFlame ? (
          <Flame size={20} color="#F08A2A" strokeWidth={2.4} />
        ) : null}
        <AppText style={styles.value}>{value}</AppText>
      </View>
      <AppText style={styles.label}>{label}</AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minHeight: 96,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    value: {
      color: colors.textPrimary,
      fontSize: 28,
      lineHeight: 34,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 36,
    },
    label: {
      marginTop: 8,
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
  });
}
