import { useEffect, useMemo, useState } from "react";
import type { Href } from "expo-router";

import {
  hasCompletedOnboarding,
  markOnboardingAsCompleted,
} from "@features/onboarding";
import { useAuthSession } from "@/shared/auth";
import { routes } from "@/shared/navigation/routes";

export function useIndexScreenController() {
  const { isLoading: isAuthLoading, user } = useAuthSession();
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    void hasCompletedOnboarding()
      .then((isCompleted) => {
        setIsOnboardingCompleted(isCompleted);
      })
      .finally(() => {
        setIsOnboardingLoading(false);
      });
  }, []);

  const isLoading = isAuthLoading || isOnboardingLoading;

  useEffect(() => {
    if (!user || isLoading || isOnboardingCompleted) {
      return;
    }

    void markOnboardingAsCompleted();
  }, [isLoading, isOnboardingCompleted, user]);

  return useMemo(() => {
    if (isLoading) {
      return {
        isLoading: true,
        shouldShowOnboarding: false,
        redirectRoute: null as Href | null,
      };
    }

    if (user) {
      return {
        isLoading: false,
        shouldShowOnboarding: false,
        redirectRoute: routes.home,
      };
    }

    if (isOnboardingCompleted) {
      return {
        isLoading: false,
        shouldShowOnboarding: false,
        redirectRoute: routes.profile,
      };
    }

    return {
      isLoading: false,
      shouldShowOnboarding: true,
      redirectRoute: null,
    };
  }, [isLoading, isOnboardingCompleted, user]);
}
