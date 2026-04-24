export const routes = {
  onboarding: "/onboarding" as const,
  home: "/home" as const,
  habits: "/habits" as const,
  stats: "/stats" as const,
  profile: "/profile" as const,
  publicProfile: (username: string) => `/u/${encodeURIComponent(username)}`,
} as const;
