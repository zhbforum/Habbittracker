import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { layout, colors } from "@/shared/theme";

import { OnboardingSlideCard } from "../components/OnboardingSlideCard";
import { PaginationDots } from "../components/PaginationDots";
import { useOnboardingCarousel } from "../hooks/useOnboardingCarousel";
import { onboardingSlides } from "../model/slides";
import { OnboardingSlide } from "../model/types";

const MIN_SLIDE_WIDTH = 280;
const PRIMARY_BUTTON_LABELS = ["Next Step", "Next Step", "Start Tracking"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  const slideWidth = Math.max(
    MIN_SLIDE_WIDTH,
    Math.min(windowWidth - layout.horizontalPadding * 2, layout.maxContentWidth),
  );

  const {
    activeIndex,
    carouselRef,
    goToNextSlide,
    goToPreviousSlide,
    handleScrollEnd,
    isFirstSlide,
    isLastSlide,
  } = useOnboardingCarousel({
    slideWidth,
    totalSlides: onboardingSlides.length,
  });

  const isSecondSlide = activeIndex === 1;
  const isThirdSlide = activeIndex === onboardingSlides.length - 1;
  const primaryButtonLabel =
    PRIMARY_BUTTON_LABELS[activeIndex] ?? PRIMARY_BUTTON_LABELS[0];

  const finishOnboarding = useCallback(() => {
    router.replace("/home");
  }, [router]);

  const handlePrimaryPress = useCallback(() => {
    if (isLastSlide) {
      finishOnboarding();
      return;
    }

    goToNextSlide();
  }, [finishOnboarding, goToNextSlide, isLastSlide]);

  const renderSlide = useCallback(
    ({ item }: { item: OnboardingSlide }) => {
      return (
        <OnboardingSlideCard
          slide={item}
          slideWidth={slideWidth}
        />
      );
    },
    [slideWidth],
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            {isFirstSlide ? (
              <View style={styles.topBarSpacer} />
            ) : (
              <Pressable
                style={[styles.backButton, isThirdSlide && styles.backButtonPlain]}
                onPress={goToPreviousSlide}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </Pressable>
            )}

            <View style={styles.topBarTitleSpacer} />

            {isThirdSlide ? (
              <View style={styles.topBarSpacer} />
            ) : (
              <Pressable style={styles.skipButton} onPress={finishOnboarding}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            )}
          </View>

          <FlatList
            ref={carouselRef}
            data={onboardingSlides}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderSlide}
            onMomentumScrollEnd={handleScrollEnd}
            getItemLayout={(_, index) => ({
              length: slideWidth,
              offset: slideWidth * index,
              index,
            })}
          />

          <View style={styles.bottomSection}>
            <Pressable style={styles.primaryButton} onPress={handlePrimaryPress}>
              <View style={styles.primaryButtonContent}>
                <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
                {isSecondSlide && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textPrimary}
                  />
                )}
              </View>
            </Pressable>

            <PaginationDots
              total={onboardingSlides.length}
              activeIndex={activeIndex}
              style={styles.dotsBelowButton}
            />

            {isThirdSlide && (
              <Pressable
                style={styles.secondaryActionButton}
                onPress={finishOnboarding}
              >
                <Text style={styles.secondaryActionText}>Skip for now</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 4,
    paddingBottom: 12,
  },
  topBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  topBarTitleSpacer: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlain: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "500",
  },
  bottomSection: {
    marginTop: 12,
    alignItems: "center",
  },
  dotsBelowButton: {
    marginTop: 16,
    marginBottom: 4,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.accentPrimary,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  secondaryActionButton: {
    marginTop: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secondaryActionText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
});
