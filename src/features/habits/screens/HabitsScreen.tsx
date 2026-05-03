import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { Undo2 } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@shared/navigation/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { ActionConfirmDialog, AppText } from "@/shared/ui";

import { HabitsContentState } from "../components/HabitsContentState";
import { HabitsCreateButton } from "../components/HabitsCreateButton";
import { HabitsPageHeader } from "../components/HabitsPageHeader";
import { HabitDetailsSheet } from "../components/HabitDetailsSheet";
import { HabitEditorSheet } from "../components/HabitEditorSheet";
import { HabitGroupDetailsSheet } from "../components/HabitGroupDetailsSheet";
import { HabitGroupEditorSheet } from "../components/HabitGroupEditorSheet";
import { HabitGroupsSection } from "../components/HabitGroupsSection";
import { HabitsSummaryStrip } from "../components/HabitsSummaryStrip";
import { useHabitsScreenRouteParams } from "../hooks/useHabitsScreenRouteParams";
import { useHabitsScreenViewModel } from "../hooks/useHabitsScreenViewModel";
import { createHabitsScreenStyles } from "./HabitsScreen.styles";

type HabitsScreenProps = {
  user: User;
};

export function HabitsScreen({ user }: HabitsScreenProps) {
  const params = useLocalSearchParams<{
    create?: string | string[];
    habitId?: string | string[];
    groupId?: string | string[];
  }>();
  const createParam = Array.isArray(params.create) ? params.create[0] : params.create;
  const habitIdParam = Array.isArray(params.habitId) ? params.habitId[0] : params.habitId;
  const groupIdParam = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const { colors, isDark } = useAppTheme();
  const styles = createHabitsScreenStyles(colors);
  const {
    activeTab,
    handleTabPress,
    isLoading,
    isSaving,
    errorMessage,
    habits,
    groups,
    summary,
    selectedHabit,
    selectedGroup,
    isEditorOpen,
    isDetailsOpen,
    isGroupEditorOpen,
    isGroupDetailsOpen,
    editorMode,
    groupEditorMode,
    formValues,
    groupFormValues,
    pendingUndoHabit,
    isUndoDialogOpen,
    setFormField,
    setGroupFormField,
    toggleCustomWeekday,
    toggleHabitInGroupForm,
    openCreateHabit,
    openHabitDetails,
    openCreateGroup,
    openGroupDetails,
    closeEditor,
    closeDetails,
    closeGroupEditor,
    closeGroupDetails,
    handleSaveHabit,
    handleSaveGroup,
    handleDeleteHabit,
    handleDeleteGroup,
    handleToggleTodayPress,
    setTodayProgressValue,
    handleConfirmUndoCompletion,
    handleEditFromDetails,
    handleEditGroupFromDetails,
    closeUndoDialog,
    reload,
  } = useHabitsScreenViewModel({
    user,
  });

  useHabitsScreenRouteParams({
    createParam,
    habitIdParam,
    groupIdParam,
    openCreateHabit,
    openHabitDetails,
    openGroupDetails,
  });

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <HabitsPageHeader />

            <HabitsSummaryStrip summary={summary} />

            <View style={styles.groupsShell}>
              <HabitGroupsSection
                groups={groups}
                isLoading={isLoading}
                isSaving={isSaving}
                hasHabits={habits.length > 0}
                onCreateGroup={openCreateGroup}
                onOpenGroup={openGroupDetails}
              />
            </View>

            <View style={styles.habitsShell}>
              <View style={styles.habitsShellHeader}>
                <AppText style={styles.habitsShellTitle}>Individual Habits</AppText>
                <AppText style={styles.habitsShellSubtitle}>Daily habit list</AppText>
              </View>

              <HabitsContentState
                isLoading={isLoading}
                errorMessage={errorMessage}
                habits={habits}
                onRetry={reload}
                onCreatePress={openCreateHabit}
                onOpenHabit={openHabitDetails}
                onToggleToday={handleToggleTodayPress}
              />
            </View>
          </ScrollView>

          <HabitsCreateButton onPress={openCreateHabit} />
        </View>

        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>

      <HabitEditorSheet
        isVisible={isEditorOpen}
        mode={editorMode}
        values={formValues}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onFieldChange={setFormField}
        onToggleCustomWeekday={toggleCustomWeekday}
        onSave={handleSaveHabit}
        onClose={closeEditor}
      />

      <HabitDetailsSheet
        isVisible={isDetailsOpen}
        habit={selectedHabit}
        isSaving={isSaving}
        onClose={closeDetails}
        onToggleToday={handleToggleTodayPress}
        onSetTodayProgressValue={setTodayProgressValue}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteHabit}
      />

      <HabitGroupEditorSheet
        isVisible={isGroupEditorOpen}
        mode={groupEditorMode}
        values={groupFormValues}
        errorMessage={errorMessage}
        isSaving={isSaving}
        availableHabits={habits}
        onFieldChange={setGroupFormField}
        onToggleHabit={toggleHabitInGroupForm}
        onSave={handleSaveGroup}
        onClose={closeGroupEditor}
      />

      <HabitGroupDetailsSheet
        isVisible={isGroupDetailsOpen}
        group={selectedGroup}
        habits={habits}
        isSaving={isSaving}
        onClose={closeGroupDetails}
        onEdit={handleEditGroupFromDetails}
        onDelete={handleDeleteGroup}
      />

      <ActionConfirmDialog
        isVisible={isUndoDialogOpen}
        title="Undo completion"
        message={
          pendingUndoHabit
            ? `Are you sure you want to remove today's completion for "${pendingUndoHabit.name}"?`
            : "Are you sure you want to remove today's completion?"
        }
        icon={<Undo2 size={20} color={colors.accentText} strokeWidth={2.4} />}
        confirmLabel="Undo"
        confirmLoadingLabel="Updating..."
        isConfirming={isSaving}
        onCancel={closeUndoDialog}
        onConfirm={handleConfirmUndoCompletion}
        confirmTone="default"
      />
    </>
  );
}

