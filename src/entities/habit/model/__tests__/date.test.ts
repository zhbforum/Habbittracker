import {
  asWeekday,
  formatTimeLabel,
  normalizeTime,
  parseTimeToMinutes,
  startOfWeek,
  toDateKey,
} from "../date";

describe("habit date utilities", () => {
  it("builds monday as week start for any day of week", () => {
    expect(toDateKey(startOfWeek(new Date(2026, 4, 6)))).toBe("2026-05-04");
    expect(toDateKey(startOfWeek(new Date(2026, 4, 10)))).toBe("2026-05-04");
  });

  it("parses and normalizes valid time strings", () => {
    expect(parseTimeToMinutes("7:05")).toBe(425);
    expect(normalizeTime(" 7:05 ")).toBe("07:05");
    expect(formatTimeLabel("13:00")).toBe("1:00 PM");
  });

  it("returns null for invalid times", () => {
    expect(parseTimeToMinutes("24:00")).toBeNull();
    expect(parseTimeToMinutes("11:7")).toBeNull();
    expect(normalizeTime("nope")).toBeNull();
  });

  it("normalizes weekday values into 0..6 range", () => {
    expect(asWeekday(7)).toBe(0);
    expect(asWeekday(-1)).toBe(6);
  });
});
