import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/api/supabase/client";

type AuthSessionState = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>({
    isLoading: true,
    session: null,
    user: null,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      setState({
        isLoading: false,
        session: data.session,
        user: data.session?.user ?? null,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setState({
        isLoading: false,
        session,
        user: session?.user ?? null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.session),
    }),
    [state],
  );
}

