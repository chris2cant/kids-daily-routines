import { describe, expect, it } from "vitest";

import { cloneDefaultSettings, resolveSteps } from "../routines";
import {
  getAutomaticRoutineId,
  getAutomaticStepIndex,
  getActiveStepIndex,
  getRemainingMinutes,
  getTokenCount,
  timeToMinutes,
} from "../time";

function at(hours: number, minutes: number) {
  return new Date(2026, 8, 14, hours, minutes);
}

describe("routine time helpers", () => {
  const settings = cloneDefaultSettings();
  const evening = settings.routines.find((routine) => routine.id === "evening");
  const steps = resolveSteps(evening!, settings.activities);

  it("converts a clock time to minutes", () => {
    expect(timeToMinutes("18:35")).toBe(1115);
  });

  it("selects morning and evening routine windows", () => {
    expect(getAutomaticRoutineId(settings.routines, at(7, 30))).toBe("morning");
    expect(getAutomaticRoutineId(settings.routines, at(18, 30))).toBe("evening");
    expect(getAutomaticRoutineId(settings.routines, at(13, 0))).toBeNull();
  });

  it("selects a flow only on its configured day", () => {
    const wednesday = {
      id: "wednesday",
      label: "Mercredi",
      enabled: true,
      days: [3],
      steps: [{ id: "late", activityId: "breakfast", startTime: "09:00" }],
    };
    const weekdayMorning = { ...settings.routines[0]!, days: [1, 2, 4, 5] };
    expect(getAutomaticRoutineId([weekdayMorning, wednesday], new Date(2026, 8, 16, 9, 10))).toBe(
      "wednesday",
    );
    expect(
      getAutomaticRoutineId([weekdayMorning, wednesday], new Date(2026, 8, 14, 9, 10)),
    ).toBeNull();
  });

  it("selects the latest started step", () => {
    expect(evening).toBeDefined();
    expect(getAutomaticStepIndex(steps, at(18, 22))).toBe(0);
    expect(getAutomaticStepIndex(steps, at(18, 42))).toBe(1);
  });

  it("keeps the next scheduled boundary after an early manual advance", () => {
    expect(evening).toBeDefined();
    const now = at(18, 20);
    const activeIndex = getActiveStepIndex(getAutomaticStepIndex(steps, now), {
      index: 1,
      direction: "forward",
    });

    expect(activeIndex).toBe(1);
    expect(getRemainingMinutes(steps, activeIndex, now)).toBe(45);
    expect(
      getActiveStepIndex(getAutomaticStepIndex(steps, at(19, 5)), {
        index: 1,
        direction: "forward",
      }),
    ).toBe(2);
  });

  it("returns no step before the first configured time", () => {
    expect(evening).toBeDefined();
    expect(getAutomaticStepIndex(steps, at(17, 30))).toBe(-1);
  });

  it("turns remaining minutes into five-minute objects", () => {
    expect(evening).toBeDefined();
    const remaining = getRemainingMinutes(steps, 1, at(18, 40));
    expect(remaining).toBe(25);
    expect(getTokenCount(remaining)).toBe(5);
  });
});
