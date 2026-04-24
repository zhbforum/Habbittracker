import type { LucideIcon } from "lucide-react-native";
import {
  Apple,
  BedDouble,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Brain,
  Bubbles,
  CandyOff,
  Cigarette,
  Code2,
  CookingPot,
  Droplets,
  Dumbbell,
  Footprints,
  GlassWater,
  HandPlatter,
  Headphones,
  HeartPulse,
  Leaf,
  LeafyGreen,
  MoonStar,
  NotebookPen,
  NotebookText,
  Pill,
  PiggyBank,
  Salad,
  ScanFace,
  ShieldOff,
  Smartphone,
  Sparkles,
  Sunrise,
  Sunset,
  Syringe,
  Target,
  Timer,
  UtensilsCrossed,
  Volleyball,
  Wallet,
} from "lucide-react-native";

import type {
  HabitIconColorId,
  HabitIconColorOption,
  HabitIconId,
  HabitIconOption,
} from "./types";

export const HABIT_ICON_OPTIONS: readonly HabitIconOption[] = [
  { id: "water", label: "Hydration", Icon: Droplets },
  { id: "run", label: "Running", Icon: Footprints },
  { id: "workout", label: "Workout", Icon: Dumbbell },
  { id: "meditation", label: "Meditation", Icon: Sparkles },
  { id: "reading", label: "Reading", Icon: BookOpen },
  { id: "sleep", label: "Better sleep", Icon: Sunset },
  { id: "vitamins", label: "Vitamins", Icon: Pill },
  { id: "healthy_food", label: "Healthy food", Icon: HandPlatter },
  { id: "journal", label: "Journal", Icon: NotebookPen },
  { id: "coding", label: "Coding", Icon: Code2 },
  { id: "study", label: "Study", Icon: Brain },
  { id: "walk", label: "Walking", Icon: Volleyball },
  { id: "cleaning", label: "Clean home", Icon: ScanFace },
  { id: "music", label: "Music", Icon: Headphones },
  { id: "focus", label: "Focus", Icon: GlassWater },
  { id: "no_smoking", label: "No smoking", Icon: Cigarette },
  { id: "no_alcohol", label: "No alcohol", Icon: GlassWater },
  { id: "no_drugs", label: "No drugs", Icon: Syringe },
  { id: "no_sugar", label: "No sugar", Icon: CandyOff },
  { id: "less_social", label: "Less social media", Icon: Smartphone },
  { id: "bike", label: "Cycling", Icon: Bike },
  { id: "meal_prep", label: "Meal prep", Icon: CookingPot },
  { id: "stretching", label: "Stretching", Icon: Target },
  { id: "reading_focus", label: "Focus reading", Icon: NotebookText },
  { id: "sleep_early", label: "Sleep early", Icon: BedDouble },
  { id: "deep_work", label: "Deep work", Icon: BriefcaseBusiness },
  { id: "mindful_break", label: "Mindful break", Icon: HeartPulse },
  { id: "morning_sun", label: "Morning sun", Icon: Sunrise },
  { id: "budget", label: "Budgeting", Icon: PiggyBank },
  { id: "self_care", label: "Self care", Icon: Bubbles },
  { id: "no_fast_food", label: "No fast food", Icon: UtensilsCrossed },
  { id: "no_late_snacks", label: "No late snacks", Icon: Apple },
  { id: "meal_green", label: "Greens", Icon: LeafyGreen },
  { id: "salad_day", label: "Salad", Icon: Salad },
  { id: "quiet_night", label: "Quiet night", Icon: MoonStar },
  { id: "wallet_plan", label: "Spending plan", Icon: Wallet },
  { id: "breathing", label: "Breathing", Icon: Sparkles },
  { id: "calm_walk", label: "Nature walk", Icon: Leaf },
  { id: "timed_session", label: "Timed session", Icon: Timer },
] as const;

const iconMap = HABIT_ICON_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.id] = option.Icon;
    return accumulator;
  },
  {} as Record<HabitIconId, LucideIcon>,
);

export function getHabitIconById(iconId: HabitIconId): LucideIcon {
  return iconMap[iconId] || ShieldOff;
}

export const HABIT_ICON_COLOR_OPTIONS: readonly HabitIconColorOption[] = [
  { id: "emerald", color: "#2F7A3E" },
  { id: "mint", color: "#20A37A" },
  { id: "sky", color: "#3293F3" },
  { id: "ocean", color: "#1E6AB0" },
  { id: "violet", color: "#7A6AF2" },
  { id: "magenta", color: "#C3479A" },
  { id: "amber", color: "#C78616" },
  { id: "orange", color: "#D56A1A" },
  { id: "red", color: "#D24A4A" },
  { id: "slate", color: "#516177" },
] as const;

const iconColorMap = HABIT_ICON_COLOR_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.id] = option.color;
    return accumulator;
  },
  {} as Record<HabitIconColorId, string>,
);

export function getHabitIconColorById(iconColorId: HabitIconColorId): string {
  return iconColorMap[iconColorId] || iconColorMap.emerald;
}
