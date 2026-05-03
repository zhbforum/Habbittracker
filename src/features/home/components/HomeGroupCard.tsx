import { CalendarDays, Clock3, Flag } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { getHabitIconById } from "@entities/habit/model/icons";
import type { HabitGroupWithMetrics } from "@entities/habit/model/types";
import {
  getGroupDateRangeLabel,
  getGroupFrequencyLabel,
  getGroupHint,
  getGroupSessionWindowLabel,
} from "@features/home/model/groupView";
import type { HomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import { AppText } from "@shared/ui";

type HomeGroupCardProps = {
  group: HabitGroupWithMetrics;
  styles: HomeScreenStyles;
  onOpenGroup: (groupId: string) => void;
};

export function HomeGroupCard({ group, styles, onOpenGroup }: HomeGroupCardProps) {
  const GroupIcon = getHabitIconById(group.iconId);

  return (
    <Pressable style={styles.groupCard} onPress={() => onOpenGroup(group.id)}>
      <View style={styles.groupCardHeader}>
        <View style={styles.groupIconWrap}>
          <GroupIcon size={18} color="#2F7A3E" strokeWidth={2.3} />
        </View>
        <View style={styles.groupIdentityWrap}>
          <AppText style={styles.groupName}>{group.name}</AppText>
          <AppText style={styles.groupDescription}>
            {group.description || "No description yet"}
          </AppText>
        </View>
      </View>

      <View style={styles.groupMetaRow}>
        <View style={styles.groupMetaChip}>
          <Flag size={13} color="#2F7A3E" strokeWidth={2.2} />
          <AppText style={styles.groupMetaText}>
            Goal {group.metrics.targetCount === 0 ? group.dailyGoal : group.metrics.targetCount}
          </AppText>
        </View>
        <View style={styles.groupMetaChip}>
          <Clock3 size={13} color="#426046" strokeWidth={2.2} />
          <AppText style={styles.groupMetaText}>{getGroupSessionWindowLabel(group)}</AppText>
        </View>
        <View style={styles.groupMetaChip}>
          <CalendarDays size={13} color="#426046" strokeWidth={2.2} />
          <AppText style={styles.groupMetaText}>{getGroupDateRangeLabel(group)}</AppText>
        </View>
        <View style={styles.groupMetaChip}>
          <AppText style={styles.groupMetaText}>{getGroupFrequencyLabel(group)}</AppText>
        </View>
      </View>

      <View style={styles.groupProgressRow}>
        <AppText style={styles.groupProgressCaption}>
          {group.metrics.completedHabitsCount}/{Math.max(group.metrics.targetCount, 1)} done
        </AppText>
        <AppText style={styles.groupProgressPercent}>{group.metrics.progressPercent}%</AppText>
      </View>

      <View style={styles.groupProgressTrack}>
        <View
          style={[
            styles.groupProgressFill,
            { width: `${group.metrics.progressPercent}%` },
            group.metrics.isCompletedToday && styles.groupProgressFillDone,
          ]}
        />
      </View>

      <AppText style={styles.groupHint}>{getGroupHint(group)}</AppText>
    </Pressable>
  );
}

