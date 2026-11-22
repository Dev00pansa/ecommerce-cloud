"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface DashboardToastData {
  id: number;
  message: string;
  variant: "success" | "error";
}

interface DashboardToastProps {
  toast: DashboardToastData | null;
  onDismiss: () => void;
}

const TOAST_DURATION_MS = 4500;
const FADE_OUT_MS = 280;

export function DashboardToast({ toast, onDismiss }: DashboardToastProps) {
  const [fadingOutId, setFadingOutId] = useState<number | null>(null);

  useEffect(() => {
    if (!toast) return;

    const currentId = toast.id;
    const fadeTimer = window.setTimeout(() => {
      setFadingOutId(currentId);
    }, TOAST_DURATION_MS);

    const dismissTimer = window.setTimeout(() => {
      onDismiss();
    }, TOAST_DURATION_MS + FADE_OUT_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.variant === "error";
  const isFadingOut = fadingOutId === toast.id;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed bottom-20 sm:bottom-7 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md transition-all duration-300 ease-out ${
        isFadingOut
          ? "opacity-0 translate-y-2 pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#050505] border px-4 py-3.5 pr-11 ${
          isError
            ? "border-rose-500/45 shadow-[0_16px_45px_rgba(0,0,0,0.9),0_0_25px_-5px_rgba(244,63,94,0.32)]"
            : "border-emerald-500/40 shadow-[0_16px_45px_rgba(0,0,0,0.9),0_0_25px_-5px_rgba(16,185,129,0.3)]"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
            isError ? "via-rose-400/70" : "via-emerald-400/75"
          }`}
        />

        <div className="flex items-start gap-3">
          {isError ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          )}
          <p
            className={`text-xs sm:text-sm font-medium leading-relaxed ${
              isError ? "text-rose-200" : "text-zinc-100"
            }`}
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิดการแจ้งเตือน"
          className="absolute top-3 right-3 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-900/90">
          <div
            key={toast.id}
            className={`h-full w-full animate-toast-countdown ${
              isError ? "bg-rose-400" : "bg-emerald-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
