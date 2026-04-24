import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/shared/lib";
import { routes } from "@/shared/navigation/routes";

import { fetchPublicProfileByUsername } from "../services/profileService";

export function usePublicProfileScreenController() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string | string[] }>();

  const usernameParam = useMemo(() => {
    const value = Array.isArray(params.username) ? params.username[0] : params.username;
    return value?.trim().toLowerCase() ?? "";
  }, [params.username]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Awaited<
    ReturnType<typeof fetchPublicProfileByUsername>
  >>(null);

  useEffect(() => {
    if (!usernameParam) {
      setErrorMessage("Username is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    void fetchPublicProfileByUsername(usernameParam)
      .then((data) => {
        setProfileData(data);
      })
      .catch((error) => {
        const message = getErrorMessage(error, "Unable to load public profile.");
        setErrorMessage(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [usernameParam]);

  const handleBackPress = useCallback(() => {
    router.replace(routes.profile);
  }, [router]);

  return useMemo(
    () => ({
      isLoading,
      errorMessage,
      profileData,
      handleBackPress,
    }),
    [errorMessage, handleBackPress, isLoading, profileData],
  );
}
