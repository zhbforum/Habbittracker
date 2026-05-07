import { Image } from "react-native";
import { render, screen } from "@testing-library/react-native";

import { OnboardingSlideCard } from "../OnboardingSlideCard";

describe("OnboardingSlideCard", () => {
  it("Given slide and width smaller than image, When rendering slide card, Then it scales image dimensions proportionally", () => {
    const slide = {
      id: "slide-1",
      title: "Welcome",
      subtitle: "Build your first routine",
      image: { uri: "https://example.com/hero.png" },
      imageSize: {
        width: 300,
        height: 180,
      },
      topBar: {
        showSkip: true,
        backButtonVariant: "hidden" as const,
      },
      footer: {
        primaryAction: { label: "Next", kind: "next" as const },
      },
    };

    const { UNSAFE_getByType } = render(
      <OnboardingSlideCard slide={slide} slideWidth={150} />,
    );

    const image = UNSAFE_getByType(Image);

    expect(screen.getByText("Welcome")).toBeTruthy();
    expect(screen.getByText("Build your first routine")).toBeTruthy();
    expect(image.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 150,
          height: 90,
        }),
      ]),
    );
  });

  it("Given slide width larger than source width, When rendering slide card, Then image size is capped by original dimensions", () => {
    const slide = {
      id: "slide-2",
      title: "Track",
      subtitle: "Measure daily progress",
      image: { uri: "https://example.com/hero-2.png" },
      imageSize: {
        width: 240,
        height: 120,
      },
      topBar: {
        showSkip: false,
        backButtonVariant: "filled" as const,
      },
      footer: {
        primaryAction: { label: "Done", kind: "finish" as const },
      },
    };

    const { UNSAFE_getByType } = render(
      <OnboardingSlideCard slide={slide} slideWidth={420} />,
    );

    const image = UNSAFE_getByType(Image);

    expect(image.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 240,
          height: 120,
        }),
      ]),
    );
  });
});
