import { getErrorMessage } from "../errors";

describe("getErrorMessage", () => {
  it("returns message from Error instance when it is non-empty", () => {
    expect(getErrorMessage(new Error("Network unavailable"), "Fallback")).toBe(
      "Network unavailable",
    );
  });

  it("returns non-empty string error as-is", () => {
    expect(getErrorMessage("Request timeout", "Fallback")).toBe("Request timeout");
  });

  it("returns fallback for empty or unsupported error values", () => {
    expect(getErrorMessage(new Error("   "), "Fallback")).toBe("Fallback");
    expect(getErrorMessage("   ", "Fallback")).toBe("Fallback");
    expect(getErrorMessage({ message: "not-an-error-instance" }, "Fallback")).toBe("Fallback");
    expect(getErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
