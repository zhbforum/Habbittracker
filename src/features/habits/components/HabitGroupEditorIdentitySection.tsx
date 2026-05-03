import { TextInput, View } from "react-native";

import {
  HABIT_GROUP_DESCRIPTION_MAX_LENGTH,
  HABIT_GROUP_FREQUENCY_OPTIONS,
  HABIT_GROUP_NAME_MAX_LENGTH,
} from "@features/habits/model/constants";
import type { HabitGroupFormValues } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitGroupEditorSheetStyles } from "./HabitGroupEditorSheet.styles";
import { HabitIconPicker } from "./HabitIconPicker";
import { HabitSegmentedControl } from "./HabitSegmentedControl";
import { HabitWeekdaySelector } from "./HabitWeekdaySelector";

type HabitGroupEditorIdentitySectionProps = {
  values: HabitGroupFormValues;
  colors: ThemeColors;
  styles: HabitGroupEditorSheetStyles;
  onFieldChange: <K extends keyof HabitGroupFormValues>(
    field: K,
    value: HabitGroupFormValues[K],
  ) => void;
};

export function HabitGroupEditorIdentitySection({
  values,
  colors,
  styles,
  onFieldChange,
}: HabitGroupEditorIdentitySectionProps) {
  return (
    <>
      <View>
        <AppText style={styles.fieldLabel}>Group name</AppText>
        <TextInput
          value={values.name}
          onChangeText={(nextValue) => onFieldChange("name", nextValue)}
          placeholder="Sport session"
          autoCorrect={false}
          maxLength={HABIT_GROUP_NAME_MAX_LENGTH}
          style={styles.input}
          placeholderTextColor={colors.textPlaceholder}
        />
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Description (optional)</AppText>
        <TextInput
          value={values.description}
          onChangeText={(nextValue) => onFieldChange("description", nextValue)}
          placeholder="Short context for this routine"
          autoCorrect={false}
          maxLength={HABIT_GROUP_DESCRIPTION_MAX_LENGTH}
          multiline
          style={[styles.input, styles.multilineInput]}
          placeholderTextColor={colors.textPlaceholder}
        />
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Group icon</AppText>
        <HabitIconPicker
          selectedIconId={values.iconId}
          selectedIconColorId="emerald"
          onSelectIcon={(iconId) => onFieldChange("iconId", iconId)}
        />
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Group frequency</AppText>
        <HabitSegmentedControl
          options={HABIT_GROUP_FREQUENCY_OPTIONS}
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
            onToggleWeekday={(weekday) => {
              const hasDay = values.customWeekdays.includes(weekday);
              const nextCustomWeekdays = hasDay
                ? values.customWeekdays.filter((day) => day !== weekday)
                : [...values.customWeekdays, weekday].sort((left, right) => left - right);

              onFieldChange("customWeekdays", nextCustomWeekdays);
            }}
          />
        </View>
      ) : null}
    </>
  );
}
