import type { Activity, Routine, RoutineSettingsData, RoutineStep } from "./types";

export const ROUTINE_STORAGE_KEY = "family-routine:settings:v2";
export const LEGACY_STORAGE_KEY = "family-routine:settings:v1";

export const PALETTE = [
  { name: "Nuit", color: "#404066" },
  { name: "Eau", color: "#85C7F9" },
  { name: "Hygiène", color: "#8FC8A9" },
  { name: "Repas", color: "#FFB16F" },
  { name: "Habillage", color: "#E2793B" },
  { name: "École", color: "#A4A4BD" },
  { name: "Toilettes", color: "#F6D77A" },
] as const;

export const IMAGE_OPTIONS = [
  { name: "Lit", image: "/routines/sleep.png" },
  { name: "Petit-déjeuner", image: "/routines/breakfast.png" },
  { name: "Habillage", image: "/routines/dressing.png" },
  { name: "Dents", image: "/routines/teeth.png" },
  { name: "Cartable", image: "/routines/schoolbag.png" },
  { name: "Devoirs", image: "/routines/homework.png" },
  { name: "Douche", image: "/routines/shower.png" },
  { name: "Repas", image: "/routines/dinner.png" },
  { name: "Toilettes", image: "/routines/toilet.png" },
] as const;

export const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] as const;

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "wake-up", label: "Réveil", image: "/routines/sleep.png", color: "#404066" },
  { id: "breakfast", label: "Petit-déjeuner", image: "/routines/breakfast.png", color: "#FFB16F" },
  { id: "dressing", label: "Habillage", image: "/routines/dressing.png", color: "#E2793B" },
  { id: "teeth", label: "Dents", image: "/routines/teeth.png", color: "#8FC8A9" },
  {
    id: "schoolbag",
    label: "Cartable / départ",
    image: "/routines/schoolbag.png",
    color: "#A4A4BD",
  },
  { id: "homework", label: "Devoirs", image: "/routines/homework.png", color: "#A4A4BD" },
  { id: "shower", label: "Douche", image: "/routines/shower.png", color: "#85C7F9" },
  { id: "dinner", label: "Repas", image: "/routines/dinner.png", color: "#FFB16F" },
  { id: "toilet", label: "Toilettes", image: "/routines/toilet.png", color: "#F6D77A" },
  { id: "sleep", label: "Dodo", image: "/routines/sleep.png", color: "#404066" },
];

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: "morning",
    label: "Routine du matin",
    enabled: true,
    days: EVERY_DAY,
    steps: [
      { id: "wake-up", activityId: "wake-up", startTime: "07:00" },
      { id: "breakfast", activityId: "breakfast", startTime: "07:10" },
      { id: "dressing", activityId: "dressing", startTime: "07:30" },
      { id: "morning-teeth", activityId: "teeth", startTime: "07:45" },
      { id: "schoolbag", activityId: "schoolbag", startTime: "07:50" },
    ],
  },
  {
    id: "evening",
    label: "Routine du soir",
    enabled: true,
    days: EVERY_DAY,
    steps: [
      { id: "homework", activityId: "homework", startTime: "18:10" },
      { id: "shower", activityId: "shower", startTime: "18:35" },
      { id: "dinner", activityId: "dinner", startTime: "19:05" },
      { id: "toilet", activityId: "toilet", startTime: "19:50" },
      { id: "evening-teeth", activityId: "teeth", startTime: "20:00" },
      { id: "sleep", activityId: "sleep", startTime: "20:15" },
    ],
  },
];

export function cloneDefaultSettings(): RoutineSettingsData {
  return {
    activities: DEFAULT_ACTIVITIES.map((activity) => ({ ...activity })),
    routines: DEFAULT_ROUTINES.map((routine) => ({
      ...routine,
      days: [...routine.days],
      steps: routine.steps.map((step) => ({ ...step })),
    })),
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
function validTime(value: unknown): value is string {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
function validImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (IMAGE_OPTIONS.some((option) => option.image === value) ||
      (value.length <= 1_500_000 &&
        /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)))
  );
}

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}
function validLabel(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 80;
}

export function parseStoredSettings(
  value: string | null,
  legacyValue?: string | null,
): RoutineSettingsData {
  const defaults = cloneDefaultSettings();
  if (!value) {
    if (!legacyValue) return defaults;
    try {
      const legacy = JSON.parse(legacyValue) as unknown;
      if (!Array.isArray(legacy)) return defaults;
      for (const routine of defaults.routines) {
        const saved = legacy.map(record).find((item) => item?.id === routine.id);
        if (typeof saved?.enabled === "boolean") routine.enabled = saved.enabled;
        const savedSteps = Array.isArray(saved?.steps) ? saved.steps.map(record) : [];
        for (const step of routine.steps) {
          const savedStep = savedSteps.find((item) => item?.id === step.id);
          if (validTime(savedStep?.startTime)) step.startTime = savedStep.startTime;
        }
      }
      return defaults;
    } catch {
      return defaults;
    }
  }
  try {
    const saved = record(JSON.parse(value) as unknown);
    if (!saved || !Array.isArray(saved.activities) || !Array.isArray(saved.routines))
      return defaults;
    const activities: Activity[] = [];
    for (const item of saved.activities) {
      const candidate = record(item);
      if (
        !candidate ||
        !validId(candidate.id) ||
        !validLabel(candidate.label) ||
        !validImage(candidate.image) ||
        !PALETTE.some((option) => option.color === candidate.color) ||
        activities.some((activity) => activity.id === candidate.id)
      )
        continue;
      activities.push({
        id: candidate.id,
        label: candidate.label.trim(),
        image: candidate.image as string,
        color: candidate.color as string,
      });
    }
    const routines: Routine[] = [];
    for (const item of saved.routines) {
      const candidate = record(item);
      if (
        !candidate ||
        !validId(candidate.id) ||
        !validLabel(candidate.label) ||
        routines.some((routine) => routine.id === candidate.id)
      )
        continue;
      const days = Array.isArray(candidate.days)
        ? [
            ...new Set(
              candidate.days.filter(
                (day): day is number => Number.isInteger(day) && day >= 0 && day <= 6,
              ),
            ),
          ]
        : [];
      const steps: Routine["steps"] = [];
      if (Array.isArray(candidate.steps))
        for (const itemStep of candidate.steps) {
          const step = record(itemStep);
          if (
            !step ||
            !validId(step.id) ||
            !validId(step.activityId) ||
            !validTime(step.startTime) ||
            !activities.some((activity) => activity.id === step.activityId) ||
            steps.some((existing) => existing.id === step.id)
          )
            continue;
          steps.push({ id: step.id, activityId: step.activityId, startTime: step.startTime });
        }
      steps.sort((a, b) => a.startTime.localeCompare(b.startTime));
      routines.push({
        id: candidate.id,
        label: candidate.label.trim(),
        enabled: candidate.enabled !== false,
        days,
        steps,
      });
    }
    return { activities, routines };
  } catch {
    return defaults;
  }
}

export function resolveSteps(routine: Routine, activities: Activity[]): RoutineStep[] {
  const byId = new Map(activities.map((activity) => [activity.id, activity]));
  return routine.steps.flatMap((step) => {
    const activity = byId.get(step.activityId);
    return activity ? [{ ...step, ...activity, id: step.id }] : [];
  });
}
