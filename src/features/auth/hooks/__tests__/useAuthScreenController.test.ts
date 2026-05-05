import { act, renderHook, waitFor } from "@testing-library/react-native";

import { routes } from "@/shared/navigation/routes";

import { useAuthScreenController } from "../useAuthScreenController";
import {
  loginWithEmail,
  loginWithGoogleOAuth,
  registerWithEmail,
} from "../../services/authService";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock("../../services/authService", () => ({
  loginWithEmail: jest.fn(),
  loginWithGoogleOAuth: jest.fn(),
  registerWithEmail: jest.fn(),
}));

const loginWithEmailMock = loginWithEmail as jest.MockedFunction<typeof loginWithEmail>;
const loginWithGoogleOAuthMock =
  loginWithGoogleOAuth as jest.MockedFunction<typeof loginWithGoogleOAuth>;
const registerWithEmailMock = registerWithEmail as jest.MockedFunction<typeof registerWithEmail>;

describe("useAuthScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts in sign-in mode with initial values", () => {
    const { result } = renderHook(() => useAuthScreenController());

    expect(result.current.mode).toBe("signIn");
    expect(result.current.isSignUp).toBe(false);
    expect(result.current.signInValues).toEqual({
      email: "",
      password: "",
    });
    expect(result.current.feedback).toEqual({
      kind: "idle",
      message: "",
    });
  });

  it("switches to sign-up mode and normalizes email", () => {
    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.setSignInField("email", "  USER@Example.COM ");
    });

    act(() => {
      result.current.switchToSignUp();
    });

    expect(result.current.mode).toBe("signUp");
    expect(result.current.signUpValues.email).toBe("user@example.com");
  });

  it("shows validation error and does not call login on invalid sign-in form", async () => {
    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.handlePrimaryActionPress();
    });

    await waitFor(() => {
      expect(result.current.feedback).toEqual({
        kind: "error",
        message: "Email is required.",
      });
    });

    expect(loginWithEmailMock).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submits sign-in and redirects on success", async () => {
    loginWithEmailMock.mockResolvedValue({
      status: "success",
      message: "Welcome back.",
    });

    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.setSignInField("email", "user@example.com");
      result.current.setSignInField("password", "secret");
    });

    act(() => {
      result.current.handlePrimaryActionPress();
    });

    await waitFor(() => {
      expect(loginWithEmailMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret",
      });
    });

    await waitFor(() => {
      expect(result.current.feedback).toEqual({
        kind: "success",
        message: "Welcome back.",
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(routes.profile);
  });

  it("shows service error on sign-in failure", async () => {
    loginWithEmailMock.mockResolvedValue({
      status: "error",
      message: "Invalid credentials.",
    });

    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.setSignInField("email", "user@example.com");
      result.current.setSignInField("password", "bad-password");
    });

    act(() => {
      result.current.handlePrimaryActionPress();
    });

    await waitFor(() => {
      expect(result.current.feedback).toEqual({
        kind: "error",
        message: "Invalid credentials.",
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submits sign-up and returns to sign-in when email confirmation is required", async () => {
    registerWithEmailMock.mockResolvedValue({
      status: "success",
      message: "Account created. Please confirm your email to continue.",
      requiresEmailConfirmation: true,
    });

    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.switchToSignUp();
    });

    act(() => {
      result.current.setSignUpField("fullName", "Alice Doe");
      result.current.setSignUpField("email", "  ALICE@EXAMPLE.COM ");
      result.current.setSignUpField("password", "long-enough-password");
      result.current.setSignUpField("acceptedTerms", true);
    });

    act(() => {
      result.current.handlePrimaryActionPress();
    });

    await waitFor(() => {
      expect(registerWithEmailMock).toHaveBeenCalledWith({
        fullName: "Alice Doe",
        email: "  ALICE@EXAMPLE.COM ",
        password: "long-enough-password",
        acceptedTerms: true,
      });
    });

    await waitFor(() => {
      expect(result.current.mode).toBe("signIn");
      expect(result.current.signInValues).toEqual({
        email: "alice@example.com",
        password: "",
      });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submits google oauth and redirects only on success status", async () => {
    loginWithGoogleOAuthMock.mockResolvedValue({
      status: "pending",
      message: "Continue sign-in in browser and return to the app.",
    });

    const { result } = renderHook(() => useAuthScreenController());

    act(() => {
      result.current.handleGoogleOAuthPress();
    });

    await waitFor(() => {
      expect(result.current.feedback).toEqual({
        kind: "success",
        message: "Continue sign-in in browser and return to the app.",
      });
    });
    expect(mockReplace).not.toHaveBeenCalled();

    loginWithGoogleOAuthMock.mockResolvedValue({
      status: "success",
      message: "Signed in with Google.",
    });

    act(() => {
      result.current.handleGoogleOAuthPress();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(routes.profile);
    });
  });
});
