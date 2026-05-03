import { Flame } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

import type { HomeScreenStyles } from "@features/home/screens/HomeScreen.styles";
import type { ThemeColors } from "@shared/theme";
import { AppText } from "@shared/ui";

type HomeProgress = {
  completedCount: number;
  totalCount: number;
  percent: number;
  message: string;
};

type HomeProgressCardProps = {
  styles: HomeScreenStyles;
  colors: ThemeColors;
  progress: HomeProgress;
};

export function HomeProgressCard({ styles, colors, progress }: HomeProgressCardProps) {
  const progressFillWidth = useRef(new Animated.Value(0)).current;
  const flameGlowOpacity = useRef(new Animated.Value(0)).current;
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const isAllDoneForToday = progress.totalCount > 0 && progress.percent === 100;
  const flameTintColor = isAllDoneForToday ? "#F3A73B" : colors.accentText;

  useEffect(() => {
    if (progressTrackWidth <= 0) {
      return;
    }

    const nextWidth = (Math.max(0, Math.min(100, progress.percent)) / 100) * progressTrackWidth;

    Animated.timing(progressFillWidth, {
      toValue: nextWidth,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress.percent, progressFillWidth, progressTrackWidth]);

  useEffect(() => {
    Animated.timing(flameGlowOpacity, {
      toValue: isAllDoneForToday ? 0.62 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [flameGlowOpacity, isAllDoneForToday]);

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeaderRow}>
        <View>
          <AppText style={styles.progressTitle}>Daily Progress</AppText>
          <AppText style={styles.progressMeta}>
            {progress.completedCount} of {progress.totalCount} habits completed
          </AppText>
        </View>
        <View style={styles.progressIconWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.progressIconAuraOuter,
              {
                opacity: flameGlowOpacity,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.progressIconAuraInner,
              {
                opacity: flameGlowOpacity,
              },
            ]}
          />
          <Flame size={20} color={flameTintColor} strokeWidth={2.3} />
        </View>
      </View>

      <View style={styles.progressStatusRow}>
        <AppText style={styles.progressMessage}>{progress.message}</AppText>
        <AppText style={styles.progressPercent}>{progress.percent}%</AppText>
      </View>

      <View
        style={styles.progressTrack}
        onLayout={(event) => {
          setProgressTrackWidth(event.nativeEvent.layout.width);
        }}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressFillWidth,
            },
          ]}
        />
      </View>
    </View>
  );
}
