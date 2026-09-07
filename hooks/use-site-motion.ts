"use client";

import { useSyncExternalStore } from "react";

const storageKey = "bindays-motion-enabled";
const changeEvent = "bindays-motion-change";
const motionQuery = "(prefers-reduced-motion: reduce)";
let override: boolean | null = null;

function getOverride() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "true" || stored === "false") return stored === "true";
  } catch {
    // Keep the preference usable when browser storage is unavailable.
  }
  return override;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

function setEnabled(enabled: boolean) {
  override = enabled;
  try {
    localStorage.setItem(storageKey, String(enabled));
  } catch {
    // The in-memory override still works for this visit.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useSiteMotion() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => getOverride() ?? !window.matchMedia(motionQuery).matches,
    () => false,
  );
  return { enabled, setEnabled };
}
