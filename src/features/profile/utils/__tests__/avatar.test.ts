import { buildBlockAvatarMatrix, getAvatarPalette, resolveProfileSeed } from "../avatar";

function rowsFromMatrix(matrix: boolean[], size: number): boolean[][] {
  const rows: boolean[][] = [];

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    const from = rowIndex * size;
    rows.push(matrix.slice(from, from + size));
  }

  return rows;
}

describe("avatar utils", () => {
  it("resolves profile seed with trim and fallback", () => {
    expect(resolveProfileSeed("  alice  ")).toBe("alice");
    expect(resolveProfileSeed("   ")).toBe("habbittracker-profile");
    expect(resolveProfileSeed(undefined)).toBe("habbittracker-profile");
    expect(resolveProfileSeed(null)).toBe("habbittracker-profile");
  });

  it("returns deterministic palette for the same seed", () => {
    const first = getAvatarPalette("alice");
    const second = getAvatarPalette("alice");

    expect(first).toEqual(second);
    expect(first).toEqual({
      background: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
      primary: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
      secondary: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
    });
  });

  it("builds deterministic symmetric matrix for odd size", () => {
    const first = buildBlockAvatarMatrix("alice", 5);
    const second = buildBlockAvatarMatrix("alice", 5);

    expect(first).toEqual(second);
    expect(first).toHaveLength(25);
    expect(first.every((value) => typeof value === "boolean")).toBe(true);

    const rows = rowsFromMatrix(first, 5);
    rows.forEach((row) => {
      expect(row).toEqual([...row].reverse());
    });
  });

  it("builds symmetric matrix for even size", () => {
    const matrix = buildBlockAvatarMatrix("bob", 6);

    expect(matrix).toHaveLength(36);

    const rows = rowsFromMatrix(matrix, 6);
    rows.forEach((row) => {
      expect(row).toEqual([...row].reverse());
    });
  });
});
