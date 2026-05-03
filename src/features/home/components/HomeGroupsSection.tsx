import { Pressable, View } from "react-native";

import type { HabitGroupWithMetrics } from "@entities/habit/model/types";
import type { HomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import { AppText } from "@shared/ui";

import { HomeGroupCard } from "./HomeGroupCard";

type HomeGroupsSectionProps = {
  styles: HomeScreenStyles;
  isLoading: boolean;
  todayGroups: HabitGroupWithMetrics[];
  hasAnyGroups: boolean;
  hasMoreGroups: boolean;
  onOpenHabits: () => void;
  onOpenGroupById: (groupId: string) => void;
};

export function HomeGroupsSection({
  styles,
  isLoading,
  todayGroups,
  hasAnyGroups,
  hasMoreGroups,
  onOpenHabits,
  onOpenGroupById,
}: HomeGroupsSectionProps) {
  return (
    <View style={styles.groupSectionWrap}>
      <View style={styles.groupSectionHeader}>
        <AppText style={styles.groupSectionTitle}>Your Groups</AppText>
        <Pressable onPress={onOpenHabits}>
          <AppText style={styles.groupSectionAction}>{hasMoreGroups ? "View All" : "Manage"}</AppText>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.groupLoaderCard}>
          <AppText style={styles.groupLoaderText}>Loading groups...</AppText>
        </View>
      ) : todayGroups.length === 0 ? (
        <View style={styles.groupEmptyCard}>
          <AppText style={styles.groupEmptyTitle}>
            {hasAnyGroups ? "No groups scheduled today" : "No groups yet"}
          </AppText>
          <AppText style={styles.groupEmptySubtitle}>
            {hasAnyGroups
              ? "Your groups exist, but none match today's schedule or date range."
              : "Create groups on the Habits page to bundle routines like Sport or Focus."}
          </AppText>
          <Pressable style={styles.groupEmptyActionButton} onPress={onOpenHabits}>
            <AppText style={styles.groupEmptyActionText}>
              {hasAnyGroups ? "View all groups" : "Open habits"}
            </AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.groupListWrap}>
          {todayGroups.map((group) => (
            <HomeGroupCard key={group.id} group={group} styles={styles} onOpenGroup={onOpenGroupById} />
          ))}
        </View>
      )}
    </View>
  );
}

