import { TextInput, View } from "react-native";

import {
  HABIT_FREQUENCY_OPTIONS,
  HABIT_KIND_OPTIONS,
  HABIT_NAME_MAX_LENGTH,
} from "@features/habits/model/constants";
import type { HabitFormValues } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitEditorSheetStyles } from "./HabitEditorSheet.styles";
import { HabitSegmentedControl } from "./HabitSegmentedControl";

type HabitEditorIdentitySectionProps = {
  values: HabitFormValues;
  colors: ThemeColors;
  styles: HabitEditorSheetStyles;
  onFieldChange: <K extends keyof HabitFormValues>(field: K, value: HabitFormValues[K]) => void;
};

export function HabitEditorIdentitySection({
  values,
  colors,
  styles,
  onFieldChange,
}: HabitEditorIdentitySectionProps) {
  return (
    <>
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
    </>
  );
}
