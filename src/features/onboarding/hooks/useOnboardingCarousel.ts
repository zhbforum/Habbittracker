import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { OnboardingSlide } from "../model/types";

type UseOnboardingCarouselParams = {
  slideWidth: number;
  totalSlides: number;
};

export function useOnboardingCarousel({
  slideWidth,
  totalSlides,
}: UseOnboardingCarouselParams) {
  const carouselRef = useRef<FlatList<OnboardingSlide>>(null);
  const previousSlideWidthRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const lastSlideIndex = Math.max(totalSlides - 1, 0);
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === lastSlideIndex;

  useEffect(() => {
    if (previousSlideWidthRef.current === 0) {
      previousSlideWidthRef.current = slideWidth;
      return;
    }

    if (previousSlideWidthRef.current !== slideWidth) {
      previousSlideWidthRef.current = slideWidth;
      carouselRef.current?.scrollToOffset({
        offset: activeIndex * slideWidth,
        animated: false,
      });
    }
  }, [activeIndex, slideWidth]);

  const clampIndex = useCallback(
    (index: number) => {
      return Math.min(Math.max(index, 0), lastSlideIndex);
    },
    [lastSlideIndex],
  );

  const goToSlide = useCallback(
    (index: number) => {
      const normalized = clampIndex(index);
      carouselRef.current?.scrollToOffset({
        offset: normalized * slideWidth,
        animated: true,
      });
      setActiveIndex(normalized);
    },
    [clampIndex, slideWidth],
  );

  const goToNextSlide = useCallback(() => {
    if (isLastSlide || totalSlides <= 1) {
      return;
    }

    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide, isLastSlide, totalSlides]);

  const goToPreviousSlide = useCallback(() => {
    if (isFirstSlide) {
      return;
    }

    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide, isFirstSlide]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / slideWidth);
      setActiveIndex(clampIndex(nextIndex));
    },
    [clampIndex, slideWidth],
  );

  return {
    activeIndex,
    carouselRef,
    goToNextSlide,
    goToPreviousSlide,
    handleScrollEnd,
  };
}
