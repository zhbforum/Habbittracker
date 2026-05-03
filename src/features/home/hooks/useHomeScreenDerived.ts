import { useMemo } from "react";

import { isHabitScheduledOnDate, withHabitMetrics } from "@entities/habit/model/analytics";
import { withHabitGroupMetrics } from "@entities/habit/model/groupAnalytics";
import type { Habit, HabitGroup } from "@entities/habit/model/types";

import { getDayPeriodGreeting, resolveHomeDayPeriod } from "../model/dayPeriod";

function buildProgressMessage(progressPercent: number, totalCount: number): string {
  if (totalCount === 0) {
    return "No habits scheduled for today.";
  }

  if (progressPercent >= 100) {
    return "All done for today.";
  }

  if (progressPercent >= 80) {
    return "Almost done. Keep the pace!";
  }

  if (progressPercent >= 50) {
    return "Great momentum. You're on track!";
  }

  if (progressPercent > 0) {
    return "Nice start. Keep going!";
  }

  return "Let's begin today's run.";
}

type UseHomeScreenDerivedArgs = {
  habits: Habit[];
  groups: HabitGroup[];
  now: Date;
};

export function useHomeScreenDerived({ habits, groups, now }: UseHomeScreenDerivedArgs) {
  const habitsWithMetrics = useMemo(() => withHabitMetrics(habits, now), [habits, now]);

  const todayHabits = useMemo(() => {
    return habitsWithMetrics.filter((habit) => isHabitScheduledOnDate(habit, now));
  }, [habitsWithMetrics, now]);

  const groupsWithMetrics = useMemo(() => {
    const phaseRank: Record<"active" | "before_start" | "after_end", number> = {
      active: 0,
      before_start: 1,
      after_end: 2,
    };

    return withHabitGroupMetrics(groups, habitsWithMetrics, now).sort((left, right) => {
      const leftScheduleRank = left.metrics.isScheduledToday
        ? 0
        : left.metrics.isWithinDateRange
          ? 1
          : 2;
      const rightScheduleRank = right.metrics.isScheduledToday
        ? 0
        : right.metrics.isWithinDateRange
          ? 1
          : 2;
      const scheduleDiff = leftScheduleRank - rightScheduleRank;

      if (scheduleDiff !== 0) {
        return scheduleDiff;
      }

      const phaseDiff = phaseRank[left.metrics.sessionPhase] - phaseRank[right.metrics.sessionPhase];

      if (phaseDiff !== 0) {
        return phaseDiff;
      }

      if (left.metrics.isCompletedToday !== right.metrics.isCompletedToday) {
        return left.metrics.isCompletedToday ? 1 : -1;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }, [groups, habitsWithMetrics, now]);

  const scheduledGroupsToday = useMemo(
    () => groupsWithMetrics.filter((group) => group.metrics.isScheduledToday),
    [groupsWithMetrics],
  );

  const todayGroups = useMemo(() => scheduledGroupsToday.slice(0, 3), [scheduledGroupsToday]);

  const completedHabitsCount = useMemo(
    () => todayHabits.filter((habit) => habit.metrics.completedToday).length,
    [todayHabits],
  );

  const progressPercent = useMemo(() => {
    if (todayHabits.length === 0) {
      return 0;
    }

    return Math.round((completedHabitsCount / todayHabits.length) * 100);
  }, [completedHabitsCount, todayHabits.length]);

  const dayPeriod = useMemo(() => resolveHomeDayPeriod(now), [now]);
  const greeting = useMemo(() => getDayPeriodGreeting(dayPeriod), [dayPeriod]);

  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [now],
  );

  return {
    todayHabits,
    todayGroups,
    hasAnyGroups: groupsWithMetrics.length > 0,
    hasMoreGroups: scheduledGroupsToday.length > todayGroups.length,
    greeting,
    dateLabel,
    progress: {
      completedCount: completedHabitsCount,
      totalCount: todayHabits.length,
      percent: progressPercent,
      message: buildProgressMessage(progressPercent, todayHabits.length),
    },
  };
}
