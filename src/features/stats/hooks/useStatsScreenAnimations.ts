import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

import type { StatsSummaryRange } from "@features/stats/model/types";
import type { DayDetailsFilter } from "@features/stats/model/view";

type UseStatsScreenAnimationsArgs = {
  monthLabel: string;
  summaryRange: StatsSummaryRange;
  selectedDayDateKey: string;
  detailsFilter: DayDetailsFilter;
};

export function useStatsScreenAnimations({
  monthLabel,
  summaryRange,
  selectedDayDateKey,
  detailsFilter,
}: UseStatsScreenAnimationsArgs) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const monthContentOpacity = useRef(new Animated.Value(1)).current;
  const monthContentTranslateY = useRef(new Animated.Value(0)).current;
  const summaryContentOpacity = useRef(new Animated.Value(1)).current;
  const summaryContentTranslateY = useRef(new Animated.Value(0)).current;
  const dayContentOpacity = useRef(new Animated.Value(1)).current;
  const dayContentTranslateY = useRef(new Animated.Value(0)).current;
  const isFirstMonthRenderRef = useRef(true);
  const isFirstSummaryRenderRef = useRef(true);
  const isFirstDayRenderRef = useRef(true);
  const previousMonthLabelRef = useRef(monthLabel);
  const previousSummaryKeyRef = useRef(`${monthLabel}:${summaryRange}`);
  const previousDetailsKeyRef = useRef(`${selectedDayDateKey}:${detailsFilter}`);

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(calendarAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(detailsAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [calendarAnim, detailsAnim, headerAnim]);

  useEffect(() => {
    if (isFirstMonthRenderRef.current) {
      isFirstMonthRenderRef.current = false;
      previousMonthLabelRef.current = monthLabel;
      return;
    }

    if (previousMonthLabelRef.current === monthLabel) {
      return;
    }

    previousMonthLabelRef.current = monthLabel;
    monthContentOpacity.setValue(0);
    monthContentTranslateY.setValue(10);

    Animated.parallel([
      Animated.timing(monthContentOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(monthContentTranslateY, {
        toValue: 0,
        stiffness: 190,
        damping: 17,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [monthContentOpacity, monthContentTranslateY, monthLabel]);

  useEffect(() => {
    const nextSummaryKey = `${monthLabel}:${summaryRange}`;

    if (isFirstSummaryRenderRef.current) {
      isFirstSummaryRenderRef.current = false;
      previousSummaryKeyRef.current = nextSummaryKey;
      return;
    }

    if (previousSummaryKeyRef.current === nextSummaryKey) {
      return;
    }

    previousSummaryKeyRef.current = nextSummaryKey;
    summaryContentOpacity.setValue(0);
    summaryContentTranslateY.setValue(10);

    Animated.parallel([
      Animated.timing(summaryContentOpacity, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(summaryContentTranslateY, {
        toValue: 0,
        stiffness: 195,
        damping: 17,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [monthLabel, summaryContentOpacity, summaryContentTranslateY, summaryRange]);

  useEffect(() => {
    const currentKey = `${selectedDayDateKey}:${detailsFilter}`;

    if (isFirstDayRenderRef.current) {
      isFirstDayRenderRef.current = false;
      previousDetailsKeyRef.current = currentKey;
      return;
    }

    if (previousDetailsKeyRef.current === currentKey) {
      return;
    }

    previousDetailsKeyRef.current = currentKey;
    dayContentOpacity.setValue(0);
    dayContentTranslateY.setValue(8);

    Animated.parallel([
      Animated.timing(dayContentOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(dayContentTranslateY, {
        toValue: 0,
        stiffness: 200,
        damping: 18,
        mass: 0.95,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dayContentOpacity, dayContentTranslateY, detailsFilter, selectedDayDateKey]);

  return {
    headerAnim,
    calendarAnim,
    detailsAnim,
    monthContentStyle: {
      opacity: monthContentOpacity,
      transform: [{ translateY: monthContentTranslateY }],
    },
    summaryContentStyle: {
      opacity: summaryContentOpacity,
      transform: [{ translateY: summaryContentTranslateY }],
    },
    dayContentStyle: {
      opacity: dayContentOpacity,
      transform: [{ translateY: dayContentTranslateY }],
    },
  };
}
