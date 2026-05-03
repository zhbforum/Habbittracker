import { Check, ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import type { ThemeColors, ThemeMode } from "@shared/theme";
import { AppText } from "@shared/ui";

import type { ProfileThemeSheetStyles } from "./ProfileThemeSheet.styles";

const THEME_OPTIONS: { id: ThemeMode; label: string; caption: string }[] = [
  {
    id: "light",
    label: "Light Theme",
    caption: "Soft, bright, and minimal.",
  },
  {
    id: "dark",
    label: "Dark Theme",
    caption: "High-contrast mode for night focus.",
  },
];

type ProfileThemeOptionsViewProps = {
  activeMode: ThemeMode;
  colors: ThemeColors;
  styles: ProfileThemeSheetStyles;
  onBack: () => void;
  onSelectMode: (mode: ThemeMode) => void;
};

export function ProfileThemeOptionsView({
  activeMode,
  colors,
  styles,
  onBack,
  onSelectMode,
}: ProfileThemeOptionsViewProps) {
  return (
    <>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={18} color={colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
        <AppText style={styles.title}>Theme</AppText>
      </View>

      <AppText style={styles.sectionTitle}>Choose appearance</AppText>
      <View style={styles.optionsList}>
        {THEME_OPTIONS.map((option) => {
          const isActive = option.id === activeMode;

          return (
            <Pressable
              key={option.id}
              style={[styles.optionCard, isActive && styles.optionCardActive]}
              onPress={() => onSelectMode(option.id)}
            >
              <View style={styles.optionTextWrap}>
                <AppText style={styles.optionTitle}>{option.label}</AppText>
                <AppText style={styles.optionCaption}>{option.caption}</AppText>
              </View>

              {isActive ? (
                <Check size={20} color={colors.accentText} strokeWidth={2.4} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
