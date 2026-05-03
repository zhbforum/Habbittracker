import { Pressable, TextInput, View } from "react-native";

import type { HabitWithMetrics } from "@features/habits/model/types";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { HabitDetailsSheetStyles } from "./HabitDetailsSheet.styles";

type HabitDetailsSheetValueSectionProps = {
  habit: HabitWithMetrics;
  isSaving: boolean;
  todayValueInput: string;
  colors: ThemeColors;
  styles: HabitDetailsSheetStyles;
  setTodayValueInput: (value: string) => void;
  submitTodayValue: () => void;
  clearTodayValue: () => void;
};

export function HabitDetailsSheetValueSection({
  habit,
  isSaving,
  todayValueInput,
  colors,
  styles,
  setTodayValueInput,
  submitTodayValue,
  clearTodayValue,
}: HabitDetailsSheetValueSectionProps) {
  return (
    <View style={styles.valueEntryCard}>
      <AppText style={styles.valueEntryTitle}>Log today value</AppText>
      <View style={styles.valueEntryRow}>
        <TextInput
          value={todayValueInput}
          onChangeText={setTodayValueInput}
          placeholder={`0 ${habit.goal.unit}`}
          keyboardType="decimal-pad"
          style={styles.valueInput}
          placeholderTextColor={colors.textPlaceholder}
        />
        <Pressable
          style={[styles.valueActionButton, isSaving && styles.buttonDisabled]}
          onPress={submitTodayValue}
          disabled={isSaving}
        >
          <AppText style={styles.valueActionButtonText}>Save</AppText>
        </Pressable>
        <Pressable
          style={[styles.valueSecondaryButton, isSaving && styles.buttonDisabled]}
          onPress={clearTodayValue}
          disabled={isSaving}
        >
          <AppText style={styles.valueSecondaryButtonText}>Clear</AppText>
        </Pressable>
      </View>
    </View>
  );
}
