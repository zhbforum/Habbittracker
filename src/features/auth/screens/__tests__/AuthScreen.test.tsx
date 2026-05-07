import { fireEvent, render, screen } from "@testing-library/react-native";

import { useAuthScreenController } from "@/features/auth/hooks/useAuthScreenController";
import AuthScreen from "../AuthScreen";

jest.mock("@/features/auth/hooks/useAuthScreenController", () => ({
  useAuthScreenController: jest.fn(),
}));

const mockedUseAuthScreenController =
  useAuthScreenController as jest.MockedFunction<
    typeof useAuthScreenController
  >;

function mockController(
  overrides: Partial<ReturnType<typeof useAuthScreenController>> = {},
) {
  const controller = {
    mode: "signIn",
    isSignUp: false,
    feedback: { kind: "idle", message: "" },
    isSubmitting: false,
    signInValues: {
      email: "",
      password: "",
    },
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
    handlePrimaryActionPress: jest.fn(),
    handleGoogleOAuthPress: jest.fn(),
    switchToSignIn: jest.fn(),
    switchToSignUp: jest.fn(),
    ...overrides,
  } as ReturnType<typeof useAuthScreenController>;

  mockedUseAuthScreenController.mockReturnValue(controller);

  return controller;
}

describe("AuthScreen smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sign in screen and handles primary action", () => {
    const controller = mockController();

    render(<AuthScreen />);

    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();

    fireEvent.press(screen.getByText("Login"));

    expect(controller.handlePrimaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("renders sign up screen and handles primary action", () => {
    const controller = mockController({
      mode: "signUp",
      isSignUp: true,
      signUpValues: {
        fullName: "",
        email: "",
        password: "",
        acceptedTerms: false,
      },
    });

    render(<AuthScreen />);

    const createAccountButtons = screen.getAllByText("Create Account");

    fireEvent.press(createAccountButtons[createAccountButtons.length - 1]);

    expect(controller.handlePrimaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("handles google auth press", () => {
    const controller = mockController();

    render(<AuthScreen />);

    fireEvent.press(screen.getByText("Google"));

    expect(controller.handleGoogleOAuthPress).toHaveBeenCalledTimes(1);
  });

  it("handles switch to sign up", () => {
    const controller = mockController({
      isSignUp: false,
    });

    render(<AuthScreen />);

    fireEvent.press(screen.getByText("Sign up for free"));

    expect(controller.switchToSignUp).toHaveBeenCalledTimes(1);
  });

  it("handles switch back to sign in from sign up mode", () => {
    const controller = mockController({
      mode: "signUp",
      isSignUp: true,
    });

    render(<AuthScreen />);

    fireEvent.press(screen.getByText("Log In"));

    expect(controller.switchToSignIn).toHaveBeenCalled();
  });

  it("handles sign in password visibility toggle", () => {
    const setIsSignInPasswordVisible = jest.fn();

    mockController({
      isSignUp: false,
      isSignInPasswordVisible: false,
      setIsSignInPasswordVisible,
    });

    render(<AuthScreen />);

    fireEvent.press(screen.getByLabelText("Show sign in password"));

    expect(setIsSignInPasswordVisible).toHaveBeenCalledTimes(1);

    const updater = setIsSignInPasswordVisible.mock.calls[0][0] as (
      value: boolean,
    ) => boolean;

    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it("handles sign up password visibility toggle", () => {
    const setIsSignUpPasswordVisible = jest.fn();

    mockController({
      mode: "signUp",
      isSignUp: true,
      isSignUpPasswordVisible: false,
      setIsSignUpPasswordVisible,
    });

    render(<AuthScreen />);

    fireEvent.press(screen.getByLabelText("Show sign up password"));

    expect(setIsSignUpPasswordVisible).toHaveBeenCalledTimes(1);

    const updater = setIsSignUpPasswordVisible.mock.calls[0][0] as (
      value: boolean,
    ) => boolean;

    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });
});
