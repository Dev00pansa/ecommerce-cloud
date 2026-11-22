"use client";

import { useSyncExternalStore } from "react";
import type { AppLanguage } from "@/types";

const STORAGE_KEY = "khumlab_lang";
const CHANGE_EVENT = "khumlab-lang-change";

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "th";
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "en" ? "en" : "th";
  } catch {
    return "th";
  }
}

function getServerSnapshot(): AppLanguage {
  return "th";
}

function subscribeLanguage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function setAppLanguage(next: AppLanguage): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useAppLanguage(): [AppLanguage, (next: AppLanguage) => void] {
  const language = useSyncExternalStore(
    subscribeLanguage,
    readStoredLanguage,
    getServerSnapshot
  );

  return [language, setAppLanguage];
}
