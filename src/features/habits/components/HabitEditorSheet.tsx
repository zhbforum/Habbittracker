import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabitEditorState } from "@features/habits/hooks/useHabitEditorState";
import type { HabitFormValues } from "@features/habits/model/types";
import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

import { createHabitEditorSheetStyles } from "./HabitEditorSheet.styles";
import { HabitEditorGoalSection } from "./HabitEditorGoalSection";
import { HabitEditorIdentitySection } from "./HabitEditorIdentitySection";
import { HabitEditorScheduleSection } from "./HabitEditorScheduleSection";

type HabitEditorSheetProps = {
  isVisible: boolean;
  mode: "create" | "edit";
  values: HabitFormValues;
  errorMessage: string | null;
  isSaving: boolean;
  onFieldChange: <K extends keyof HabitFormValues>(
    field: K,
    value: HabitFormValues[K],
  ) => void;
  onToggleCustomWeekday: (weekday: HabitFormValues["weeklyWeekday"]) => void;
  onSave: () => void;
  onClose: () => void;
};

export function HabitEditorSheet({
  isVisible,
  mode,
  values,
  errorMessage,
  isSaving,
  onFieldChange,
  onToggleCustomWeekday,
  onSave,
  onClose,
}: HabitEditorSheetProps) {
  const { colors } = useAppTheme();
  const styles = createHabitEditorSheetStyles(colors);
  const {
    isReminderPickerOpen,
    setIsReminderPickerOpen,
    handleGoalMetricSelect,
    handleGoalTargetChange,
    saveButtonLabel,
  } = useHabitEditorState({
    mode,
    isSaving,
    values,
    onFieldChange,
  });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <AppText style={styles.title}>
              {mode === "create" ? "Create Habit" : "Edit Habit"}
            </AppText>

            <ScrollView
              style={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!isReminderPickerOpen}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AppText style={styles.errorBannerText}>{errorMessage}</AppText>
                </View>
              ) : null}

              <HabitEditorIdentitySection
                values={values}
                colors={colors}
                styles={styles}
                onFieldChange={onFieldChange}
              />

              <HabitEditorGoalSection
                values={values}
                colors={colors}
                styles={styles}
                handleGoalMetricSelect={handleGoalMetricSelect}
                handleGoalTargetChange={handleGoalTargetChange}
                onFieldChange={onFieldChange}
              />

              <HabitEditorScheduleSection
                isVisible={isVisible}
                values={values}
                styles={styles}
                onToggleCustomWeekday={onToggleCustomWeekday}
                onFieldChange={onFieldChange}
                setIsReminderPickerOpen={setIsReminderPickerOpen}
              />
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <AppText style={styles.secondaryButtonText}>Cancel</AppText>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                onPress={onSave}
                disabled={isSaving}
              >
                <AppText style={styles.primaryButtonText}>{saveButtonLabel}</AppText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
