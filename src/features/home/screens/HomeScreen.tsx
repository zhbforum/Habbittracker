import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@shared/navigation/HomeFooter";
import { HomeGroupsSection } from "@features/home/components/HomeGroupsSection";
import { HomeHabitsSection } from "@features/home/components/HomeHabitsSection";
import { HomeProgressCard } from "@features/home/components/HomeProgressCard";
import { useHomeScreenController } from "@features/home/hooks/useHomeScreenController";
import { createHomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import { useAppTheme } from "@shared/theme";
import { AppText } from "@shared/ui";

type HomeScreenProps = {
  user: User;
};

export default function HomeScreen({ user }: HomeScreenProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createHomeScreenStyles(colors);
  const {
    isLoading,
    isSaving,
    errorMessage,
    activeTab,
    handleTabPress,
    greeting,
    dateLabel,
    displayName,
    todayHabits,
    todayGroups,
    hasAnyGroups,
    hasMoreGroups,
    progress,
    openHabits,
    openCreateHabit,
    openHabitById,
    openGroupById,
    toggleTodayCompletion,
    reload,
  } = useHomeScreenController({ user });

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <View style={styles.headerTextWrap}>
                <AppText style={styles.title}>
                  {greeting}, {displayName}
                </AppText>
                <AppText style={styles.subtitle}>{dateLabel}</AppText>
              </View>
            </View>

            <HomeProgressCard styles={styles} colors={colors} progress={progress} />

            <HomeGroupsSection
              styles={styles}
              isLoading={isLoading}
              todayGroups={todayGroups}
              hasAnyGroups={hasAnyGroups}
              hasMoreGroups={hasMoreGroups}
              onOpenHabits={openHabits}
              onOpenGroupById={openGroupById}
            />

            <HomeHabitsSection
              styles={styles}
              colors={colors}
              isLoading={isLoading}
              isSaving={isSaving}
              errorMessage={errorMessage}
              todayHabits={todayHabits}
              onOpenHabits={openHabits}
              onOpenHabitById={openHabitById}
              onToggleTodayCompletion={toggleTodayCompletion}
              onRetry={reload}
            />
          </ScrollView>

          <Pressable style={styles.fab} onPress={openCreateHabit}>
            <Plus size={30} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>

        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );
}

