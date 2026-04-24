import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { formatTimeLabel } from "../model/date";
import { TimeWheelPicker } from "./TimeWheelPicker";

type HabitReminderFieldProps = {
  value: string;
  isParentVisible: boolean;
  onChange: (nextValue: string) => void;
  onPickerVisibilityChange?: (isOpen: boolean) => void;
};

export function HabitReminderField({
  value,
  isParentVisible,
  onChange,
  onPickerVisibilityChange,
}: HabitReminderFieldProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!isParentVisible) {
      setIsPickerOpen(false);
    }
  }, [isParentVisible]);

  useEffect(() => {
    onPickerVisibilityChange?.(isPickerOpen);
  }, [isPickerOpen, onPickerVisibilityChange]);

  return (
    <View>
      <AppText style={styles.fieldLabel}>Reminder time</AppText>
      <Pressable
        style={styles.reminderPreviewButton}
        onPress={() => setIsPickerOpen((currentValue) => !currentValue)}
      >
        <View style={styles.reminderPreviewTextWrap}>
          <AppText style={styles.reminderHelpText}>Tap to set reminder</AppText>
          <AppText style={styles.reminderSelectedTime}>{formatTimeLabel(value)}</AppText>
        </View>

        <AppText style={styles.reminderPreviewAction}>
          {isPickerOpen ? "Close" : "Change"}
        </AppText>
      </Pressable>

      {isPickerOpen ? (
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
