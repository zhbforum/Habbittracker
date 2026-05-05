import { fireEvent, render, screen } from "@testing-library/react-native";

import { useAuthScreenController } from "@/features/auth/hooks/useAuthScreenController";
import AuthScreen from "../AuthScreen";

jest.mock("@/features/auth/hooks/useAuthScreenController", () => ({
  useAuthScreenController: jest.fn(),
}));

const mockedUseAuthScreenController =
  useAuthScreenController as jest.MockedFunction<typeof useAuthScreenController>;

describe("AuthScreen smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crash and handles primary action", () => {
    const handlePrimaryActionPress = jest.fn();

    mockedUseAuthScreenController.mockReturnValue({
      mode: "signIn",
      isSignUp: false,
      feedback: { kind: "idle", message: "" },
      isSubmitting: false,
      signInValues: { email: "", password: "" },
      signUpValues: {
        fullName: "",
        email: "",
        password: "",
        acceptedTerms: false,
      },
      isSignInPasswordVisible: false,
      isSignUpPasswordVisible: false,
      setSignInField: jest.fn(),
      setSignUpField: jest.fn(),
      setIsSignInPasswordVisible: jest.fn(),
      setIsSignUpPasswordVisible: jest.fn(),
      handlePrimaryActionPress,
      handleGoogleOAuthPress: jest.fn(),
      switchToSignIn: jest.fn(),
      switchToSignUp: jest.fn(),
    });

    render(<AuthScreen />);

    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    fireEvent.press(screen.getByText("Login"));
    expect(handlePrimaryActionPress).toHaveBeenCalledTimes(1);
  });
});
