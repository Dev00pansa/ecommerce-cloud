"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ThemeMode } from "@/types";

const THEME_STORAGE_KEY = "ecom_marginlab_theme";
const THEME_CHANGE_EVENT = "ecom-theme-change";

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
  };
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

/**
 * ตัวจัดการโหมดสี 2 รูปแบบ (ปกติ Light / มืดสนิท Pure Black)
 * ใช้ useSyncExternalStore เพื่ออ่านค่าจาก localStorage โดยไม่เกิด Hydration Mismatch
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const setTheme = useCallback((next: ThemeMode) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    setTheme(current === "dark" ? "light" : "dark");
  }, [setTheme]);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          isDark
            ? "bg-dot-dark text-zinc-100"
            : "bg-dot-light text-slate-900"
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
