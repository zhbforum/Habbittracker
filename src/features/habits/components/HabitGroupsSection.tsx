import { Pressable, StyleSheet, View } from "react-native";
import { Plus } from "lucide-react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { HabitGroupWithMetrics } from "../model/types";
import { HabitGroupSummaryCard } from "./HabitGroupSummaryCard";

type HabitGroupsSectionProps = {
  groups: HabitGroupWithMetrics[];
  isLoading: boolean;
  isSaving: boolean;
  hasHabits: boolean;
  onCreateGroup: () => void;
  onOpenGroup: (groupId: string) => void;
};

export function HabitGroupsSection({
  groups,
  isLoading,
  isSaving,
  hasHabits,
  onCreateGroup,
  onOpenGroup,
}: HabitGroupsSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <AppText style={styles.headerTitle}>Groups</AppText>
          <AppText style={styles.headerSubtitle}>
            Bundle habits, set session window, and hit your daily minimum.
          </AppText>
        </View>

        <Pressable
          style={[styles.createButton, (!hasHabits || isSaving) && styles.disabledButton]}
          onPress={onCreateGroup}
          disabled={!hasHabits || isSaving}
        >
          <Plus size={16} color={colors.textPrimary} strokeWidth={2.4} />
          <AppText style={styles.createButtonText}>New</AppText>
        </Pressable>
      </View>

      {!hasHabits ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>Create habits first</AppText>
          <AppText style={styles.emptySubtitle}>
            Groups become available once you add at least one habit.
          </AppText>
        </View>
      ) : isLoading ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>Loading groups...</AppText>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>No groups yet</AppText>
          <AppText style={styles.emptySubtitle}>
            Example: create a Sport group and combine run, pull-ups, and push-ups.
          </AppText>
          <Pressable style={styles.inlineCreateButton} onPress={onCreateGroup}>
            <AppText style={styles.inlineCreateButtonText}>Create first group</AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {groups.map((group) => (
            <HabitGroupSummaryCard
              key={group.id}
              group={group}
              onPress={() => onOpenGroup(group.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 28,
      lineHeight: 34,
    },
    headerSubtitle: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    createButton: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    disabledButton: {
      opacity: 0.55,
    },
    createButtonText: {
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 16,
    },
    emptyCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 17,
      lineHeight: 22,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    inlineCreateButton: {
      marginTop: 4,
      alignSelf: "flex-start",
      minHeight: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    inlineCreateButtonText: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    },
    listWrap: {
      gap: 10,
    },
  });
}
