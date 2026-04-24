import { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { normalizeTime } from "../model/date";
import { TimeWheelColumn } from "./TimeWheelColumn";

const ITEM_HEIGHT = 38;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const EDGE_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

type TimeWheelPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function TimeWheelPicker({ value, onChange }: TimeWheelPickerProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const normalizedTime = normalizeTime(value) || "20:00";
  const [selectedHours, selectedMinutes] = useMemo(
    () => normalizedTime.split(":").map((part) => Number(part)),
    [normalizedTime],
  );
  const [previewHours, setPreviewHours] = useState(selectedHours);
  const [previewMinutes, setPreviewMinutes] = useState(selectedMinutes);

  useEffect(() => {
    setPreviewHours(selectedHours);
    setPreviewMinutes(selectedMinutes);
  }, [selectedHours, selectedMinutes]);

  const emitTime = useCallback(
    (hours: number, minutes: number) => {
      const nextValue = `${pad(hours)}:${pad(minutes)}`;

      if (nextValue !== normalizedTime) {
        onChange(nextValue);
      }
    },
    [normalizedTime, onChange],
  );

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.selectionOverlay} />

      <TimeWheelColumn
        values={HOURS}
        selectedValue={previewHours}
        keyPrefix="hours"
        itemHeight={ITEM_HEIGHT}
        edgePadding={EDGE_PADDING}
        onPreviewChange={setPreviewHours}
        onFinalize={(nextHours) => emitTime(nextHours, previewMinutes)}
      />

      <View style={styles.separatorWrap}>
        <AppText style={styles.separator}>:</AppText>
      </View>

      <TimeWheelColumn
        values={MINUTES}
        selectedValue={previewMinutes}
        keyPrefix="minutes"
        itemHeight={ITEM_HEIGHT}
        edgePadding={EDGE_PADDING}
        onPreviewChange={setPreviewMinutes}
        onFinalize={(nextMinutes) => emitTime(previewHours, nextMinutes)}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      height: PICKER_HEIGHT,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    },
    separatorWrap: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    separator: {
      color: colors.textPrimary,
      fontSize: 30,
      lineHeight: 36,
    },
    selectionOverlay: {
      position: "absolute",
      left: 8,
      right: 8,
      top: EDGE_PADDING,
      height: ITEM_HEIGHT,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.accentText,
      backgroundColor: "transparent",
      zIndex: 1,
    },
  });
}
