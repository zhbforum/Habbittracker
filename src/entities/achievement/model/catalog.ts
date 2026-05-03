import type { AchievementDefinition } from "./types";

import { CORE_ACHIEVEMENT_DEFINITIONS } from "./catalogCoreDefinitions";
import { GROUP_ACHIEVEMENT_DEFINITIONS } from "./catalogGroupDefinitions";
import { PROGRESS_ACHIEVEMENT_DEFINITIONS } from "./catalogProgressDefinitions";

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  ...CORE_ACHIEVEMENT_DEFINITIONS,
  ...PROGRESS_ACHIEVEMENT_DEFINITIONS,
  ...GROUP_ACHIEVEMENT_DEFINITIONS,
];
