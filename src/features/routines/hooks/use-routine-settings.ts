"use client";

import { useMemo, useState, useSyncExternalStore, type SetStateAction } from "react";

import { LEGACY_STORAGE_KEY, parseStoredSettings, ROUTINE_STORAGE_KEY } from "../routines";
import type { RoutineSettingsData } from "../types";

const STORAGE_EVENT = "petites-routines:settings-changed";

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === ROUTINE_STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) onChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}
function snapshot() {
  return JSON.stringify([
    window.localStorage.getItem(ROUTINE_STORAGE_KEY),
    window.localStorage.getItem(LEGACY_STORAGE_KEY),
  ]);
}
function serverSnapshot() {
  return "[null,null]";
}
function subscribeHydration() {
  return () => undefined;
}
function hydrated() {
  return true;
}
function serverHydrated() {
  return false;
}

export function useRoutineSettings() {
  const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const isReady = useSyncExternalStore(subscribeHydration, hydrated, serverHydrated);
  const storedSettings = useMemo(() => {
    const [value, legacy] = JSON.parse(stored) as [string | null, string | null];
    return parseStoredSettings(value, legacy);
  }, [stored]);
  const [draft, setDraft] = useState<RoutineSettingsData | null>(null);
  const settings = draft ?? storedSettings;

  function setSettings(update: SetStateAction<RoutineSettingsData>) {
    setDraft((current) => {
      const value = current ?? storedSettings;
      return typeof update === "function" ? update(value) : update;
    });
  }
  function save(next: RoutineSettingsData) {
    window.localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(next));
    setDraft(next);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
  function reset() {
    const defaults = parseStoredSettings(null);
    save(defaults);
  }
  return { isReady, settings, setSettings, save, reset };
}
