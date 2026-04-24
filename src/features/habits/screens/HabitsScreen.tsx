import { StatusBar } from "expo-status-bar";
import { Undo2 } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@/features/home/components/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { ActionConfirmDialog } from "@/shared/ui";

import { HabitsContentState } from "../components/HabitsContentState";
import { HabitsCreateButton } from "../components/HabitsCreateButton";
import { HabitsPageHeader } from "../components/HabitsPageHeader";
import { HabitDetailsSheet } from "../components/HabitDetailsSheet";
import { HabitEditorSheet } from "../components/HabitEditorSheet";
import { HabitsSummaryStrip } from "../components/HabitsSummaryStrip";
import { useHabitsScreenViewModel } from "../hooks/useHabitsScreenViewModel";
import { createHabitsScreenStyles } from "./HabitsScreen.styles";

type HabitsScreenProps = {
  user: User;
};

export function HabitsScreen({ user }: HabitsScreenProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createHabitsScreenStyles(colors);
  const {
    activeTab,
    handleTabPress,
    isLoading,
    isSaving,
    errorMessage,
    habits,
    summary,
    selectedHabit,
    isEditorOpen,
    isDetailsOpen,
    editorMode,
    formValues,
    pendingUndoHabit,
    isUndoDialogOpen,
    setFormField,
    toggleCustomWeekday,
    openCreateHabit,
    openHabitDetails,
    closeEditor,
    closeDetails,
    handleSaveHabit,
    handleDeleteHabit,
    handleToggleTodayPress,
    handleConfirmUndoCompletion,
    handleEditFromDetails,
    closeUndoDialog,
    reload,
  } = useHabitsScreenViewModel({
    user,
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

            <HabitsContentState
              isLoading={isLoading}
              errorMessage={errorMessage}
              habits={habits}
              onRetry={reload}
              onCreatePress={openCreateHabit}
              onOpenHabit={openHabitDetails}
              onToggleToday={handleToggleTodayPress}
            />
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
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteHabit}
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
