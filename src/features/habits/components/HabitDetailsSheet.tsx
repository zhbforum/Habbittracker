import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { formatLongDate } from "../model/date";
import { getHabitIconById, getHabitIconColorById } from "../model/icons";
import {
  getCompletionActionLabel,
  getFrequencyLabel,
  getReminderLabel,
} from "../model/presenters";
import type { HabitWithMetrics } from "../model/types";
import { HabitDeleteDialog } from "./HabitDeleteDialog";
import { HabitHeatmap } from "./HabitHeatmap";
import { HabitTypeBadge } from "./HabitTypeBadge";
import { WeeklyPerformanceChart } from "./WeeklyPerformanceChart";

type HabitDetailsSheetProps = {
  isVisible: boolean;
  habit: HabitWithMetrics | null;
  isSaving: boolean;
  onClose: () => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onToggleToday: (habitId: string) => void;
};

export function HabitDetailsSheet({
  isVisible,
  habit,
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onToggleToday,
}: HabitDetailsSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsDeleteDialogOpen(false);
    }
  }, [isVisible]);

  if (!habit) {
    return null;
  }

  const HabitIcon = getHabitIconById(habit.iconId);
  const iconColor = getHabitIconColorById(habit.iconColorId);

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <View style={styles.headerRow}>
                <View style={styles.iconWrap}>
                  <HabitIcon size={22} color={iconColor} strokeWidth={2.2} />
                </View>

                <View style={styles.identityWrap}>
                  <AppText style={styles.habitName}>{habit.name}</AppText>
                  <AppText style={styles.metaLine}>{getFrequencyLabel(habit)}</AppText>
                </View>

                <HabitTypeBadge kind={habit.kind} />
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Started</AppText>
                  <AppText style={styles.metaValue}>
                    {formatLongDate(new Date(habit.createdAt))}
                  </AppText>
                </View>
                <View style={styles.metaCard}>
                  <AppText style={styles.metaTitle}>Reminder</AppText>
                  <AppText style={styles.metaValue}>{getReminderLabel(habit)}</AppText>
                </View>
              </View>

              <View style={styles.streakRow}>
                <View style={styles.streakCard}>
                  <AppText style={styles.streakLabel}>Current streak</AppText>
                  <AppText style={styles.streakValue}>{habit.metrics.currentStreak}d</AppText>
                </View>
                <View style={styles.streakCard}>
                  <AppText style={styles.streakLabel}>Best streak</AppText>
                  <AppText style={styles.streakValue}>{habit.metrics.bestStreak}d</AppText>
                </View>
              </View>

              <Pressable
                style={[
                  styles.progressButton,
                  habit.metrics.completedToday && styles.progressButtonDone,
                  isSaving && styles.buttonDisabled,
                ]}
                onPress={() => onToggleToday(habit.id)}
                disabled={isSaving}
              >
                <AppText
                  style={[
                    styles.progressButtonText,
                    habit.metrics.completedToday && styles.progressButtonTextDone,
                  ]}
                >
                  {getCompletionActionLabel(habit)}
                </AppText>
              </Pressable>

              <WeeklyPerformanceChart days={habit.metrics.weeklyPerformance} />
              <HabitHeatmap weeks={habit.metrics.heatmap} />
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={() => onEdit(habit.id)}>
                <AppText style={styles.secondaryButtonText}>Edit</AppText>
              </Pressable>
              <Pressable
                style={styles.dangerButton}
                onPress={() => setIsDeleteDialogOpen(true)}
              >
                <AppText style={styles.dangerButtonText}>Delete</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <HabitDeleteDialog
        isVisible={isDeleteDialogOpen}
        isDeleting={isSaving}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          onDelete(habit.id);
        }}
      />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(8, 14, 28, 0.46)",
    },
    sheet: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      maxHeight: "92%",
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    handle: {
      width: 46,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 10,
    },
    content: {
      gap: 12,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    identityWrap: {
      flex: 1,
    },
    habitName: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    metaLine: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    metaGrid: {
      flexDirection: "row",
      gap: 10,
    },
    metaCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    metaTitle: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 14,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    metaValue: {
      marginTop: 6,
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
    },
    streakRow: {
      flexDirection: "row",
      gap: 10,
    },
    streakCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    streakLabel: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
    },
    streakValue: {
      marginTop: 6,
      color: colors.textPrimary,
      fontSize: 26,
      lineHeight: 32,
    },
    progressButton: {
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    progressButtonDone: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSurface,
    },
    progressButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    progressButtonTextDone: {
      color: colors.successText,
    },
    actionsRow: {
      marginTop: 8,
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
    dangerButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerButtonText: {
      color: colors.errorText,
      fontSize: 15,
      lineHeight: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}
