import { useEffect, useRef } from "react";

type UseHabitsScreenRouteParamsArgs = {
  createParam: string | undefined;
  habitIdParam: string | undefined;
  groupIdParam: string | undefined;
  openCreateHabit: () => void;
  openHabitDetails: (habitId: string) => void;
  openGroupDetails: (groupId: string) => void;
};

export function useHabitsScreenRouteParams({
  createParam,
  habitIdParam,
  groupIdParam,
  openCreateHabit,
  openHabitDetails,
  openGroupDetails,
}: UseHabitsScreenRouteParamsArgs) {
  const hasHandledCreateParamRef = useRef(false);
  const handledHabitIdRef = useRef<string | null>(null);
  const handledGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (createParam !== "1" || hasHandledCreateParamRef.current) {
      return;
    }

    hasHandledCreateParamRef.current = true;
    openCreateHabit();
  }, [createParam, openCreateHabit]);

  useEffect(() => {
    if (!habitIdParam || handledHabitIdRef.current === habitIdParam) {
      return;
    }

    handledHabitIdRef.current = habitIdParam;
    openHabitDetails(habitIdParam);
  }, [habitIdParam, openHabitDetails]);

  useEffect(() => {
    if (!groupIdParam || handledGroupIdRef.current === groupIdParam) {
      return;
    }

    handledGroupIdRef.current = groupIdParam;
    openGroupDetails(groupIdParam);
  }, [groupIdParam, openGroupDetails]);
}
