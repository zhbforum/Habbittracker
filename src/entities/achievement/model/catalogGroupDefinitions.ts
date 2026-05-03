import type { AchievementDefinition } from "./types";
import { COMPLETION_MILESTONES } from "./catalogMilestones";

export const GROUP_ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    id: "group_master_10",
    title: "Group Master 10",
    description: "Hit group goals 10 times.",
    tier: "silver",
    target: COMPLETION_MILESTONES.groupMaster10,
    iconName: "target",
    resolveProgress: (signals) => signals.groupGoalHits,
  },
  {
    id: "group_master_30",
    title: "Group Master 30",
    description: "Hit group goals 30 times.",
    tier: "gold",
    target: COMPLETION_MILESTONES.groupMaster30,
    iconName: "target-account",
    resolveProgress: (signals) => signals.groupGoalHits,
  },
  {
    id: "group_master_100",
    title: "Group Master 100",
    description: "Hit group goals 100 times.",
    tier: "legend",
    target: COMPLETION_MILESTONES.groupMaster100,
    iconName: "target-variant",
    resolveProgress: (signals) => signals.groupGoalHits,
  },
];
