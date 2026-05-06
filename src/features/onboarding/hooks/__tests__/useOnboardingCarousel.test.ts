import { act, renderHook } from "@testing-library/react-native";

import { useOnboardingCarousel } from "../useOnboardingCarousel";

type ScrollToOffsetArg = {
  offset: number;
  animated: boolean;
};

function createScrollEvent(offsetX: number) {
  return {
    nativeEvent: {
      contentOffset: { x: offsetX, y: 0 },
      contentSize: { width: 0, height: 0 },
      layoutMeasurement: { width: 0, height: 0 },
      velocity: { x: 0, y: 0 },
      zoomScale: 1,
      target: 0,
      responderIgnoreScroll: false,
    },
  } as const;
}

describe("useOnboardingCarousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given the first slide, When navigating previous, Then index stays at 0", () => {
    const { result } = renderHook(() =>
      useOnboardingCarousel({
        slideWidth: 320,
        totalSlides: 3,
      }),
    );

    const scrollToOffset = jest.fn<void, [ScrollToOffsetArg]>();
    result.current.carouselRef.current = {
      scrollToOffset,
    } as never;

    act(() => {
      result.current.goToPreviousSlide();
    });

    expect(result.current.activeIndex).toBe(0);
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it("Given the last slide, When navigating next, Then index stays at the last position", () => {
    const { result } = renderHook(() =>
      useOnboardingCarousel({
        slideWidth: 320,
        totalSlides: 3,
      }),
    );

    const scrollToOffset = jest.fn<void, [ScrollToOffsetArg]>();
    result.current.carouselRef.current = {
      scrollToOffset,
    } as never;

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(320 * 2) as never);
    });

    scrollToOffset.mockClear();

    act(() => {
      result.current.goToNextSlide();
    });

    expect(result.current.activeIndex).toBe(2);
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it("Given out-of-range scroll offsets, When handling scroll end, Then active index is clamped", () => {
    const { result } = renderHook(() =>
      useOnboardingCarousel({
        slideWidth: 300,
        totalSlides: 3,
      }),
    );

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(-700) as never);
    });
    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(10_000) as never);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it("Given a scroll offset between slides, When handling scroll end, Then index is calculated with rounding", () => {
    const { result } = renderHook(() =>
      useOnboardingCarousel({
        slideWidth: 300,
        totalSlides: 4,
      }),
    );

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(449) as never);
    });

    expect(result.current.activeIndex).toBe(1);

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(451) as never);
    });

    expect(result.current.activeIndex).toBe(2);
  });

  it("Given active slide is preserved, When slide width changes, Then list is re-positioned to the current index", () => {
    const { result, rerender } = renderHook(
      ({ slideWidth, totalSlides }: { slideWidth: number; totalSlides: number }) =>
        useOnboardingCarousel({
          slideWidth,
          totalSlides,
        }),
      {
        initialProps: {
          slideWidth: 300,
          totalSlides: 4,
        },
      },
    );

    const scrollToOffset = jest.fn<void, [ScrollToOffsetArg]>();
    result.current.carouselRef.current = {
      scrollToOffset,
    } as never;

    act(() => {
      result.current.handleScrollEnd(createScrollEvent(600) as never);
    });

    scrollToOffset.mockClear();

    rerender({
      slideWidth: 360,
      totalSlides: 4,
    });

    expect(result.current.activeIndex).toBe(2);
    expect(scrollToOffset).toHaveBeenCalledWith({
      offset: 720,
      animated: false,
    });
  });
});
