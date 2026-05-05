import {
  normalizeEmail,
  validateSignInForm,
  validateSignUpForm,
} from "../validators";

describe("auth validators", () => {
  it("normalizes email by trimming and lowercasing", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("validates sign in form", () => {
    expect(
      validateSignInForm({
        email: "",
        password: "password",
      }),
    ).toBe("Email is required.");

    expect(
      validateSignInForm({
        email: "invalid-email",
        password: "password",
      }),
    ).toBe("Please enter a valid email address.");

    expect(
      validateSignInForm({
        email: "user@example.com",
        password: " ",
      }),
    ).toBe("Password is required.");

    expect(
      validateSignInForm({
        email: "user@example.com",
        password: "secret",
      }),
    ).toBeNull();
  });

  it("validates sign up form including password length and terms", () => {
    expect(
      validateSignUpForm({
        fullName: "User Name",
        email: "user@example.com",
        password: "short",
        acceptedTerms: true,
      }),
    ).toBe("Password must contain at least 8 characters.");

    expect(
      validateSignUpForm({
        fullName: "User Name",
        email: "user@example.com",
        password: "long-enough-password",
        acceptedTerms: false,
      }),
    ).toBe("Please accept Terms of Service and Privacy Policy.");

    expect(
      validateSignUpForm({
        fullName: "User Name",
        email: "user@example.com",
        password: "long-enough-password",
        acceptedTerms: true,
      }),
    ).toBeNull();
  });
});
