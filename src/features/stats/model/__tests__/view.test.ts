import { Animated } from "react-native";

import { lightColors } from "@/shared/theme";
import type { StatsDayDetails, StatsDayGroupItem, StatsDayHabitItem } from "../types";
import {
  chunkByWeek,
  createAppearStyle,
  filterDayGroupsByStatus,
  filterDayHabitsByStatus,
  getCompletedCountLabel,
  getIntensityColor,
  toActivityHeatmapWeeks,
} from "../view";

function createHabitItem(
  id: string,
  options: { isScheduled: boolean; isCompleted: boolean },
): StatsDayHabitItem {
  return {
    id,
    name: id,
    iconId: "water",
    iconColorId: "emerald",
    isScheduled: options.isScheduled,
    isCompleted: options.isCompleted,
    goalMetric: "checkins",
    goalPeriod: "day",
    goalTarget: 1,
    goalUnit: "times",
    loggedValue: 0,
    goalProgressPercent: 0,
  };
}

function createGroupItem(id: string, isCompleted: boolean): StatsDayGroupItem {
  return {
    id,
    name: id,
    iconId: "focus",
    isScheduled: true,
    isCompleted,
    targetCount: 2,
    completedHabitsCount: isCompleted ? 2 : 1,
  };
}

describe("stats view helpers", () => {
  it("maps intensity levels to colors", () => {
    expect(getIntensityColor(3, lightColors)).toBe(lightColors.successText);
    expect(getIntensityColor(2, lightColors)).toBe(lightColors.accentText);
    expect(getIntensityColor(1, lightColors)).toBe(lightColors.textMuted);
    expect(getIntensityColor(0, lightColors)).toBe("transparent");
  });

  it("chunks items by calendar week", () => {
    const chunks = chunkByWeek([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(chunks).toEqual([[1, 2, 3, 4, 5, 6, 7], [8, 9]]);
  });

  it("creates appear animation style", () => {
    const animationValue = new Animated.Value(0);
    const style = createAppearStyle(animationValue);

    expect(style.opacity).toBe(animationValue);
    expect(style.transform).toHaveLength(1);
    expect(style.transform[0]?.translateY).toBeDefined();
  });

  it("maps heatmap weeks to presentation format", () => {
    const result = toActivityHeatmapWeeks([
      {
        weekLabel: "2026-05-04",
        monthLabel: "May",
        cells: [
          { dateKey: "2026-05-04", intensityLevel: 1, isToday: false },
          { dateKey: "2026-05-05", intensityLevel: 2, isToday: true },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        key: "2026-05-04",
        monthLabel: "May",
        cells: [
          { key: "2026-05-04", intensityLevel: 1, isToday: false },
          { key: "2026-05-05", intensityLevel: 2, isToday: true },
        ],
      },
    ]);
  });

  it("filters day habit items by status", () => {
    const items = [
      createHabitItem("done", { isScheduled: true, isCompleted: true }),
      createHabitItem("pending", { isScheduled: true, isCompleted: false }),
      createHabitItem("unscheduled", { isScheduled: false, isCompleted: false }),
    ];

    expect(filterDayHabitsByStatus(items, "all").map((item) => item.id)).toEqual([
      "done",
      "pending",
      "unscheduled",
    ]);
    expect(filterDayHabitsByStatus(items, "completed").map((item) => item.id)).toEqual(["done"]);
    expect(filterDayHabitsByStatus(items, "pending").map((item) => item.id)).toEqual(["pending"]);
  });

  it("filters day group items by status", () => {
    const items = [createGroupItem("g1", true), createGroupItem("g2", false)];

    expect(filterDayGroupsByStatus(items, "all").map((item) => item.id)).toEqual(["g1", "g2"]);
    expect(filterDayGroupsByStatus(items, "completed").map((item) => item.id)).toEqual(["g1"]);
    expect(filterDayGroupsByStatus(items, "pending").map((item) => item.id)).toEqual(["g2"]);
  });

  it("returns completed count label for active filter", () => {
    const dayDetails: StatsDayDetails = {
      dateKey: "2026-05-06",
      dateLabel: "May 6, 2026",
      habits: [],
      groups: [],
      scheduledHabitsCount: 3,
      completedHabitsCount: 2,
      scheduledGroupsCount: 1,
      completedGroupsCount: 1,
      totalLoggedValue: 4,
    };

    expect(getCompletedCountLabel(dayDetails, "all")).toBe("3 completed");
    expect(getCompletedCountLabel(dayDetails, "completed")).toBe("Showing completed only");
    expect(getCompletedCountLabel(dayDetails, "pending")).toBe("Showing pending only");
  });
});
