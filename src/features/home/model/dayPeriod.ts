export type HomeDayPeriod = "morning" | "afternoon" | "evening" | "night";

export function resolveHomeDayPeriod(date: Date): HomeDayPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  if (hour >= 18 && hour < 22) {
    return "evening";
  }

  return "night";
}

export function getDayPeriodGreeting(dayPeriod: HomeDayPeriod): string {
  if (dayPeriod === "morning") {
    return "Good Morning";
  }

  if (dayPeriod === "afternoon") {
    return "Good Afternoon";
  }

  if (dayPeriod === "evening") {
    return "Good Evening";
  }

  return "Good Night";
}
