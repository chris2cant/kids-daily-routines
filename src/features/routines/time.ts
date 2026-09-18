import type { ManualOverride, Routine, RoutineStep } from "./types";

export const TOKEN_MINUTES = 5;

export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

export function getAutomaticRoutineId(routines: Routine[], date: Date): string | null {
  const now = dateToMinutes(date);
  const today = date.getDay();
  const matches = routines.filter(
    (routine) =>
      routine.enabled &&
      routine.days.includes(today) &&
      routine.steps.length > 0 &&
      now >= timeToMinutes(routine.steps[0]!.startTime) - 60 &&
      now <= timeToMinutes(routine.steps.at(-1)!.startTime) + 60,
  );
  // A flow that has started takes precedence over an upcoming flow.
  return (
    matches.toSorted(
      (a, b) => timeToMinutes(b.steps[0]!.startTime) - timeToMinutes(a.steps[0]!.startTime),
    )[0]?.id ?? null
  );
}

export function getAutomaticStepIndex(steps: RoutineStep[], date: Date): number {
  const now = dateToMinutes(date);
  let activeIndex = -1;

  for (const [index, step] of steps.entries()) {
    if (timeToMinutes(step.startTime) <= now) activeIndex = index;
  }

  return activeIndex;
}

export function getActiveStepIndex(
  automaticStepIndex: number,
  manualOverride: ManualOverride | null,
): number {
  if (!manualOverride) return automaticStepIndex;
  if (manualOverride.direction === "backward") return manualOverride.index;

  return Math.max(automaticStepIndex, manualOverride.index);
}

export function getStepDurationMinutes(steps: RoutineStep[], index: number): number | null {
  const current = steps[index];
  const next = steps[index + 1];
  if (!current || !next) return null;
  return Math.max(0, timeToMinutes(next.startTime) - timeToMinutes(current.startTime));
}

export function getRemainingMinutes(
  steps: RoutineStep[],
  index: number,
  date: Date,
): number | null {
  const next = steps[index + 1];
  return next ? Math.max(0, Math.ceil(timeToMinutes(next.startTime) - dateToMinutes(date))) : null;
}

export function getTokenCount(remainingMinutes: number | null): number {
  if (remainingMinutes === null || remainingMinutes <= 0) return 0;
  return Math.ceil(remainingMinutes / TOKEN_MINUTES);
}

export function findRoutine(routines: Routine[], id: string | null): Routine | null {
  if (!id) return null;
  return routines.find((routine) => routine.id === id && routine.enabled) ?? null;
}

export type TimelineSegment = {
  step: RoutineStep;
  index: number;
  durationMinutes: number;
};

export function getTimelineSegments(steps: RoutineStep[]): TimelineSegment[] {
  const durations = steps.map((_, index) => getStepDurationMinutes(steps, index));
  const known = durations.filter((duration): duration is number => duration !== null);
  const averageDuration = known.length
    ? known.reduce((sum, value) => sum + value, 0) / known.length
    : 15;

  return steps.map((step, index) => ({
    step,
    index,
    durationMinutes: durations[index] ?? averageDuration,
  }));
}

export function getTimelineProgress(steps: RoutineStep[], date: Date): number {
  const firstStep = steps[0];
  if (!firstStep) return 0;

  const totalMinutes = getTimelineSegments(steps).reduce(
    (sum, segment) => sum + segment.durationMinutes,
    0,
  );
  if (totalMinutes <= 0) return 0;

  const elapsed = dateToMinutes(date) - timeToMinutes(firstStep.startTime);
  return Math.min(1, Math.max(0, elapsed / totalMinutes));
}
