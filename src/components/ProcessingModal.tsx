"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, Cpu } from "lucide-react";
import { useAppLanguage } from "@/lib/language";
import { KhumLabLogo } from "@/components/KhumLabLogo";

interface ProcessingModalProps {
  productName: string;
  onComplete: () => void;
}

function getDiagnosticStatusText(progress: number, isEn: boolean): string {
  if (progress < 30) {
    return isEn
      ? "Validating cost structure & platform GP fees..."
      : "กำลังตรวจสอบโครงสร้างต้นทุนและค่าธรรมเนียมแพลตฟอร์ม...";
  }
  if (progress < 65) {
    return isEn
      ? "Calculating break-even point & return loss risk..."
      : "กำลังคำนวณจุดคุ้มทุนและประเมินความเสี่ยงพัสดุตีกลับ...";
  }
  if (progress < 90) {
    return isEn
      ? "Simulating promotion sensitivity & building analytics charts..."
      : "กำลังจำลองตารางส่วนลดโปรโมชันและสร้างกราฟวิเคราะห์...";
  }
  return isEn
    ? "Analysis complete! Preparing financial diagnostic report..."
    : "ประมวลผลสำเร็จ! กำลังเตรียมรายงานวินิจฉัยกำไร...";
}

function getActiveStageIndex(progress: number): number {
  if (progress < 30) return 0;
  if (progress < 65) return 1;
  if (progress < 90) return 2;
  return 3;
}

export function ProcessingModal({
  productName,
  onComplete,
}: ProcessingModalProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";

  const [progress, setProgress] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let current = 0;
    let timerId: number | undefined;

    const scheduleNextStep = () => {
      if (cancelled) return;

      const delayMs = 180 + Math.floor(Math.random() * 81);
      timerId = window.setTimeout(() => {
        if (cancelled) return;

        const increment = 9 + Math.floor(Math.random() * 16);
        const remaining = 100 - current;

        if (remaining <= 12 || current + increment >= 100) {
          current = 100;
        } else if (current + increment > 97) {
          current = 96;
        } else {
          current += increment;
        }

        setProgress(current);

        if (current >= 100) {
          timerId = window.setTimeout(() => {
            if (!cancelled) {
              onCompleteRef.current();
            }
          }, 250);
          return;
        }

        scheduleNextStep();
      }, delayMs);
    };

    scheduleNextStep();

    return () => {
      cancelled = true;
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const statusText = getDiagnosticStatusText(progress, isEn);
  const activeStage = getActiveStageIndex(progress);
  const isDone = progress >= 100;
  const displayProduct =
    productName.trim() || (isEn ? "Untitled Product" : "สินค้าที่กำลังคำนวณ");

  const stages = isEn
    ? ["Cost & GP", "Break-Even", "Promo & Charts", "Report Ready"]
    : ["ต้นทุน & GP", "จุดคุ้มทุน", "โปรโมชัน & กราฟ", "พร้อมสรุปผล"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={
        isEn
          ? "Running financial diagnostic analysis"
          : "กำลังประมวลผลและวิเคราะห์กำไร"
      }
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 light:bg-slate-900/45 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/35 bg-[#060807]/95 shadow-[0_24px_64px_rgba(0,0,0,0.9),0_0_44px_-10px_rgba(16,185,129,0.32)] light:border-slate-200 light:bg-white light:shadow-[0_24px_64px_rgba(15,23,42,0.18)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 light:via-emerald-500/50 to-transparent"
        />

        <div className="bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4 flex items-center justify-between gap-3 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/35 bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.22)] light:border-emerald-300 light:from-emerald-100 light:to-emerald-50 light:text-emerald-700 light:shadow-none">
              {isDone ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Cpu className="h-5 w-5 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700 block">
                DIAGNOSTIC ENGINE
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white light:text-slate-900 truncate">
                {isEn
                  ? "Analyzing Profit Structure"
                  : "กำลังวิเคราะห์โครงสร้างกำไร"}
              </h2>
            </div>
          </div>

          <KhumLabLogo size={30} className="shrink-0 opacity-90" />
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800/85 bg-black/65 px-4 py-3 light:border-slate-200 light:bg-slate-50">
            <div className="min-w-0">
              <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 light:text-slate-500">
                {isEn ? "Target Product" : "รายการสินค้าที่ประมวลผล"}
              </span>
              <p className="mt-0.5 text-sm sm:text-base font-semibold text-zinc-100 light:text-slate-900 truncate">
                {displayProduct}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-emerald-400 light:text-emerald-700">
                {progress}%
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="relative h-3 w-full overflow-hidden rounded-full border border-emerald-500/25 bg-zinc-950 light:border-slate-200 light:bg-slate-100">
              <div
                style={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_18px_rgba(16,185,129,0.65)] transition-all duration-200 ease-out light:from-emerald-600 light:via-emerald-500 light:to-teal-500 light:shadow-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 light:text-slate-700 min-h-[2.25rem]">
              <Activity
                className={`h-4 w-4 shrink-0 text-emerald-400 light:text-emerald-600 ${
                  isDone ? "" : "animate-pulse"
                }`}
              />
              <span className="leading-snug">{statusText}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {stages.map((label, idx) => {
              const completed = idx < activeStage || isDone;
              const currentStep = idx === activeStage && !isDone;
              return (
                <div
                  key={label}
                  className={`rounded-lg border px-2 py-1.5 text-center text-[11px] font-medium transition-colors ${
                    completed
                      ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-300 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-800"
                      : currentStep
                        ? "border-emerald-400/50 bg-emerald-500/8 text-white light:border-emerald-400 light:bg-emerald-50/70 light:text-slate-900"
                        : "border-zinc-800/80 bg-black/50 text-zinc-500 light:border-slate-200 light:bg-slate-50 light:text-slate-400"
                  }`}
                >
                  <span className="block truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
