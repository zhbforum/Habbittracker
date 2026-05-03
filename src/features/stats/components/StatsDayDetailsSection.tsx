import { ActivityIndicator, Animated, Pressable, View } from "react-native";
import { Check } from "lucide-react-native";

import { getHabitIconById, getHabitIconColorById } from "@entities/habit/model/icons";
import type { ThemeColors } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import type { StatsDayDetails } from "@features/stats/model/types";
import {
  DAY_DETAILS_FILTERS,
  type DayDetailsFilter,
} from "@features/stats/model/view";
import type { StatsScreenStyles } from "@features/stats/screens/StatsScreen.styles";

type StatsDayDetailsSectionProps = {
  styles: StatsScreenStyles;
  colors: ThemeColors;
  selectedDayDetails: StatsDayDetails;
  selectedDayLoggedValue: number;
  detailsFilter: DayDetailsFilter;
  completedCountLabel: string;
  isLoading: boolean;
  filteredHabits: StatsDayDetails["habits"];
  filteredGroups: StatsDayDetails["groups"];
  dayContentStyle: {
    opacity: Animated.Value;
    transform: { translateY: Animated.Value }[];
  };
  onSelectFilter: (filter: DayDetailsFilter) => void;
  onOpenHabitById: (habitId: string) => void;
  onOpenGroupById: (groupId: string) => void;
};

export function StatsDayDetailsSection({
  styles,
  colors,
  selectedDayDetails,
  selectedDayLoggedValue,
  detailsFilter,
  completedCountLabel,
  isLoading,
  filteredHabits,
  filteredGroups,
  dayContentStyle,
  onSelectFilter,
  onOpenHabitById,
  onOpenGroupById,
}: StatsDayDetailsSectionProps) {
  return (
    <View style={styles.dayDetailsCard}>
      <View style={styles.dayDetailsHeader}>
        <View style={styles.dayDetailsHeaderTextWrap}>
          <AppText style={styles.dayDetailsTitle}>{selectedDayDetails.dateLabel}</AppText>
          <AppText style={styles.dayDetailsSubtitle}>
            Habits {selectedDayDetails.completedHabitsCount}/
            {selectedDayDetails.scheduledHabitsCount} | Groups{" "}
            {selectedDayDetails.completedGroupsCount}/
            {selectedDayDetails.scheduledGroupsCount} | Logged value {selectedDayLoggedValue}
          </AppText>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {DAY_DETAILS_FILTERS.map((filterOption) => {
          const isActive = detailsFilter === filterOption.id;

          return (
            <Pressable
              key={filterOption.id}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => onSelectFilter(filterOption.id)}
            >
              <AppText
                style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}
              >
                {filterOption.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText style={styles.filterHintText}>{completedCountLabel}</AppText>

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={colors.textPrimary} />
          <AppText style={styles.loaderText}>Loading stats...</AppText>
        </View>
      ) : (
        <Animated.View style={dayContentStyle}>
          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>Habits</AppText>

            {filteredHabits.length === 0 ? (
              <View style={styles.emptyBlock}>
                <AppText style={styles.emptyText}>
                  No habits for this filter on this day.
                </AppText>
              </View>
            ) : (
              <View style={styles.rowsList}>
                {filteredHabits.map((habit) => {
                  const HabitIcon = getHabitIconById(habit.iconId);
                  const iconTint = getHabitIconColorById(habit.iconColorId);

                  return (
                    <Pressable
                      key={habit.id}
                      style={styles.activityRow}
                      onPress={() => onOpenHabitById(habit.id)}
                    >
                      <View style={styles.activityIconWrap}>
                        <HabitIcon size={16} color={iconTint} strokeWidth={2.3} />
                      </View>

                      <View style={styles.activityIdentity}>
                        <AppText style={styles.activityName}>{habit.name}</AppText>
                        <AppText style={styles.activityMeta}>
                          {habit.goalMetric === "value"
                            ? `${Math.round(habit.loggedValue * 100) / 100} ${habit.goalUnit} logged | ${habit.goalProgressPercent}% of goal`
                            : habit.isCompleted
                              ? "Completed"
                              : habit.isScheduled
                                ? "Scheduled, not completed"
                                : "Completed outside schedule"}
                        </AppText>
                      </View>

                      {habit.isCompleted ? (
                        <View style={styles.doneChip}>
                          <Check size={13} color={colors.successText} strokeWidth={2.4} />
                          <AppText style={styles.doneChipText}>
                            {habit.goalMetric === "value" ? "Target hit" : "Done"}
                          </AppText>
                        </View>
                      ) : (
                        <View style={styles.pendingChip}>
                          <AppText style={styles.pendingChipText}>
                            {habit.goalMetric === "value"
                              ? `${Math.round(habit.loggedValue * 100) / 100}/${habit.goalTarget}`
                              : "Pending"}
                          </AppText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>Groups</AppText>

            {filteredGroups.length === 0 ? (
              <View style={styles.emptyBlock}>
                <AppText style={styles.emptyText}>
                  No groups for this filter on this day.
                </AppText>
              </View>
            ) : (
              <View style={styles.rowsList}>
                {filteredGroups.map((group) => {
                  const GroupIcon = getHabitIconById(group.iconId);

                  return (
                    <Pressable
                      key={group.id}
                      style={styles.activityRow}
                      onPress={() => onOpenGroupById(group.id)}
                    >
                      <View style={styles.activityIconWrap}>
                        <GroupIcon size={16} color={colors.accentText} strokeWidth={2.3} />
                      </View>

                      <View style={styles.activityIdentity}>
                        <AppText style={styles.activityName}>{group.name}</AppText>
                        <AppText style={styles.activityMeta}>
                          {group.targetCount === 0
                            ? "No scheduled habits in this group"
                            : `${group.completedHabitsCount}/${group.targetCount} to daily goal`}
                        </AppText>
                      </View>

                      {group.isCompleted ? (
                        <View style={styles.doneChip}>
                          <Check size={13} color={colors.successText} strokeWidth={2.4} />
                          <AppText style={styles.doneChipText}>Goal hit</AppText>
                        </View>
                      ) : (
                        <View style={styles.pendingChip}>
                          <AppText style={styles.pendingChipText}>In progress</AppText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

