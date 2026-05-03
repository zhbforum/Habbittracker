import { Pressable, TextInput, View } from "react-native";
import type { Dispatch, SetStateAction } from "react";

import { addDays, toDateKey } from "@features/habits/model/date";
import type { HabitGroupFormValues } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitGroupEditorSheetStyles } from "./HabitGroupEditorSheet.styles";
import { HabitReminderField } from "./HabitReminderField";

type HabitGroupEditorScheduleSectionProps = {
  isVisible: boolean;
  values: HabitGroupFormValues;
  colors: ThemeColors;
  styles: HabitGroupEditorSheetStyles;
  onFieldChange: <K extends keyof HabitGroupFormValues>(
    field: K,
    value: HabitGroupFormValues[K],
  ) => void;
  setIsStartPickerOpen: Dispatch<SetStateAction<boolean>>;
  setIsEndPickerOpen: Dispatch<SetStateAction<boolean>>;
};

export function HabitGroupEditorScheduleSection({
  isVisible,
  values,
  colors,
  styles,
  onFieldChange,
  setIsStartPickerOpen,
  setIsEndPickerOpen,
}: HabitGroupEditorScheduleSectionProps) {
  return (
    <>
      <View>
        <AppText style={styles.fieldLabel}>Start date</AppText>
        <TextInput
          value={values.startDate}
          onChangeText={(nextValue) => onFieldChange("startDate", nextValue)}
          placeholder="YYYY-MM-DD"
          autoCorrect={false}
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
        />
        <View style={styles.inlineDateActions}>
          <Pressable
            style={styles.inlineDateButton}
            onPress={() => onFieldChange("startDate", toDateKey(new Date()))}
          >
            <AppText style={styles.inlineDateButtonText}>Today</AppText>
          </Pressable>
        </View>
      </View>

      <View>
        <AppText style={styles.fieldLabel}>End date</AppText>
        <TextInput
          value={values.endDate}
          onChangeText={(nextValue) => onFieldChange("endDate", nextValue)}
          placeholder="YYYY-MM-DD"
          autoCorrect={false}
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
        />
        <View style={styles.inlineDateActions}>
          <Pressable
            style={styles.inlineDateButton}
            onPress={() => onFieldChange("endDate", toDateKey(addDays(new Date(), 30)))}
          >
            <AppText style={styles.inlineDateButtonText}>+30 days</AppText>
          </Pressable>
          <Pressable
            style={styles.inlineDateButton}
            onPress={() => onFieldChange("endDate", toDateKey(addDays(new Date(), 90)))}
          >
            <AppText style={styles.inlineDateButtonText}>+90 days</AppText>
          </Pressable>
        </View>
      </View>

      <HabitReminderField
        value={values.reminderStartTime}
        label="Start reminder"
        helperText="When this group should start"
        isParentVisible={isVisible}
        onChange={(nextValue) => onFieldChange("reminderStartTime", nextValue)}
        onPickerVisibilityChange={setIsStartPickerOpen}
      />

      <HabitReminderField
        value={values.reminderEndTime}
        label="End reminder"
        helperText="When this group should wrap up"
        isParentVisible={isVisible}
        onChange={(nextValue) => onFieldChange("reminderEndTime", nextValue)}
        onPickerVisibilityChange={setIsEndPickerOpen}
      />
    </>
  );
}
