import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useHabitDetailsState } from "@features/habits/hooks/useHabitDetailsState";
import { getHabitIconById, getHabitIconColorById } from "@features/habits/model/icons";
import type { HabitWithMetrics } from "@features/habits/model/types";
import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

import { HabitDeleteDialog } from "./HabitDeleteDialog";
import { HabitDetailsSheetGoalSection } from "./HabitDetailsSheetGoalSection";
import { HabitDetailsSheetHeader } from "./HabitDetailsSheetHeader";
import { createHabitDetailsSheetStyles } from "./HabitDetailsSheet.styles";
import { HabitDetailsSheetValueSection } from "./HabitDetailsSheetValueSection";
import { HabitHeatmap } from "./HabitHeatmap";
import { WeeklyPerformanceChart } from "./WeeklyPerformanceChart";

type HabitDetailsSheetProps = {
  isVisible: boolean;
  habit: HabitWithMetrics | null;
  isSaving: boolean;
  onClose: () => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onToggleToday: (habitId: string) => void;
  onSetTodayProgressValue: (habitId: string, value: number) => void;
};

export function HabitDetailsSheet({
  isVisible,
  habit,
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onToggleToday,
  onSetTodayProgressValue,
}: HabitDetailsSheetProps) {
  const { colors } = useAppTheme();
  const styles = createHabitDetailsSheetStyles(colors);
  const {
    isDeleteDialogOpen,
    todayValueInput,
    setTodayValueInput,
    openDeleteDialog,
    closeDeleteDialog,
    submitTodayValue,
    clearTodayValue,
    confirmDelete,
  } = useHabitDetailsState({
    isVisible,
    habit,
    onSetTodayProgressValue,
  });

  if (!habit) {
    return null;
  }

  const HabitIcon = getHabitIconById(habit.iconId);
  const iconColor = getHabitIconColorById(habit.iconColorId);
  const isValueGoal = habit.goal.metric === "value";

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
              <HabitDetailsSheetHeader
                habit={habit}
                HabitIcon={HabitIcon}
                iconColor={iconColor}
                styles={styles}
              />

              <HabitDetailsSheetGoalSection
                habit={habit}
                isSaving={isSaving}
                styles={styles}
                onToggleToday={onToggleToday}
              />

              {isValueGoal ? (
                <HabitDetailsSheetValueSection
                  habit={habit}
                  isSaving={isSaving}
                  todayValueInput={todayValueInput}
                  colors={colors}
                  styles={styles}
                  setTodayValueInput={setTodayValueInput}
                  submitTodayValue={submitTodayValue}
                  clearTodayValue={clearTodayValue}
                />
              ) : null}

              <WeeklyPerformanceChart days={habit.metrics.weeklyPerformance} />
              <HabitHeatmap weeks={habit.metrics.heatmap} />
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={() => onEdit(habit.id)}>
                <AppText style={styles.secondaryButtonText}>Edit</AppText>
              </Pressable>
              <Pressable style={styles.dangerButton} onPress={openDeleteDialog}>
                <AppText style={styles.dangerButtonText}>Delete</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <HabitDeleteDialog
        isVisible={isDeleteDialogOpen}
        isDeleting={isSaving}
        onCancel={closeDeleteDialog}
        onConfirm={() => confirmDelete(onDelete)}
      />
    </>
  );
}
