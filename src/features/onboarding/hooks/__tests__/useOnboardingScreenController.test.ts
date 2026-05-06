import { act, renderHook, waitFor } from "@testing-library/react-native";

import { routes } from "@/shared/navigation/routes";

import { useOnboardingScreenController } from "../useOnboardingScreenController";
import { markOnboardingAsCompleted } from "../../services/onboardingStorage";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../services/onboardingStorage", () => ({
  markOnboardingAsCompleted: jest.fn(),
}));

const markOnboardingAsCompletedMock =
  markOnboardingAsCompleted as jest.MockedFunction<typeof markOnboardingAsCompleted>;

describe("useOnboardingScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markOnboardingAsCompletedMock.mockResolvedValue(undefined);
  });

  it("Given primary onboarding flow, When user advances to final slide and submits, Then onboarding is completed and user is redirected home", async () => {
    const { result } = renderHook(() => useOnboardingScreenController());

    expect(result.current.activeIndex).toBe(0);
    expect(result.current.primaryAction.kind).toBe("next");

    act(() => {
      result.current.handlePrimaryPress();
    });

    expect(result.current.activeIndex).toBe(1);
    expect(result.current.primaryAction.kind).toBe("next");

    act(() => {
      result.current.handlePrimaryPress();
    });

    expect(result.current.activeIndex).toBe(2);
    expect(result.current.primaryAction.kind).toBe("finish");

    act(() => {
      result.current.handlePrimaryPress();
    });

    await waitFor(() => {
      expect(markOnboardingAsCompletedMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(routes.home);
    });
  });
});
