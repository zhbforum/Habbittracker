import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

type TimeWheelColumnProps = {
  values: readonly number[];
  selectedValue: number;
  keyPrefix: string;
  itemHeight: number;
  edgePadding: number;
  onPreviewChange: (value: number) => void;
  onFinalize: (value: number) => void;
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getIndexFromOffset(offsetY: number, itemHeight: number, maxIndex: number): number {
  return clamp(Math.round(offsetY / itemHeight), 0, maxIndex);
}

export function TimeWheelColumn({
  values,
  selectedValue,
  keyPrefix,
  itemHeight,
  edgePadding,
  onPreviewChange,
  onFinalize,
}: TimeWheelColumnProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, itemHeight, edgePadding),
    [colors, edgePadding, itemHeight],
  );
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    const selectedIndex = Math.max(values.indexOf(selectedValue), 0);
    listRef.current?.scrollTo({
      y: selectedIndex * itemHeight,
      animated: false,
    });
  }, [itemHeight, selectedValue, values]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const targetIndex = getIndexFromOffset(
        event.nativeEvent.contentOffset.y,
        itemHeight,
        values.length - 1,
      );
      onPreviewChange(values[targetIndex] ?? values[0] ?? 0);
    },
    [itemHeight, onPreviewChange, values],
  );

  const finalizeScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const targetIndex = getIndexFromOffset(
        event.nativeEvent.contentOffset.y,
        itemHeight,
        values.length - 1,
      );
      const nextValue = values[targetIndex] ?? values[0] ?? 0;

      onPreviewChange(nextValue);
      listRef.current?.scrollTo({
        y: targetIndex * itemHeight,
        animated: true,
      });
      onFinalize(nextValue);
    },
    [itemHeight, onFinalize, onPreviewChange, values],
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityY = event.nativeEvent.velocity?.y ?? 0;

      if (Math.abs(velocityY) > 0.08) {
        return;
      }

      finalizeScroll(event);
    },
    [finalizeScroll],
  );

  return (
    <ScrollView
      ref={listRef}
      style={styles.wheel}
      contentContainerStyle={styles.wheelContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="normal"
      snapToInterval={itemHeight}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onMomentumScrollEnd={finalizeScroll}
      onScrollEndDrag={handleScrollEndDrag}
      bounces={false}
    >
      {values.map((value) => {
        const isSelected = value === selectedValue;

        return (
          <View key={`${keyPrefix}-${value}`} style={styles.item}>
            <AppText style={[styles.itemText, isSelected && styles.itemTextSelected]}>
              {pad(value)}
            </AppText>
          </View>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors, itemHeight: number, edgePadding: number) {
  return StyleSheet.create({
    wheel: {
      flex: 1,
    },
    wheelContent: {
      paddingVertical: edgePadding,
    },
    item: {
      height: itemHeight,
      alignItems: "center",
      justifyContent: "center",
    },
    itemText: {
      color: colors.textMuted,
      fontSize: 20,
      lineHeight: 24,
      includeFontPadding: false,
    },
    itemTextSelected: {
      color: colors.textPrimary,
      fontSize: 33,
      lineHeight: 36,
      includeFontPadding: false,
    },
  });
}
