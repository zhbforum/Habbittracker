import { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme";

import { OnboardingSlide } from "../model/types";

type OnboardingSlideCardProps = {
  slide: OnboardingSlide;
  slideWidth: number;
};

function OnboardingSlideCardComponent({
  slide,
  slideWidth,
}: OnboardingSlideCardProps) {
  const scale = Math.min(1, slideWidth / slide.imageWidth);
  const imageWidth = slide.imageWidth * scale;
  const imageHeight = slide.imageHeight * scale;

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
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
    </View>
  );
}

export const OnboardingSlideCard = memo(OnboardingSlideCardComponent);

const styles = StyleSheet.create({
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
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 16,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "400",
  },
});
