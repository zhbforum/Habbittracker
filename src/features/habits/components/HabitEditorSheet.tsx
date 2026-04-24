import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import {
  HABIT_FREQUENCY_OPTIONS,
  HABIT_KIND_OPTIONS,
  HABIT_NAME_MAX_LENGTH,
} from "../model/constants";
import type { HabitFormValues } from "../model/types";
import { HabitIconColorPicker } from "./HabitIconColorPicker";
import { HabitIconPicker } from "./HabitIconPicker";
import { HabitReminderField } from "./HabitReminderField";
import { HabitSegmentedControl } from "./HabitSegmentedControl";
import { HabitWeekdaySelector } from "./HabitWeekdaySelector";

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
  const styles = createStyles(colors);
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);

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

              <View>
                <AppText style={styles.fieldLabel}>Habit name</AppText>
                <TextInput
                  value={values.name}
                  onChangeText={(value) => onFieldChange("name", value)}
                  placeholder="Drink 2L water"
                  autoCorrect={false}
                  maxLength={HABIT_NAME_MAX_LENGTH}
                  style={styles.input}
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>

              <View>
                <AppText style={styles.fieldLabel}>Type</AppText>
                <HabitSegmentedControl
                  options={HABIT_KIND_OPTIONS}
                  selectedValue={values.kind}
                  onSelect={(nextKind) => onFieldChange("kind", nextKind)}
                />
              </View>

              <View>
                <AppText style={styles.fieldLabel}>Frequency</AppText>
                <HabitSegmentedControl
                  options={HABIT_FREQUENCY_OPTIONS}
                  selectedValue={values.frequency}
                  onSelect={(nextFrequency) => onFieldChange("frequency", nextFrequency)}
                />
              </View>

              {values.frequency === "weekly" ? (
                <View>
                  <AppText style={styles.fieldLabel}>Weekly day</AppText>
                  <HabitWeekdaySelector
                    selectedWeekdays={[values.weeklyWeekday]}
                    onToggleWeekday={(weekday) => onFieldChange("weeklyWeekday", weekday)}
                  />
                </View>
              ) : null}

              {values.frequency === "custom" ? (
                <View>
                  <AppText style={styles.fieldLabel}>Custom days</AppText>
                  <HabitWeekdaySelector
                    selectedWeekdays={values.customWeekdays}
                    onToggleWeekday={onToggleCustomWeekday}
                  />
                </View>
              ) : null}

              <HabitReminderField
                value={values.reminderTime}
                isParentVisible={isVisible}
                onChange={(nextValue) => onFieldChange("reminderTime", nextValue)}
                onPickerVisibilityChange={setIsReminderPickerOpen}
              />

              <View>
                <AppText style={styles.fieldLabel}>Icon</AppText>
                <HabitIconPicker
                  selectedIconId={values.iconId}
                  selectedIconColorId={values.iconColorId}
                  onSelectIcon={(iconId) => onFieldChange("iconId", iconId)}
                />
              </View>

              <View>
                <AppText style={styles.fieldLabel}>Icon color</AppText>
                <HabitIconColorPicker
                  selectedColorId={values.iconColorId}
                  onSelectColor={(colorId) => onFieldChange("iconColorId", colorId)}
                />
              </View>
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    sheet: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    handle: {
      width: 46,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 10,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    formScroll: {
      flex: 1,
    },
    formContent: {
      paddingTop: 14,
      paddingBottom: 10,
      gap: 14,
    },
    errorBanner: {
      borderWidth: 1,
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorSurface,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    errorBannerText: {
      color: colors.errorText,
      fontSize: 13,
      lineHeight: 18,
    },
    fieldLabel: {
      marginBottom: 8,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    input: {
      minHeight: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    actionsRow: {
      marginTop: 8,
      paddingTop: 8,
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
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
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}
