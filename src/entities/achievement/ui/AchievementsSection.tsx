import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { AchievementProgress, AchievementSummary } from "../model/types";
import { AchievementBadge } from "./AchievementBadge";

type AchievementsSectionProps = {
  achievements: AchievementProgress[];
  isPublicView?: boolean;
  summary?: AchievementSummary;
  emptyText?: string;
  headerActionLabel?: string;
  onPressHeaderAction?: () => void;
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    headerTextWrap: {
      flex: 1,
      gap: 2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    headerActionButton: {
      minHeight: 30,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    headerActionText: {
      color: colors.accentText,
      fontSize: 12,
      lineHeight: 16,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    emptyCard: {
      minHeight: 86,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
  });
}

export function AchievementsSection({
  achievements,
  isPublicView = false,
  summary,
  emptyText,
  headerActionLabel,
  onPressHeaderAction,
}: AchievementsSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const unlockedCount =
    summary?.unlocked ??
    achievements.filter((achievement) => achievement.isUnlocked).length;
  const totalCount = summary?.total ?? achievements.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <AppText style={styles.title}>Achievements</AppText>
          <AppText style={styles.subtitle}>
            {unlockedCount}/{totalCount} unlocked
          </AppText>
        </View>

        {headerActionLabel && onPressHeaderAction ? (
          <Pressable style={styles.headerActionButton} onPress={onPressHeaderAction}>
            <AppText style={styles.headerActionText}>{headerActionLabel}</AppText>
          </Pressable>
        ) : null}
      </View>

      {achievements.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyText}>
            {emptyText ??
              (isPublicView
                ? "No public achievements unlocked yet."
                : "No achievements yet. Complete habits and groups to unlock badges.")}
          </AppText>
        </View>
      ) : (
        <View style={styles.grid}>
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isPublicView={isPublicView}
            />
          ))}
        </View>
      )}
    </View>
  );
}
