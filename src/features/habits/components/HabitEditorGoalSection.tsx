import { TextInput, View } from "react-native";

import {
  HABIT_GOAL_METRIC_OPTIONS,
  HABIT_GOAL_PERIOD_OPTIONS,
  HABIT_GOAL_UNIT_MAX_LENGTH,
} from "@features/habits/model/constants";
import type { HabitFormValues } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitEditorSheetStyles } from "./HabitEditorSheet.styles";
import { HabitSegmentedControl } from "./HabitSegmentedControl";

type HabitEditorGoalSectionProps = {
  values: HabitFormValues;
  colors: ThemeColors;
  styles: HabitEditorSheetStyles;
  handleGoalMetricSelect: (nextMetric: HabitFormValues["goalMetric"]) => void;
  handleGoalTargetChange: (value: string) => void;
  onFieldChange: <K extends keyof HabitFormValues>(field: K, value: HabitFormValues[K]) => void;
};

export function HabitEditorGoalSection({
  values,
  colors,
  styles,
  handleGoalMetricSelect,
  handleGoalTargetChange,
  onFieldChange,
}: HabitEditorGoalSectionProps) {
  return (
    <>
      <View>
        <AppText style={styles.fieldLabel}>Goal metric</AppText>
        <HabitSegmentedControl
          options={HABIT_GOAL_METRIC_OPTIONS}
          selectedValue={values.goalMetric}
          onSelect={handleGoalMetricSelect}
        />
      </View>

      <View>
        <AppText style={styles.fieldLabel}>Goal period</AppText>
        <HabitSegmentedControl
          options={HABIT_GOAL_PERIOD_OPTIONS}
          selectedValue={values.goalPeriod}
          onSelect={(nextPeriod) => onFieldChange("goalPeriod", nextPeriod)}
        />
      </View>

      <View style={styles.goalInputsRow}>
        <View style={styles.goalInputColumn}>
          <AppText style={styles.fieldLabel}>Goal target</AppText>
          <TextInput
            value={String(values.goalTarget)}
            onChangeText={handleGoalTargetChange}
            placeholder="1"
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>

        <View style={styles.goalInputColumn}>
          <AppText style={styles.fieldLabel}>Unit</AppText>
          <TextInput
            value={values.goalUnit}
            onChangeText={(value) => onFieldChange("goalUnit", value)}
            placeholder={values.goalMetric === "value" ? "ml, min, steps" : "times"}
            autoCorrect={false}
            maxLength={HABIT_GOAL_UNIT_MAX_LENGTH}
            style={styles.input}
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>
      </View>
    </>
  );
}
