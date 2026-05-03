import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitGroupFormValues, HabitWithMetrics } from "../model/types";
import { HabitGroupEditorGoalSection } from "./HabitGroupEditorGoalSection";
import { HabitGroupEditorIdentitySection } from "./HabitGroupEditorIdentitySection";
import { HabitGroupEditorScheduleSection } from "./HabitGroupEditorScheduleSection";
import { createHabitGroupEditorSheetStyles } from "./HabitGroupEditorSheet.styles";

type HabitGroupEditorSheetProps = {
  isVisible: boolean;
  mode: "create" | "edit";
  values: HabitGroupFormValues;
  errorMessage: string | null;
  isSaving: boolean;
  availableHabits: HabitWithMetrics[];
  onFieldChange: <K extends keyof HabitGroupFormValues>(
    field: K,
    value: HabitGroupFormValues[K],
  ) => void;
  onToggleHabit: (habitId: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function HabitGroupEditorSheet({
  isVisible,
  mode,
  values,
  errorMessage,
  isSaving,
  availableHabits,
  onFieldChange,
  onToggleHabit,
  onSave,
  onClose,
}: HabitGroupEditorSheetProps) {
  const { colors } = useAppTheme();
  const styles = createHabitGroupEditorSheetStyles(colors);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);

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
              {mode === "create" ? "Create Group" : "Edit Group"}
            </AppText>

            <ScrollView
              style={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isStartPickerOpen && !isEndPickerOpen}
            >
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AppText style={styles.errorBannerText}>{errorMessage}</AppText>
                </View>
              ) : null}

              <HabitGroupEditorIdentitySection
                values={values}
                colors={colors}
                styles={styles}
                onFieldChange={onFieldChange}
              />

              <HabitGroupEditorScheduleSection
                isVisible={isVisible}
                values={values}
                colors={colors}
                styles={styles}
                onFieldChange={onFieldChange}
                setIsStartPickerOpen={setIsStartPickerOpen}
                setIsEndPickerOpen={setIsEndPickerOpen}
              />

              <HabitGroupEditorGoalSection
                values={values}
                availableHabits={availableHabits}
                colors={colors}
                styles={styles}
                onToggleHabit={onToggleHabit}
                onFieldChange={onFieldChange}
              />
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <AppText style={styles.secondaryButtonText}>Cancel</AppText>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, isSaving && styles.disabledButton]}
                onPress={onSave}
                disabled={isSaving}
              >
                <AppText style={styles.primaryButtonText}>
                  {isSaving
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                      ? "Create"
                      : "Save"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
