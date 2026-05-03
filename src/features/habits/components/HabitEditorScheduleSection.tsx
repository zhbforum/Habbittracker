import { View } from "react-native";
import type { Dispatch, SetStateAction } from "react";

import type { HabitFormValues } from "@features/habits/model/types";
import { AppText } from "@shared/ui";

import type { HabitEditorSheetStyles } from "./HabitEditorSheet.styles";
import { HabitIconColorPicker } from "./HabitIconColorPicker";
import { HabitIconPicker } from "./HabitIconPicker";
import { HabitReminderField } from "./HabitReminderField";
import { HabitWeekdaySelector } from "./HabitWeekdaySelector";

type HabitEditorScheduleSectionProps = {
  isVisible: boolean;
  values: HabitFormValues;
  styles: HabitEditorSheetStyles;
  onToggleCustomWeekday: (weekday: HabitFormValues["weeklyWeekday"]) => void;
  onFieldChange: <K extends keyof HabitFormValues>(field: K, value: HabitFormValues[K]) => void;
  setIsReminderPickerOpen: Dispatch<SetStateAction<boolean>>;
};

export function HabitEditorScheduleSection({
  isVisible,
  values,
  styles,
  onToggleCustomWeekday,
  onFieldChange,
  setIsReminderPickerOpen,
}: HabitEditorScheduleSectionProps) {
  return (
    <>
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
    </>
  );
}
