import { ImageSourcePropType } from "react-native";

export type OnboardingBackButtonVariant = "hidden" | "filled" | "plain";

export type OnboardingActionKind = "next" | "finish";

export type OnboardingPrimaryAction = {
  label: string;
  kind: OnboardingActionKind;
  showArrow?: boolean;
};

export type OnboardingSecondaryAction = {
  label: string;
  kind: OnboardingActionKind;
};

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  imageSize: {
    width: number;
    height: number;
  };
  topBar: {
    showSkip: boolean;
    backButtonVariant: OnboardingBackButtonVariant;
  };
  footer: {
    primaryAction: OnboardingPrimaryAction;
    secondaryAction?: OnboardingSecondaryAction;
  };
};
