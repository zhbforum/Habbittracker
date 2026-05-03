import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { AchievementProgress } from "../model/types";
import { createAchievementBadgeStyles } from "./AchievementBadge.styles";
import { getAchievementTierStyle } from "./AchievementBadge.tierStyles";

type AchievementBadgeProps = {
  achievement: AchievementProgress;
  isPublicView?: boolean;
  onPress?: () => void;
};

export function AchievementBadge({
  achievement,
  isPublicView = false,
  onPress,
}: AchievementBadgeProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createAchievementBadgeStyles(colors);
  const tierStyle = getAchievementTierStyle(achievement.tier, isDark);
  const isLocked = !achievement.isUnlocked;
  const iconName = isLocked && isPublicView ? "help-circle-outline" : achievement.iconName;

  return (
    <Pressable
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconFrame,
          {
            backgroundColor: isLocked ? tierStyle.surfaceLocked : tierStyle.surface,
            borderColor: isLocked ? tierStyle.borderLocked : tierStyle.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName as never}
          size={22}
          color={isLocked ? tierStyle.tintLocked : tierStyle.tint}
        />
      </View>

      <View>
        <AppText style={styles.title}>{achievement.title}</AppText>
        <AppText style={styles.description}>{achievement.description}</AppText>
      </View>

      <AppText style={styles.progressLabel}>
        {achievement.isUnlocked
          ? "Unlocked"
          : `${Math.min(achievement.progress, achievement.target)}/${achievement.target}`}
      </AppText>
    </Pressable>
  );
}
