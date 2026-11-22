"use client";

import { ArrowDownRight, Sliders } from "lucide-react";
import { formatCurrency } from "@/lib/calculator";
import type { PromoSimulationResult } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface PromoSimulatorProps {
  discountPercent: number;
  onChangeDiscount: (next: number) => void;
  simulation: PromoSimulationResult;
}

export function PromoSimulator({
  discountPercent,
  onChangeDiscount,
  simulation,
}: PromoSimulatorProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white";
  const subBoxClass = isDark
    ? "border-zinc-800/80 bg-[#0A0A0A]"
    : "border-slate-200 bg-slate-50/70";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  return (
    <section className={`rounded-xl border p-5 space-y-4 ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm sm:text-base font-bold">
            ตัวจำลองโปรโมชันส่วนลด (Promo Discount Simulator)
          </h3>
        </div>
        <span
          className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
            isDark
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
              : "border-emerald-600/30 bg-emerald-50 text-emerald-700"
          }`}
        >
          ลด {discountPercent}%
        </span>
      </div>

      <div className="space-y-1.5">
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={discountPercent}
          onChange={(e) => onChangeDiscount(Number(e.target.value))}
          aria-label="แถบเลื่อนส่วนลดโปรโมชัน 0 ถึง 50 เปอร์เซ็นต์"
          className="w-full accent-emerald-500 cursor-pointer h-2 rounded-lg"
        />
        <div
          className={`flex justify-between text-[11px] font-mono tabular-nums ${subtleText}`}
        >
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
          <span>50%</span>
        </div>
      </div>

      <div className={`rounded-lg border p-4 space-y-3 ${subBoxClass}`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <span className={`text-xs ${mutedText}`}>ราคาขายหลังลด</span>
            <p className="text-lg font-bold font-mono tabular-nums mt-0.5">
              ฿{formatCurrency(simulation.discountedPrice)}
            </p>
          </div>
          <div>
            <span className={`text-xs ${mutedText}`}>กำไรสุทธิต่อชิ้นหลังลด</span>
            <p
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                simulation.discountedProfitPerUnit > 0
                  ? "text-emerald-500"
                  : "text-rose-500"
              }`}
            >
              {simulation.discountedProfitPerUnit >= 0 ? "+" : "-"}฿
              {formatCurrency(Math.abs(simulation.discountedProfitPerUnit))}
            </p>
          </div>
          <div>
            <span className={`text-xs ${mutedText}`}>จุดคุ้มทุนใหม่</span>
            <p className="text-lg font-bold font-mono tabular-nums mt-0.5">
              {simulation.discountedBreakEvenUnits !== null
                ? `${simulation.discountedBreakEvenUnits.toLocaleString("th-TH")} ชิ้น`
                : "ไม่สามารถคืนทุนได้"}
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed ${
            simulation.discountedProfitPerUnit > 0
              ? isDark
                ? "border-emerald-500/30 bg-emerald-500/10 text-zinc-200"
                : "border-emerald-500/30 bg-emerald-50 text-slate-800"
              : isDark
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-rose-300 bg-rose-50 text-rose-800"
          }`}
        >
          {simulation.discountedProfitPerUnit > 0 &&
          simulation.requiredUnitsForSameProfit !== null ? (
            <p>
              หากลดราคาเหลือ{" "}
              <strong className="font-mono tabular-nums">
                ฿{formatCurrency(simulation.discountedPrice)}
              </strong>{" "}
              กำไรต่อชิ้นจะเหลือ{" "}
              <strong className="font-mono tabular-nums">
                ฿{formatCurrency(simulation.discountedProfitPerUnit)}
              </strong>{" "}
              (Margin {formatCurrency(simulation.discountedMarginPercent, 1)}%)
              ต้องขายให้ได้{" "}
              <strong
                className={`font-mono tabular-nums underline ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                {simulation.requiredUnitsForSameProfit.toLocaleString("th-TH")}{" "}
                ชิ้น
              </strong>{" "}
              จึงจะได้กำไรรวมเท่ากับการขายปกติ {simulation.baselineUnits} ชิ้น (
              {formatCurrency(simulation.volumeMultiplier ?? 1, 2)} เท่า)
            </p>
          ) : (
            <p className="flex items-center gap-1.5 font-medium">
              <ArrowDownRight className="h-4 w-4 shrink-0" />
              <span>
                หากลดราคาเหลือ ฿{formatCurrency(simulation.discountedPrice)}{" "}
                กำไรต่อชิ้นจะติดลบหรือเป็นศูนย์ ไม่แนะนำให้จัดโปรโมชันในราคานี้
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
