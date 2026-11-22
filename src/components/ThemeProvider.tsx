"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ThemeMode } from "@/types";

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * ตัวจัดการธีมหลัก โฟกัสโหมดสีดำสนิท-เขียวมรกต (Pure Black & Emerald)
 * ห้ามใส่ overflow-hidden บน Wrapper เพื่อให้ position: sticky ทำงานได้ 100%
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        isDark: true,
        setTheme: () => {},
        toggleTheme: () => {},
      }}
    >
      <div className="min-h-screen bg-dot-dark text-zinc-100 flex flex-col">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
