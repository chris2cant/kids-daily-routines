"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useRoutineSettings } from "../hooks/use-routine-settings";
import { IMAGE_OPTIONS, PALETTE, WEEKDAYS } from "../routines";
import type { Activity, Routine, RoutineSettingsData } from "../types";

function newId() {
  return crypto.randomUUID();
}

export function RoutineSettings() {
  const { isReady, reset, settings, save, setSettings } = useRoutineSettings();
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"flows" | "activities">("flows");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const resetDialogRef = useRef<HTMLDialogElement>(null);
  const selectedFlow =
    settings.routines.find((flow) => flow.id === selectedId) ?? settings.routines[0];

  function updateSettings(update: (current: RoutineSettingsData) => RoutineSettingsData) {
    setSavedMessage("");
    setSettings(update);
  }
  function updateFlow(id: string, update: (flow: Routine) => Routine) {
    updateSettings((current) => ({
      ...current,
      routines: current.routines.map((flow) => (flow.id === id ? update(flow) : flow)),
    }));
  }
  function updateActivity(id: string, update: (activity: Activity) => Activity) {
    updateSettings((current) => ({
      ...current,
      activities: current.activities.map((activity) =>
        activity.id === id ? update(activity) : activity,
      ),
    }));
  }
  function addFlow() {
    const id = newId();
    updateSettings((current) => ({
      ...current,
      routines: [
        ...current.routines,
        { id, label: "Nouveau flow", enabled: true, days: [], steps: [] },
      ],
    }));
    setSelectedId(id);
    setTab("flows");
  }
  function addActivity() {
    const id = newId();
    updateSettings((current) => ({
      ...current,
      activities: [
        ...current.activities,
        { id, label: "Nouvelle activité", image: IMAGE_OPTIONS[0].image, color: PALETTE[0].color },
      ],
    }));
    setTab("activities");
  }
  async function uploadImage(id: string, file: File | undefined) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 750_000) {
      setSavedMessage("Choisissez une image PNG, JPEG ou WebP de moins de 750 Ko.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Image illisible"));
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      updateActivity(id, (activity) => ({ ...activity, image: dataUrl }));
    } catch {
      setSavedMessage("Impossible de lire cette image.");
    }
  }
  function removeActivity(id: string) {
    updateSettings((current) => ({
      activities: current.activities.filter((activity) => activity.id !== id),
      routines: current.routines.map((flow) => ({
        ...flow,
        steps: flow.steps.filter((step) => step.activityId !== id),
      })),
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      save(settings);
      setSavedMessage("Configuration enregistrée");
    } catch {
      setSavedMessage("Stockage local plein. Choisissez une image plus petite.");
    }
  }
  function restoreDefaults() {
    reset();
    setSelectedId(null);
    setSavedMessage("Configuration d’origine restaurée");
  }
  function confirmRestoreDefaults() {
    restoreDefaults();
    setIsResetDialogOpen(false);
  }

  useEffect(() => {
    const dialog = resetDialogRef.current;
    if (!dialog) return;

    if (isResetDialogOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isResetDialogOpen]);

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <span className="eyebrow">Espace parents</span>
          <h1>Vos flows</h1>
          <p>Créez un déroulé pour chaque rythme de la semaine.</p>
        </div>
        <Link className="back-link" href="/">
          ← Voir la routine
        </Link>
      </header>
      <form className="settings-form" onSubmit={submit}>
        <div className="settings-tabs" role="tablist" aria-label="Configuration">
          <button
            aria-selected={tab === "flows"}
            onClick={() => setTab("flows")}
            role="tab"
            type="button"
          >
            Flows
          </button>
          <button
            aria-selected={tab === "activities"}
            onClick={() => setTab("activities")}
            role="tab"
            type="button"
          >
            Catalogue des activités
          </button>
        </div>

        {tab === "flows" ? (
          <div className="flow-layout">
            <aside className="flow-list" aria-label="Liste des flows">
              <div className="section-heading">
                <h2>Mes flows</h2>
                <button disabled={!isReady} onClick={addFlow} type="button">
                  + Nouveau flow
                </button>
              </div>
              {settings.routines.map((flow) => (
                <button
                  aria-current={selectedFlow?.id === flow.id ? "true" : undefined}
                  className="flow-list__item"
                  key={flow.id}
                  onClick={() => setSelectedId(flow.id)}
                  type="button"
                >
                  <strong>{flow.label}</strong>
                  <span>
                    {flow.days.length
                      ? flow.days.map((day) => WEEKDAYS[day]).join(" · ")
                      : "Aucun jour"}{" "}
                    · {flow.steps.length} étapes
                  </span>
                </button>
              ))}
            </aside>
            {selectedFlow ? (
              <section className="settings-card flow-editor" key={selectedFlow.id}>
                <div className="section-heading">
                  <h2>Configurer le flow</h2>
                  <button
                    className="danger-link"
                    onClick={() => {
                      updateSettings((current) => ({
                        ...current,
                        routines: current.routines.filter((flow) => flow.id !== selectedFlow.id),
                      }));
                      setSelectedId(null);
                    }}
                    type="button"
                  >
                    Supprimer le flow
                  </button>
                </div>
                <label className="field-label">
                  Nom du flow
                  <input
                    maxLength={80}
                    onChange={(event) =>
                      updateFlow(selectedFlow.id, (flow) => ({
                        ...flow,
                        label: event.target.value,
                      }))
                    }
                    required
                    type="text"
                    value={selectedFlow.label}
                  />
                </label>
                <label className="toggle flow-enabled">
                  <input
                    checked={selectedFlow.enabled}
                    onChange={(event) =>
                      updateFlow(selectedFlow.id, (flow) => ({
                        ...flow,
                        enabled: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Flow actif
                </label>
                <fieldset className="weekday-fieldset">
                  <legend>Jours concernés</legend>
                  <div className="weekday-grid">
                    {WEEKDAYS.map((day, index) => (
                      <label key={day}>
                        <input
                          checked={selectedFlow.days.includes(index)}
                          onChange={(event) =>
                            updateFlow(selectedFlow.id, (flow) => ({
                              ...flow,
                              days: event.target.checked
                                ? [...flow.days, index].sort((a, b) => a - b)
                                : flow.days.filter((value) => value !== index),
                            }))
                          }
                          type="checkbox"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="section-heading step-heading">
                  <h3>Étapes et horaires</h3>
                  <span>Classées automatiquement par heure</span>
                </div>
                <div className="flow-steps">
                  {selectedFlow.steps.map((step) => {
                    const activity = settings.activities.find(
                      (item) => item.id === step.activityId,
                    );
                    return (
                      <div className="flow-step-row" key={step.id}>
                        <span
                          className="activity-thumb"
                          style={{ backgroundColor: activity?.color }}
                        >
                          {activity ? (
                            <Image alt="" fill sizes="48px" src={activity.image} unoptimized />
                          ) : null}
                        </span>
                        <select
                          aria-label={`Activité de l’étape ${step.id}`}
                          onChange={(event) =>
                            updateFlow(selectedFlow.id, (flow) => ({
                              ...flow,
                              steps: flow.steps.map((item) =>
                                item.id === step.id
                                  ? { ...item, activityId: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          value={step.activityId}
                        >
                          {settings.activities.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label={`Heure de ${activity?.label ?? "l’étape"}, ${selectedFlow.label}`}
                          onChange={(event) =>
                            updateFlow(selectedFlow.id, (flow) => ({
                              ...flow,
                              steps: flow.steps
                                .map((item) =>
                                  item.id === step.id
                                    ? { ...item, startTime: event.target.value }
                                    : item,
                                )
                                .toSorted((a, b) => a.startTime.localeCompare(b.startTime)),
                            }))
                          }
                          required
                          type="time"
                          value={step.startTime}
                        />
                        <button
                          aria-label={`Supprimer ${activity?.label ?? "l’étape"} du flow`}
                          className="remove-step"
                          onClick={() =>
                            updateFlow(selectedFlow.id, (flow) => ({
                              ...flow,
                              steps: flow.steps.filter((item) => item.id !== step.id),
                            }))
                          }
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="add-step"
                  disabled={settings.activities.length === 0}
                  onClick={() =>
                    updateFlow(selectedFlow.id, (flow) => ({
                      ...flow,
                      steps: [
                        ...flow.steps,
                        {
                          id: newId(),
                          activityId: settings.activities[0]!.id,
                          startTime: flow.steps.at(-1)?.startTime ?? "08:00",
                        },
                      ],
                    }))
                  }
                  type="button"
                >
                  + Ajouter une étape
                </button>
                {settings.activities.length === 0 ? (
                  <p>Créez d’abord une activité dans le catalogue.</p>
                ) : null}
              </section>
            ) : (
              <section className="settings-card">Créez un flow pour commencer.</section>
            )}
          </div>
        ) : (
          <section className="settings-card catalog-section">
            <div className="section-heading">
              <div>
                <h2>Catalogue des activités</h2>
                <p>Une activité garde la même image et la même couleur dans tous les flows.</p>
              </div>
              <button disabled={!isReady} onClick={addActivity} type="button">
                + Nouvelle activité
              </button>
            </div>
            <div className="activity-grid">
              {settings.activities.map((activity) => (
                <article className="activity-card" key={activity.id}>
                  <div className="activity-preview" style={{ backgroundColor: activity.color }}>
                    <Image alt="" fill sizes="150px" src={activity.image} unoptimized />
                  </div>
                  <label className="field-label">
                    Nom
                    <input
                      maxLength={80}
                      onChange={(event) =>
                        updateActivity(activity.id, (item) => ({
                          ...item,
                          label: event.target.value,
                        }))
                      }
                      required
                      type="text"
                      value={activity.label}
                    />
                  </label>
                  <label className="field-label">
                    Image
                    <select
                      onChange={(event) =>
                        updateActivity(activity.id, (item) => ({
                          ...item,
                          image: event.target.value,
                        }))
                      }
                      value={
                        IMAGE_OPTIONS.some((option) => option.image === activity.image)
                          ? activity.image
                          : "custom"
                      }
                    >
                      {!IMAGE_OPTIONS.some((option) => option.image === activity.image) ? (
                        <option value="custom">Image importée</option>
                      ) : null}
                      {IMAGE_OPTIONS.map((option) => (
                        <option key={option.image} value={option.image}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Importer une image
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      aria-label={`Importer une image pour ${activity.label}`}
                      onChange={(event) => void uploadImage(activity.id, event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                  <fieldset className="palette-fieldset">
                    <legend>Couleur</legend>
                    <div className="palette-options">
                      {PALETTE.map((option) => (
                        <label key={option.color} title={option.name}>
                          <input
                            aria-label={`${activity.label} : ${option.name}`}
                            checked={activity.color === option.color}
                            name={`color-${activity.id}`}
                            onChange={() =>
                              updateActivity(activity.id, (item) => ({
                                ...item,
                                color: option.color,
                              }))
                            }
                            type="radio"
                          />
                          <span style={{ backgroundColor: option.color }} />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button
                    className="danger-link"
                    onClick={() => removeActivity(activity.id)}
                    type="button"
                  >
                    Supprimer l’activité
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        <footer className="settings-actions">
          <button
            className="secondary-button"
            onClick={() => setIsResetDialogOpen(true)}
            type="button"
          >
            Réinitialiser
          </button>
          <span aria-live="polite">{savedMessage}</span>
          <button className="primary-button" disabled={!isReady} type="submit">
            Enregistrer
          </button>
        </footer>
      </form>
      <dialog
        aria-labelledby="reset-dialog-title"
        className="reset-dialog"
        onCancel={(event) => {
          event.preventDefault();
          setIsResetDialogOpen(false);
        }}
        onClose={() => setIsResetDialogOpen(false)}
        ref={resetDialogRef}
      >
        <h2 id="reset-dialog-title">Réinitialiser la configuration ?</h2>
        <p>
          Toutes vos activités et tous vos flows personnalisés seront remplacés par la configuration
          d’origine. Cette action est immédiate.
        </p>
        <div className="reset-dialog__actions">
          <button
            className="secondary-button"
            onClick={() => setIsResetDialogOpen(false)}
            type="button"
          >
            Annuler
          </button>
          <button className="danger-button" onClick={confirmRestoreDefaults} type="button">
            Réinitialiser
          </button>
        </div>
      </dialog>
    </main>
  );
}
