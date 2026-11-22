"use client";

import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/calculator";
import type { CalculationMetrics } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface PriceBreakdownChartProps {
  costPrice: number;
  sellingPrice: number;
  metrics: CalculationMetrics;
}

export function PriceBreakdownChart({
  costPrice,
  sellingPrice,
  metrics,
}: PriceBreakdownChartProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white";
  const subBoxClass = isDark
    ? "border-zinc-800/80 bg-[#0A0A0A]"
    : "border-slate-200 bg-slate-50/70";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  const donutRadius = 62;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const segments = [
    {
      key: "product",
      label: "ต้นทุนสินค้า",
      amount: costPrice,
      percent: metrics.productCostShare,
      color: "#3b82f6",
      dotClass: "bg-blue-500",
    },
    {
      key: "packAds",
      label: "ค่าแพ็กและค่าแอด",
      amount: metrics.packAndAdsCost,
      percent: metrics.packAdsShare,
      color: "#f59e0b",
      dotClass: "bg-amber-500",
    },
    {
      key: "fee",
      label: "ค่าธรรมเนียมแพลตฟอร์ม",
      amount: metrics.platformFeeBaht,
      percent: metrics.feeShare,
      color: "#a855f7",
      dotClass: "bg-purple-500",
    },
    {
      key: "profit",
      label: "กำไรสุทธิ",
      amount: Math.max(0, metrics.netProfitPerUnit),
      percent: metrics.profitShare,
      color: "#10b981",
      dotClass: "bg-emerald-500",
    },
  ];

  return (
    <section className={`rounded-xl border p-5 space-y-4 ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm sm:text-base font-bold">
            กราฟสัดส่วนโครงสร้างราคา (Price Breakdown)
          </h3>
        </div>
        <span className={`text-xs font-mono tabular-nums ${subtleText}`}>
          เทียบราคาขาย ฿{formatCurrency(sellingPrice)}
        </span>
      </div>

      <div
        className={`flex h-3.5 w-full overflow-hidden rounded-full p-0.5 ${
          isDark ? "bg-zinc-900" : "bg-slate-200"
        }`}
      >
        {segments.map((seg) =>
          seg.percent > 0 ? (
            <div
              key={seg.key}
              style={{
                width: `${Math.max(seg.percent, 2)}%`,
                backgroundColor: seg.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
              title={`${seg.label}: ฿${formatCurrency(seg.amount)} (${formatCurrency(seg.percent, 1)}%)`}
            />
          ) : null
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-5 pt-1">
        <div className="sm:col-span-5 flex justify-center">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={donutRadius}
                fill="transparent"
                stroke={isDark ? "#18181b" : "#e2e8f0"}
                strokeWidth="18"
              />
              {
                segments.reduce<{ offset: number; items: ReactNode[] }>(
                  (acc, seg) => {
                    const dash =
                      (Math.max(0, seg.percent) / 100) * donutCircumference;
                    const node =
                      dash > 0 ? (
                        <circle
                          key={seg.key}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="18"
                          strokeDasharray={`${dash} ${donutCircumference}`}
                          strokeDashoffset={-acc.offset}
                          className="transition-all duration-300"
                        />
                      ) : null;
                    return {
                      offset: acc.offset + dash,
                      items: [...acc.items, node],
                    };
                  },
                  { offset: 0, items: [] }
                ).items
              }
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-[11px] ${subtleText}`}>ราคาขาย</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                ฿{formatCurrency(sellingPrice, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="sm:col-span-7 grid grid-cols-1 gap-2">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${subBoxClass}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${seg.dotClass}`}
                />
                <span className="font-medium">{seg.label}</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-semibold">
                  ฿{formatCurrency(seg.amount)}
                </span>{" "}
                <span className={subtleText}>
                  ({formatCurrency(seg.percent, 1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
