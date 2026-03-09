import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { routes } from "@/shared/navigation/routes";
import { colors, layout } from "@/shared/theme";

import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingSlideCard } from "../components/OnboardingSlideCard";
import { OnboardingTopBar } from "../components/OnboardingTopBar";
import { useOnboardingCarousel } from "../hooks/useOnboardingCarousel";
import { onboardingSlides } from "../model/slides";
import type { OnboardingActionKind, OnboardingSlide } from "../model/types";

const MIN_SLIDE_WIDTH = 280;

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
  } = useOnboardingCarousel({
    slideWidth,
    totalSlides: onboardingSlides.length,
  });

  const activeSlide = onboardingSlides[activeIndex] ?? onboardingSlides[0];
  const { footer, topBar } = activeSlide;
  const { primaryAction, secondaryAction } = footer;

  const finishOnboarding = useCallback(() => {
    router.replace(routes.home);
  }, [router]);

  const runAction = useCallback(
    (kind: OnboardingActionKind) => {
      if (kind === "finish") {
        finishOnboarding();
        return;
      }

      goToNextSlide();
    },
    [finishOnboarding, goToNextSlide],
  );

  const handlePrimaryPress = useCallback(() => {
    runAction(primaryAction.kind);
  }, [primaryAction.kind, runAction]);

  const handleSecondaryActionPress = useCallback(() => {
    if (!secondaryAction) {
      return;
    }

    runAction(secondaryAction.kind);
  }, [secondaryAction, runAction]);

  const renderSlide: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => <OnboardingSlideCard slide={item} slideWidth={slideWidth} />,
    [slideWidth],
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <OnboardingTopBar
            showSkip={topBar.showSkip}
            backButtonVariant={topBar.backButtonVariant}
            onBackPress={goToPreviousSlide}
            onSkipPress={finishOnboarding}
          />

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

          <OnboardingFooter
            activeIndex={activeIndex}
            totalSlides={onboardingSlides.length}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            onPrimaryPress={handlePrimaryPress}
            onSecondaryActionPress={handleSecondaryActionPress}
          />
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
});
