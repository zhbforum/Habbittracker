import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { AuthCredentialsSection } from "../AuthCredentialsSection";

type AuthCredentialsSectionProps = ComponentProps<typeof AuthCredentialsSection>;

function createProps(overrides: Partial<AuthCredentialsSectionProps> = {}): AuthCredentialsSectionProps {
  return {
    isSignUp: false,
    isSubmitting: false,
    feedback: {
      kind: "idle",
      message: "",
    },
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
    onSignInFieldChange: jest.fn(),
    onSignUpFieldChange: jest.fn(),
    onToggleSignInPasswordVisibility: jest.fn(),
    onToggleSignUpPasswordVisibility: jest.fn(),
    onPrimaryActionPress: jest.fn(),
    ...overrides,
  };
}

describe("AuthCredentialsSection", () => {
  it("renders sign-in state and forwards input updates", () => {
    const props = createProps({ isSignUp: false });
    render(<AuthCredentialsSection {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText("name@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Enter your password"), "secret");
    fireEvent.press(screen.getByText("Login"));

    expect(screen.getByPlaceholderText("name@example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(props.onSignInFieldChange).toHaveBeenCalledWith("email", "user@example.com");
    expect(props.onSignInFieldChange).toHaveBeenCalledWith("password", "secret");
    expect(props.onPrimaryActionPress).toHaveBeenCalledTimes(1);
  });

  it("renders sign-up state and toggles accepted terms", () => {
    const props = createProps({ isSignUp: true });
    render(<AuthCredentialsSection {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText("Enter your full name"), "Alice Doe");
    fireEvent.changeText(screen.getByPlaceholderText("example@email.com"), "alice@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Min. 8 characters"), "strong-password");
    fireEvent.press(screen.getByText(/I agree to the/i));

    expect(props.onSignUpFieldChange).toHaveBeenCalledWith("fullName", "Alice Doe");
    expect(props.onSignUpFieldChange).toHaveBeenCalledWith("email", "alice@example.com");
    expect(props.onSignUpFieldChange).toHaveBeenCalledWith("password", "strong-password");
    expect(props.onSignUpFieldChange).toHaveBeenCalledWith("acceptedTerms", true);
  });

  it("does not submit while request is in progress", () => {
    const props = createProps({
      isSignUp: true,
      isSubmitting: true,
    });
    render(<AuthCredentialsSection {...props} />);

    fireEvent.press(screen.getByText("Creating..."));

    expect(props.onPrimaryActionPress).not.toHaveBeenCalled();
  });

  it("shows feedback message when auth state is not idle", () => {
    render(
      <AuthCredentialsSection
        {...createProps({
          feedback: {
            kind: "error",
            message: "Invalid email or password.",
          },
        })}
      />,
    );

    expect(screen.getByText("Invalid email or password.")).toBeTruthy();
  });
});
