import { CalendarDays, Clock3, Flag } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { formatTimeLabel } from "@features/habits/model/date";
import {
  getCompactGroupFrequencyLabel,
  getGroupSummaryProgressHint,
  getGroupSummarySessionPhaseLabel,
} from "@features/habits/model/groupCardPresenters";
import { getHabitIconById } from "@features/habits/model/icons";
import type { HabitGroupWithMetrics } from "@features/habits/model/types";
import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

import { createHabitGroupSummaryCardStyles } from "./HabitGroupSummaryCard.styles";

type HabitGroupSummaryCardProps = {
  group: HabitGroupWithMetrics;
  onPress: () => void;
};

export function HabitGroupSummaryCard({ group, onPress }: HabitGroupSummaryCardProps) {
  const { colors } = useAppTheme();
  const styles = createHabitGroupSummaryCardStyles(colors);
  const GroupIcon = getHabitIconById(group.iconId);

  const sessionPhase = getGroupSummarySessionPhaseLabel(group.metrics.sessionPhase);
  const sessionWindowLabel = `${formatTimeLabel(group.reminderStartTime)} - ${formatTimeLabel(group.reminderEndTime)}`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.groupIdentityWrap}>
          <View style={styles.groupIconWrap}>
            <GroupIcon size={19} color={colors.accentText} strokeWidth={2.3} />
          </View>
          <View style={styles.groupTitleWrap}>
            <AppText style={styles.groupName}>{group.name}</AppText>
            {group.description ? (
              <AppText style={styles.groupDescription}>{group.description}</AppText>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.phaseBadge,
            sessionPhase.tone === "success" && styles.phaseBadgeSuccess,
          ]}
        >
          <AppText
            style={[
              styles.phaseBadgeText,
              sessionPhase.tone === "success" && styles.phaseBadgeTextSuccess,
            ]}
          >
            {sessionPhase.label}
          </AppText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricChip}>
          <Flag size={14} color={colors.accentText} strokeWidth={2.2} />
          <AppText style={styles.metricChipText}>
            Goal {group.metrics.targetCount === 0 ? group.dailyGoal : group.metrics.targetCount}
          </AppText>
        </View>

        <View style={styles.metricChip}>
          <Clock3 size={14} color={colors.textSecondary} strokeWidth={2.1} />
          <AppText style={styles.metricChipText}>{sessionWindowLabel}</AppText>
        </View>

        <View style={styles.metricChip}>
          <CalendarDays size={14} color={colors.textSecondary} strokeWidth={2.1} />
          <AppText style={styles.metricChipText}>
            {group.startDate} - {group.endDate}
          </AppText>
        </View>

        <View style={styles.metricChip}>
          <AppText style={styles.metricChipText}>{getCompactGroupFrequencyLabel(group)}</AppText>
        </View>
      </View>

      <View style={styles.progressRow}>
        <AppText style={styles.progressCaption}>
          {group.metrics.completedHabitsCount}/{Math.max(group.metrics.targetCount, 1)} done
        </AppText>
        <AppText style={styles.progressPercent}>{group.metrics.progressPercent}%</AppText>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${group.metrics.progressPercent}%`,
            },
            group.metrics.isCompletedToday && styles.progressFillDone,
          ]}
        />
      </View>

      <AppText style={styles.progressHint}>{getGroupSummaryProgressHint(group)}</AppText>
    </Pressable>
  );
}
