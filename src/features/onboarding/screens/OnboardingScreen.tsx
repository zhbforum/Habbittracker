import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ThemeColors } from "@/shared/theme";
import { layout, useAppTheme } from "@/shared/theme";

import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingSlideCard } from "../components/OnboardingSlideCard";
import { OnboardingTopBar } from "../components/OnboardingTopBar";
import { useOnboardingScreenController } from "../hooks/useOnboardingScreenController";
import { onboardingSlides } from "../model/slides";
import type { OnboardingSlide } from "../model/types";

export default function OnboardingScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors);

  const {
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
  } = useOnboardingScreenController();

  const renderSlide: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => <OnboardingSlideCard slide={item} slideWidth={slideWidth} />,
    [slideWidth],
  );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
}
