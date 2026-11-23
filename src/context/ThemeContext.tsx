"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ThemeMode } from "@/types";

export const THEME_STORAGE_KEY = "khumlab_theme";
const THEME_CHANGE_EVENT = "khumlab-theme-change";
const DEFAULT_THEME: ThemeMode = "light";

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "dark" ? "dark" : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function getServerThemeSnapshot(): ThemeMode {
  return DEFAULT_THEME;
}

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
  } else {
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  }
}

export function setAppTheme(next: ThemeMode): void {
  if (typeof window === "undefined") return;
  applyThemeToDocument(next);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {}
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  isDark: false,
  isLight: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    getServerThemeSnapshot
  );

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setAppTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = readStoredTheme();
    setAppTheme(current === "light" ? "dark" : "light");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      isLight: theme === "light",
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="min-h-screen bg-dot-dark text-zinc-100 light:text-slate-900 flex flex-col">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
