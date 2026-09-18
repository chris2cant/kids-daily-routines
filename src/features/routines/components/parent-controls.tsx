import Link from "next/link";

import type { Routine } from "../types";

type ParentControlsProps = {
  activeRoutineId: string | null;
  routines: Routine[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  forcedRoutineId: string | null;
  isOpen: boolean;
  onAuto: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelectRoutine: (id: string) => void;
};

export function ParentControls({
  activeRoutineId,
  routines,
  canGoNext,
  canGoPrevious,
  forcedRoutineId,
  isOpen,
  onAuto,
  onClose,
  onNext,
  onPrevious,
  onSelectRoutine,
}: ParentControlsProps) {
  if (!isOpen) return null;

  return (
    <dialog className="parent-panel" aria-label="Commandes parents" open>
      <div className="parent-panel__header">
        <div>
          <span className="eyebrow">Espace parents</span>
          <h2>Piloter la routine</h2>
        </div>
        <button
          className="icon-button icon-button--dark"
          onClick={onClose}
          type="button"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <div className="routine-switch" aria-label="Choisir un flow">
        {routines
          .filter((routine) => routine.enabled)
          .map((routine) => (
            <button
              aria-pressed={activeRoutineId === routine.id}
              className={activeRoutineId === routine.id ? "is-selected" : ""}
              key={routine.id}
              onClick={() => onSelectRoutine(routine.id)}
              type="button"
            >
              {routine.id === "morning" ? "☀️ " : routine.id === "evening" ? "🌙 " : "✦ "}
              {routine.label.replace(/^Routine du /, "")}
            </button>
          ))}
      </div>

      <div className="step-controls">
        <button disabled={!canGoPrevious} onClick={onPrevious} type="button">
          <span aria-hidden="true">←</span> Précédente
        </button>
        <button
          className={forcedRoutineId === null ? "is-auto" : ""}
          onClick={onAuto}
          type="button"
        >
          ↻ Mode auto
        </button>
        <button disabled={!canGoNext} onClick={onNext} type="button">
          Suivante <span aria-hidden="true">→</span>
        </button>
      </div>

      <Link className="settings-link" href="/settings">
        Configurer les flows
      </Link>
    </dialog>
  );
}
