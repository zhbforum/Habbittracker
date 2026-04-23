import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Manrope_400Regular } from "@expo-google-fonts/manrope";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { useCallback, useEffect, useRef } from "react";

import { resolveAuthRedirectUrl } from "@/features/auth/services/authRedirectService";
import { routes } from "@/shared/navigation/routes";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const lastHandledUrlRef = useRef<string | null>(null);
  const pendingUrlRef = useRef<string | null>(null);

  const [loaded, error] = useFonts({
    Manrope_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  const handleIncomingUrl = useCallback(
    async (url: string) => {
      if (lastHandledUrlRef.current === url || pendingUrlRef.current === url) {
        return;
      }

      pendingUrlRef.current = url;

      try {
        const result = await resolveAuthRedirectUrl(url);

        if (result.status === "ignored") {
          return;
        }

        lastHandledUrlRef.current = url;

        if (result.status === "success") {
          router.replace(routes.home);
          return;
        }

        if (result.status === "error") {
          Alert.alert("Auth link error", result.message);
        }
      } catch (callbackError) {
        const fallbackMessage =
          callbackError instanceof Error
            ? callbackError.message
            : "Unable to process auth link.";

        Alert.alert("Auth link error", fallbackMessage);
      } finally {
        if (pendingUrlRef.current === url) {
          pendingUrlRef.current = null;
        }
      }
    },
    [router],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleIncomingUrl(url);
    });

    void Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        void handleIncomingUrl(initialUrl);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleIncomingUrl]);

  if (!loaded && !error) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
