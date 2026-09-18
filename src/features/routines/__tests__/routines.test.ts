import { describe, expect, it } from "vitest";

import { cloneDefaultSettings, parseStoredSettings, resolveSteps } from "../routines";

describe("stored flow settings", () => {
  it("keeps safe defaults when storage is corrupt", () => {
    expect(parseStoredSettings("not-json").routines).toHaveLength(2);
  });

  it("migrates previous schedules", () => {
    const settings = parseStoredSettings(
      null,
      JSON.stringify([
        {
          id: "morning",
          enabled: false,
          steps: [{ id: "wake-up", startTime: "06:45", label: "Injected" }],
        },
      ]),
    );
    expect(settings.routines[0]?.enabled).toBe(false);
    expect(settings.routines[0]?.steps[0]?.startTime).toBe("06:45");
    expect(settings.activities[0]?.label).toBe("Réveil");
  });

  it("preserves custom flows and shared activity appearance", () => {
    const settings = cloneDefaultSettings();
    settings.activities.find((activity) => activity.id === "teeth")!.color = "#85C7F9";
    settings.routines.push({
      id: "wednesday",
      label: "Mercredi",
      enabled: true,
      days: [3],
      steps: [{ id: "custom-teeth", activityId: "teeth", startTime: "09:00" }],
    });
    const restored = parseStoredSettings(JSON.stringify(settings));
    expect(resolveSteps(restored.routines[2]!, restored.activities)[0]?.color).toBe("#85C7F9");
    expect(
      resolveSteps(restored.routines[0]!, restored.activities).find(
        (step) => step.activityId === "teeth",
      )?.color,
    ).toBe("#85C7F9");
  });
});
