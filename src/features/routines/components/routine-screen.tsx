"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import { useClock } from "../hooks/use-clock";
import { useRoutineSettings } from "../hooks/use-routine-settings";
import { resolveSteps } from "../routines";
import {
  findRoutine,
  getActiveStepIndex,
  getAutomaticRoutineId,
  getAutomaticStepIndex,
  getRemainingMinutes,
  getTokenCount,
} from "../time";
import type { ManualOverride } from "../types";
import { ParentControls } from "./parent-controls";
import { RoutineTimeline } from "./routine-timeline";
import { TimeTokens } from "./time-tokens";

type StepColorStyle = CSSProperties & { "--step-color": string };

export function RoutineScreen() {
  const { isReady, settings } = useRoutineSettings();
  const now = useClock();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [forcedRoutineId, setForcedRoutineId] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState<ManualOverride | null>(null);

  const automaticRoutineId = getAutomaticRoutineId(settings.routines, now);
  const selectedRoutineId = forcedRoutineId ?? automaticRoutineId;
  const routine = findRoutine(settings.routines, selectedRoutineId);
  const steps = routine ? resolveSteps(routine, settings.activities) : [];
  const automaticStepIndex = getAutomaticStepIndex(steps, now);
  const activeIndex = getActiveStepIndex(automaticStepIndex, manualOverride);
  const currentStep = steps[activeIndex];
  const nextStep = steps[activeIndex + 1];
  const upcomingStep = steps[0];
  const remainingMinutes = routine ? getRemainingMinutes(steps, activeIndex, now) : null;
  const tokenCount = getTokenCount(remainingMinutes);
  const displayedStep = isReady ? currentStep : undefined;

  function selectRoutine(id: string) {
    setForcedRoutineId(id);
    setManualOverride(null);
  }

  function moveStep(direction: -1 | 1) {
    if (!routine) return;
    const origin = activeIndex < 0 ? (direction === 1 ? -1 : 0) : activeIndex;
    const nextIndex = Math.min(steps.length - 1, Math.max(0, origin + direction));
    setManualOverride({ index: nextIndex, direction: direction === 1 ? "forward" : "backward" });
  }

  function resumeAutomaticMode() {
    setForcedRoutineId(null);
    setManualOverride(null);
  }

  const screenStyle = {
    "--step-color": displayedStep?.color ?? "#FEF9D9",
  } as StepColorStyle;

  return (
    <main
      className={`routine-screen ${displayedStep ? "routine-screen--active" : "routine-screen--calm"}`}
      style={screenStyle}
    >
      <div className="ambient-shape ambient-shape--one" />
      <div className="ambient-shape ambient-shape--two" />

      {isReady && routine ? (
        <RoutineTimeline activeIndex={activeIndex} now={now} steps={steps} />
      ) : null}

      <header className="routine-header">
        <span className="routine-badge">
          {isReady ? (routine?.label ?? "Petites Routines") : "Petites Routines"}
        </span>
        <div className="routine-header__actions">
          {isReady ? (
            <time className="routine-clock" dateTime={now.toTimeString().slice(0, 5)}>
              {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(now)}
            </time>
          ) : null}
          <button
            className="parent-trigger"
            onClick={() => setControlsOpen(true)}
            type="button"
            aria-label="Ouvrir les commandes parents"
          >
            <span aria-hidden="true">•••</span>
          </button>
        </div>
      </header>

      {!isReady ? (
        <section className="calm-state" aria-label="Chargement de la routine">
          <span className="calm-icon" aria-hidden="true">
            ✦
          </span>
          <h1>Un petit instant…</h1>
        </section>
      ) : currentStep ? (
        <section className="current-step" key={`${routine?.id}-${currentStep.id}`}>
          <div className="step-illustration">
            <Image
              src={currentStep.image}
              alt={`Illustration : ${currentStep.label}`}
              fill
              priority
              unoptimized
              sizes="(max-width: 899px) 94vw, (max-width: 2200px) 58vw, 1760px"
            />
          </div>
          <div className="step-details">
            <div className="step-copy">
              <span className="eyebrow">Maintenant</span>
              <h1>{currentStep.label}</h1>
            </div>

            <TimeTokens count={tokenCount} minutes={remainingMinutes} />

            {nextStep ? (
              <button
                aria-label={`Passer à l’étape suivante : ${nextStep.label}`}
                className="next-step"
                onClick={() => moveStep(1)}
                type="button"
              >
                <div className="next-step__image">
                  <Image src={nextStep.image} alt="" fill sizes="84px" unoptimized />
                </div>
                <div>
                  <span>Ensuite</span>
                  <strong>{nextStep.label}</strong>
                </div>
                <span className="next-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ) : (
              <div className="last-step">C’est la dernière étape ✨</div>
            )}
          </div>
        </section>
      ) : (
        <section className="calm-state">
          <span className="calm-icon" aria-hidden="true">
            {routine ? "🌤️" : "🏡"}
          </span>
          <span className="eyebrow">{routine ? "Bientôt" : "Pour le moment"}</span>
          <h1>{routine ? "La routine va commencer" : "Temps libre"}</h1>
          <p>
            {routine && upcomingStep
              ? `Première étape : ${upcomingStep.label}`
              : "Profitez de ce moment tranquille."}
          </p>
        </section>
      )}

      <ParentControls
        activeRoutineId={routine?.id ?? null}
        routines={settings.routines}
        canGoNext={Boolean(routine && activeIndex < steps.length - 1)}
        canGoPrevious={Boolean(routine && activeIndex > 0)}
        forcedRoutineId={forcedRoutineId}
        isOpen={controlsOpen}
        onAuto={resumeAutomaticMode}
        onClose={() => setControlsOpen(false)}
        onNext={() => moveStep(1)}
        onPrevious={() => moveStep(-1)}
        onSelectRoutine={selectRoutine}
      />
    </main>
  );
}
