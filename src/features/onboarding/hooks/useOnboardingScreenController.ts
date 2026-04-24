import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useWindowDimensions } from "react-native";

import { routes } from "@/shared/navigation/routes";
import { layout } from "@/shared/theme";

import { useOnboardingCarousel } from "./useOnboardingCarousel";
import { onboardingSlides } from "../model/slides";
import type { OnboardingActionKind } from "../model/types";
import { markOnboardingAsCompleted } from "../services/onboardingStorage";

const MIN_SLIDE_WIDTH = 280;

export function useOnboardingScreenController() {
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
    void markOnboardingAsCompleted().finally(() => {
      router.replace(routes.home);
    });
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

  return {
    activeIndex,
    slideWidth,
    topBar,
    primaryAction,
    secondaryAction,
    carouselRef,
    handleScrollEnd,
    goToPreviousSlide,
    finishOnboarding,
    handlePrimaryPress,
    handleSecondaryActionPress,
  };
}
