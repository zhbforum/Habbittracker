import { memo } from "react";
import { Image, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { OnboardingSlide } from "../model/types";

type OnboardingSlideCardProps = {
  slide: OnboardingSlide;
  slideWidth: number;
};

function OnboardingSlideCardComponent({
  slide,
  slideWidth,
}: OnboardingSlideCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const scale = Math.min(1, slideWidth / slide.imageSize.width);
  const imageWidth = slide.imageSize.width * scale;
  const imageHeight = slide.imageSize.height * scale;

  return (
    <View style={[styles.slide, { width: slideWidth }]}>
      <View style={styles.heroSection}>
        <Image
          source={slide.image}
          style={[styles.heroImage, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
        />
      </View>

      <View style={styles.textSection}>
        <AppText style={styles.title}>{slide.title}</AppText>
        <AppText style={styles.subtitle}>{slide.subtitle}</AppText>
      </View>
    </View>
  );
}

export const OnboardingSlideCard = memo(OnboardingSlideCardComponent);

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    slide: {
      alignItems: "center",
      paddingTop: 2,
    },
    heroSection: {
      width: "100%",
      marginTop: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    heroImage: {
      borderRadius: 6,
    },
    textSection: {
      marginTop: 20,
      alignItems: "center",
      paddingHorizontal: 8,
    },
    title: {
      color: colors.textPrimary,
      textAlign: "center",
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: -0.4,
    },
    subtitle: {
      marginTop: 16,
      color: colors.textSecondary,
      textAlign: "center",
      fontSize: 16,
      lineHeight: 23,
    },
  });
}
