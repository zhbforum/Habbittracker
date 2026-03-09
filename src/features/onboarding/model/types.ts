import { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  imageWidth: number;
  imageHeight: number;
};
