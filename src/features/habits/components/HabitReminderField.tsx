import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { formatTimeLabel } from "../model/date";
import { TimeWheelPicker } from "./TimeWheelPicker";

const DEFAULT_REMINDER_TIME = "20:00";

type HabitReminderFieldProps = {
  value: string;
  isParentVisible: boolean;
  label?: string;
  helperText?: string;
  onChange: (nextValue: string) => void;
  onPickerVisibilityChange?: (isOpen: boolean) => void;
};

export function HabitReminderField({
  value,
  isParentVisible,
  label = "Reminder time",
  helperText = "Tap to set reminder",
  onChange,
  onPickerVisibilityChange,
}: HabitReminderFieldProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [lastEnabledValue, setLastEnabledValue] = useState(
    value.trim() ? value : DEFAULT_REMINDER_TIME,
  );
  const isReminderEnabled = value.trim().length > 0;

  useEffect(() => {
    if (!isParentVisible) {
      setIsPickerOpen(false);
    }
  }, [isParentVisible]);

  useEffect(() => {
    if (value.trim()) {
      setLastEnabledValue(value);
    }
  }, [value]);

  useEffect(() => {
    onPickerVisibilityChange?.(isPickerOpen);
  }, [isPickerOpen, onPickerVisibilityChange]);

  const handleReminderEnabled = (shouldEnable: boolean) => {
    if (shouldEnable) {
      const nextValue = value.trim() ? value : lastEnabledValue || DEFAULT_REMINDER_TIME;
      onChange(nextValue);
      return;
    }

    setIsPickerOpen(false);
    onChange("");
  };

  return (
    <View>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <View style={styles.modeRow}>
        <Pressable
          style={[
            styles.modeButton,
            isReminderEnabled && styles.modeButtonActive,
          ]}
          onPress={() => handleReminderEnabled(true)}
        >
          <AppText
            style={[
              styles.modeButtonText,
              isReminderEnabled && styles.modeButtonTextActive,
            ]}
          >
            On
          </AppText>
        </Pressable>
        <Pressable
          style={[
            styles.modeButton,
            !isReminderEnabled && styles.modeButtonActive,
          ]}
          onPress={() => handleReminderEnabled(false)}
        >
          <AppText
            style={[
              styles.modeButtonText,
              !isReminderEnabled && styles.modeButtonTextActive,
            ]}
          >
            Off
          </AppText>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.reminderPreviewButton,
          !isReminderEnabled && styles.reminderPreviewButtonDisabled,
        ]}
        disabled={!isReminderEnabled}
        onPress={() => setIsPickerOpen((currentValue) => !currentValue)}
      >
        <View style={styles.reminderPreviewTextWrap}>
          <AppText style={styles.reminderHelpText}>{helperText}</AppText>
          <AppText
            style={[
              styles.reminderSelectedTime,
              !isReminderEnabled && styles.reminderSelectedTimeMuted,
            ]}
          >
            {isReminderEnabled ? formatTimeLabel(value) : "Off"}
          </AppText>
        </View>

        <AppText style={styles.reminderPreviewAction}>
          {isReminderEnabled ? (isPickerOpen ? "Close" : "Change") : "Disabled"}
        </AppText>
      </Pressable>

      {isReminderEnabled && isPickerOpen ? (
        <View style={styles.reminderPickerWrap}>
          <TimeWheelPicker value={value} onChange={onChange} />
          <View style={styles.reminderBottomRow}>
            <Pressable style={styles.reminderDoneButton} onPress={() => setIsPickerOpen(false)}>
              <AppText style={styles.reminderDoneButtonText}>Done</AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    fieldLabel: {
      marginBottom: 8,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    modeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    modeButton: {
      flex: 1,
      minHeight: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    modeButtonActive: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
    },
    modeButtonText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    modeButtonTextActive: {
      color: colors.textPrimary,
    },
    reminderPreviewButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      minHeight: 56,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    reminderPreviewButtonDisabled: {
      opacity: 0.75,
    },
    reminderPreviewTextWrap: {
      flex: 1,
    },
    reminderHelpText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
    reminderSelectedTime: {
      marginTop: 4,
      color: colors.textPrimary,
      fontSize: 18,
      lineHeight: 24,
    },
    reminderSelectedTimeMuted: {
      color: colors.textSecondary,
    },
    reminderPreviewAction: {
      color: colors.accentText,
      fontSize: 13,
      lineHeight: 18,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    reminderPickerWrap: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 10,
    },
    reminderBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    reminderDoneButton: {
      minHeight: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.accentText,
      backgroundColor: colors.accentSecondary,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    reminderDoneButtonText: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
