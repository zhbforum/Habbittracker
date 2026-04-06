import { appImages } from "@/shared/assets/images";

import { OnboardingSlide } from "./types";

export const onboardingSlides: readonly OnboardingSlide[] = [
  {
    id: "focus",
    title: "Track your way to\na better you",
    subtitle:
      "Build lasting habits and watch yourself grow with our simple, calm tracking tools. Designed for peace of mind.",
    image: appImages.onboardingFlower,
    imageSize: {
      width: 273.59,
      height: 273.59,
    },
    topBar: {
      showSkip: true,
      backButtonVariant: "hidden",
    },
    footer: {
      primaryAction: {
        label: "Next Step",
        kind: "next",
        showArrow: true,
      },
    },
  },
  {
    id: "progress",
    title: "Track Your Progress",
    subtitle:
      "Visualize your consistency with detailed statistics and heatmaps.",
    image: appImages.onboardingStats,
    imageSize: {
      width: 360,
      height: 300,
    },
    topBar: {
      showSkip: true,
      backButtonVariant: "plain",
    },
    footer: {
      primaryAction: {
        label: "Next Step",
        kind: "next",
        showArrow: true,
      },
    },
  },
  {
    id: "motivation",
    title: "Stay Motivated",
    subtitle:
      "Build long-term streaks and earn achievements as you reach your goals.",
    image: appImages.onboardingTrophy,
    imageSize: {
      width: 360,
      height: 300,
    },
    topBar: {
      showSkip: false,
      backButtonVariant: "plain",
    },
    footer: {
      primaryAction: {
        label: "Start Tracking",
        kind: "finish",
      },
    },
  },
];
