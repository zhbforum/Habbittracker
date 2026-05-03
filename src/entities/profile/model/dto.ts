import type { ThemeMode } from "@/shared/theme";

export type ProfileDto = {
  id: string;
  username: string | null;
  username_updated_at: string | null;
  bio: string | null;
  avatar_url: string | null;
  full_name: string | null;
  theme_preference: ThemeMode | null;
};

export type ProfileInsertDto = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  theme_preference: ThemeMode;
};

export type ProfileUpdateDto = {
  username?: string;
  username_updated_at?: string;
  bio?: string | null;
  avatar_url?: string | null;
  full_name?: string;
  theme_preference?: ThemeMode;
};
