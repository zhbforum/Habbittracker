import { appImages } from "@/shared/assets/images";

import { OnboardingSlide } from "./types";

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "focus",
    title: "Track your way to\na better you",
    subtitle:
      "Build lasting habits and watch yourself grow with our simple, calm tracking tools. Designed for peace of mind.",
    image: appImages.onboardingFlower,
    imageWidth: 273.59,
    imageHeight: 273.59,
  },
  {
    id: "progress",
    title: "Track Your Progress",
    subtitle:
      "Visualize your consistency with detailed statistics and heatmaps.",
    image: appImages.onboardingStats,
    imageWidth: 360,
    imageHeight: 300,
  },
  {
    id: "motivation",
    title: "Stay Motivated",
    subtitle:
      "Build long-term streaks and earn achievements as you reach your goals.",
    image: appImages.onboardingTrophy,
    imageWidth: 360,
    imageHeight: 300,
  },
];
