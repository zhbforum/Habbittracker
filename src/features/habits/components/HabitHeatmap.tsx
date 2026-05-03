import { useMemo } from "react";

import { ActivityHeatmap } from "@shared/ui/ActivityHeatmap";

import { fromDateKey, toDateKey } from "../model/date";
import type { HabitHeatmapWeek } from "../model/types";

type HabitHeatmapProps = {
  weeks: HabitHeatmapWeek[];
};

function resolveMonthLabel(dateKey: string): string {
  const date = fromDateKey(dateKey);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", { month: "short" });
}

export function HabitHeatmap({ weeks }: HabitHeatmapProps) {
  const todayDateKey = toDateKey(new Date());

  const mappedWeeks = useMemo(() => {
    return weeks.map((week, weekIndex) => {
      const firstDateKey = week.cells[0]?.dateKey ?? week.weekLabel;

      return {
        key: `${week.weekLabel}-${weekIndex}`,
        monthLabel: resolveMonthLabel(firstDateKey),
        cells: week.cells.map((cell) => ({
          key: cell.dateKey,
          intensityLevel: cell.level,
          isToday: cell.dateKey === todayDateKey,
        })),
      };
    });
  }, [todayDateKey, weeks]);

  return <ActivityHeatmap title="Activity Heatmap" weeks={mappedWeeks} showLegend />;
}
