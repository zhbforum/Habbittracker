import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { CalendarDays, Clock3, Flag, Trash2 } from "lucide-react-native";

import { useHabitGroupDetailsState } from "@features/habits/hooks/useHabitGroupDetailsState";
import { formatLongDate, formatTimeLabel } from "@features/habits/model/date";
import { getHabitIconById, getHabitIconColorById } from "@features/habits/model/icons";
import {
  getGroupFrequencyLabel,
  getGroupProgressHint,
  getGroupSessionPhaseTitle,
} from "@features/habits/model/groupPresenters";
import type { HabitGroupWithMetrics, HabitWithMetrics } from "@features/habits/model/types";
import { useAppTheme } from "@shared/theme";
import { ActionConfirmDialog, AppText } from "@shared/ui";

import { createHabitGroupDetailsSheetStyles } from "./HabitGroupDetailsSheet.styles";

type HabitGroupDetailsSheetProps = {
  isVisible: boolean;
  group: HabitGroupWithMetrics | null;
  habits: HabitWithMetrics[];
  isSaving: boolean;
  onClose: () => void;
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
};

export function HabitGroupDetailsSheet({
  isVisible,
  group,
  habits,
  isSaving,
  onClose,
  onEdit,
  onDelete,
}: HabitGroupDetailsSheetProps) {
  const { colors } = useAppTheme();
  const styles = createHabitGroupDetailsSheetStyles(colors);
  const {
    isDeleteDialogOpen,
    memberHabits,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  } = useHabitGroupDetailsState({
    isVisible,
    group,
    habits,
  });

  if (!group) {
    return null;
  }

  const GroupIcon = getHabitIconById(group.iconId);

  return (
    <>
      <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.headerRow}>
                <View style={styles.groupIconWrap}>
                  <GroupIcon size={22} color={colors.accentText} strokeWidth={2.3} />
                </View>
                <View style={styles.groupIdentityWrap}>
                  <AppText style={styles.groupName}>{group.name}</AppText>
                  <AppText style={styles.groupDescription}>
                    {group.description || "No description yet."}
                  </AppText>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Session window</AppText>
                  <View style={styles.inlineMetaRow}>
                    <Clock3 size={14} color={colors.textSecondary} strokeWidth={2.1} />
                    <AppText style={styles.metaValue}>
                      {formatTimeLabel(group.reminderStartTime)} -{" "}
                      {formatTimeLabel(group.reminderEndTime)}
                    </AppText>
                  </View>
                  <AppText style={styles.metaSubtle}>
                    {getGroupSessionPhaseTitle(group.metrics.sessionPhase)}
                  </AppText>
                </View>

                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Daily goal</AppText>
                  <View style={styles.inlineMetaRow}>
                    <Flag size={14} color={colors.accentText} strokeWidth={2.2} />
                    <AppText style={styles.metaValue}>
                      {group.metrics.targetCount === 0 ? group.dailyGoal : group.metrics.targetCount} tasks
                    </AppText>
                  </View>
                  <AppText style={styles.metaSubtle}>
                    {group.metrics.completedHabitsCount} completed today
                  </AppText>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Frequency</AppText>
                  <AppText style={styles.metaValue}>{getGroupFrequencyLabel(group)}</AppText>
                </View>
                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Date range</AppText>
                  <View style={styles.inlineMetaRow}>
                    <CalendarDays size={14} color={colors.textSecondary} strokeWidth={2.1} />
                    <AppText style={styles.metaValue}>
                      {group.startDate} - {group.endDate}
                    </AppText>
                  </View>
                  <AppText style={styles.metaSubtle}>
                    {group.metrics.isWithinDateRange ? "Within active range" : "Outside active range"}
                  </AppText>
                </View>
              </View>

              <View style={styles.progressRow}>
                <AppText style={styles.progressLabel}>
                  Progress {group.metrics.progressPercent}%
                </AppText>
                <AppText style={styles.progressHint}>{getGroupProgressHint(group)}</AppText>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${group.metrics.progressPercent}%` },
                    group.metrics.isCompletedToday && styles.progressFillDone,
                  ]}
                />
              </View>

              <View style={styles.memberSection}>
                <AppText style={styles.memberTitle}>Habits in this group</AppText>
                {memberHabits.length === 0 ? (
                  <View style={styles.emptyMemberCard}>
                    <AppText style={styles.emptyMemberText}>
                      This group has no habits yet. Edit the group to include habits.
                    </AppText>
                  </View>
                ) : (
                  memberHabits.map((habit) => {
                    const HabitIcon = getHabitIconById(habit.iconId);
                    const iconColor = getHabitIconColorById(habit.iconColorId);

                    return (
                      <View key={habit.id} style={styles.memberCard}>
                        <View style={styles.memberIconWrap}>
                          <HabitIcon size={18} color={iconColor} strokeWidth={2.2} />
                        </View>
                        <View style={styles.memberIdentityWrap}>
                          <AppText style={styles.memberName}>{habit.name}</AppText>
                          <AppText style={styles.memberMeta}>
                            {habit.metrics.completedToday ? "Completed today" : "Pending today"}
                          </AppText>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              <AppText style={styles.createdLabel}>
                Created {formatLongDate(new Date(group.createdAt))}
              </AppText>
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={() => onEdit(group.id)}>
                <AppText style={styles.secondaryButtonText}>Edit</AppText>
              </Pressable>
              <Pressable style={styles.dangerButton} onPress={openDeleteDialog}>
                <AppText style={styles.dangerButtonText}>Delete</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ActionConfirmDialog
        isVisible={isDeleteDialogOpen}
        title="Delete group"
        message="This group will be removed. Habits inside it will remain intact."
        icon={<Trash2 size={20} color="#E26B6B" strokeWidth={2.4} />}
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        isConfirming={isSaving}
        onCancel={closeDeleteDialog}
        onConfirm={() => confirmDelete(onDelete)}
        confirmTone="danger"
      />
    </>
  );
}
