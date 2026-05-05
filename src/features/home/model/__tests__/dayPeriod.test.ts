import { getDayPeriodGreeting, resolveHomeDayPeriod } from "../dayPeriod";

describe("home day period", () => {
  it.each([
    [0, "night"],
    [4, "night"],
    [5, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [17, "afternoon"],
    [18, "evening"],
    [21, "evening"],
    [22, "night"],
  ])("resolves %i:00 as %s", (hour, expectedPeriod) => {
    const date = new Date(2026, 5, 1, hour, 0, 0, 0);

    expect(resolveHomeDayPeriod(date)).toBe(expectedPeriod);
  });

  it.each([
    ["morning", "Good Morning"],
    ["afternoon", "Good Afternoon"],
    ["evening", "Good Evening"],
    ["night", "Good Night"],
  ] as const)("builds greeting for %s", (period, expectedGreeting) => {
    expect(getDayPeriodGreeting(period)).toBe(expectedGreeting);
  });
});
