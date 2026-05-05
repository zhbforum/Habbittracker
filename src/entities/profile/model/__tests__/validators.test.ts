import {
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
  PROFILE_USERNAME_MIN_LENGTH,
} from "../constants";
import {
  normalizeUsername,
  sanitizeBio,
  sanitizeName,
  validateBio,
  validateName,
  validateProfileFormValues,
  validateUsername,
} from "../validators";

describe("profile validators", () => {
  it("normalizes username and sanitizes text fields", () => {
    expect(normalizeUsername("  Alice_User  ")).toBe("alice_user");
    expect(sanitizeName("  Alice   Doe  ")).toBe("Alice Doe");
    expect(sanitizeBio("  building   habits   daily  ")).toBe("building habits daily");
  });

  it("validates name rules", () => {
    expect(validateName("   ")).toBe("Name is required.");
    expect(validateName("a".repeat(PROFILE_NAME_MAX_LENGTH + 1))).toBe(
      `Name must be at most ${PROFILE_NAME_MAX_LENGTH} characters.`,
    );
    expect(validateName("Alice Doe")).toBeNull();
  });

  it("validates username rules with normalization", () => {
    expect(validateUsername("   ")).toBe("Username is required.");
    expect(validateUsername("a".repeat(PROFILE_USERNAME_MIN_LENGTH - 1))).toBe(
      `Username must be at least ${PROFILE_USERNAME_MIN_LENGTH} characters.`,
    );
    expect(validateUsername("a".repeat(PROFILE_USERNAME_MAX_LENGTH + 1))).toBe(
      `Username must be at most ${PROFILE_USERNAME_MAX_LENGTH} characters.`,
    );
    expect(validateUsername("john-doe")).toBe(
      "Use only lowercase letters, numbers, and underscores.",
    );
    expect(validateUsername("  John_Doe123 ")).toBeNull();
  });

  it("validates bio max length", () => {
    expect(validateBio("a".repeat(PROFILE_BIO_MAX_LENGTH + 1))).toBe(
      `Bio must be at most ${PROFILE_BIO_MAX_LENGTH} characters.`,
    );
    expect(validateBio("Consistency over intensity")).toBeNull();
  });

  it("validates profile form values in order: name -> username -> bio", () => {
    expect(
      validateProfileFormValues({
        name: " ",
        username: "ab",
        bio: "a".repeat(PROFILE_BIO_MAX_LENGTH + 1),
      }),
    ).toBe("Name is required.");

    expect(
      validateProfileFormValues({
        name: "Alice",
        username: "ab",
        bio: "a".repeat(PROFILE_BIO_MAX_LENGTH + 1),
      }),
    ).toBe(`Username must be at least ${PROFILE_USERNAME_MIN_LENGTH} characters.`);

    expect(
      validateProfileFormValues({
        name: "Alice",
        username: "alice_01",
        bio: "a".repeat(PROFILE_BIO_MAX_LENGTH + 1),
      }),
    ).toBe(`Bio must be at most ${PROFILE_BIO_MAX_LENGTH} characters.`);

    expect(
      validateProfileFormValues({
        name: "Alice",
        username: "alice_01",
        bio: "I like clean tests.",
      }),
    ).toBeNull();
  });
});
