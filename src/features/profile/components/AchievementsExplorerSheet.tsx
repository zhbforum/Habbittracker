import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AchievementsSection, type AchievementProgress, type AchievementSummary } from "@entities/achievement";
import { useAchievementsExplorerSheetState, ACHIEVEMENT_FILTER_OPTIONS } from "@features/profile/hooks/useAchievementsExplorerSheetState";
import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

import { createAchievementsExplorerSheetStyles } from "./AchievementsExplorerSheet.styles";

type AchievementsExplorerSheetProps = {
  isVisible: boolean;
  achievements: AchievementProgress[];
  summary: AchievementSummary;
  onClose: () => void;
};

export function AchievementsExplorerSheet({
  isVisible,
  achievements,
  summary,
  onClose,
}: AchievementsExplorerSheetProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createAchievementsExplorerSheetStyles(colors, Math.max(18, insets.bottom + 8));
  const {
    activeFilter,
    filteredAchievements,
    emptyText,
    filterStatsLabel,
    contentOpacity,
    contentTranslateY,
    handleSelectFilter,
  } = useAchievementsExplorerSheetState({
    isVisible,
    achievements,
    summary,
  });

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <AppText style={styles.title}>All achievements</AppText>
              <AppText style={styles.subtitle}>{filterStatsLabel}</AppText>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={18} color={colors.textSecondary} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.filtersRow}>
            {ACHIEVEMENT_FILTER_OPTIONS.map((option) => {
              const isActive = option.value === activeFilter;

              return (
                <Pressable
                  key={option.value}
                  style={[styles.filterButton, isActive && styles.filterButtonActive]}
                  onPress={() => handleSelectFilter(option.value)}
                >
                  <AppText style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <Animated.View
            style={[
              styles.scrollWrap,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <AchievementsSection
                achievements={filteredAchievements}
                summary={summary}
                emptyText={emptyText}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
