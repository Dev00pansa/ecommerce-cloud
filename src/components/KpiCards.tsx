"use client";

import {
  AlertTriangle,
  Coins,
  Package,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/calculator";
import type { CalculationMetrics } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface KpiCardsProps {
  metrics: CalculationMetrics;
  sellingPrice: number;
  platformFeePercent: number;
  fixedCost: number;
}

export function KpiCards({
  metrics,
  sellingPrice,
  platformFeePercent,
  fixedCost,
}: KpiCardsProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  return (
    <div className="space-y-4">
      {metrics.netProfitPerUnit < 0 && (
        <div
          role="alert"
          className={`flex items-start gap-3 rounded-xl border-2 border-rose-500 px-4 py-3.5 ${
            isDark
              ? "bg-rose-500/15 text-rose-300"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p
              className={`text-sm font-bold ${
                isDark ? "text-rose-400" : "text-rose-700"
              }`}
            >
              ขาดทุน! ควรปรับราคาขายเพิ่ม
            </p>
            <p className="text-xs mt-0.5">
              ราคาขาย (฿{formatCurrency(sellingPrice)}) ต่ำกว่าต้นทุนรวมต่อชิ้น (฿
              {formatCurrency(metrics.totalCostPerUnit)}) ขาดทุนชิ้นละ ฿
              {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className={`rounded-xl border p-4 ${cardClass}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${mutedText}`}>
              ต้นทุนรวมต่อชิ้น (บาท)
            </span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl lg:text-4xl font-bold font-mono tabular-nums leading-tight">
            ฿{formatCurrency(metrics.totalCostPerUnit)}
          </p>
          <p className={`mt-1 text-xs ${subtleText}`}>
            รวมค่าธรรมเนียม {platformFeePercent}% (฿
            {formatCurrency(metrics.platformFeeBaht)})
          </p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            metrics.netProfitPerUnit < 0
              ? isDark
                ? "border-rose-500/60 bg-rose-500/10"
                : "border-rose-300 bg-rose-50/70"
              : cardClass
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${mutedText}`}>
              กำไรสุทธิต่อชิ้น (บาท)
            </span>
            {metrics.netProfitPerUnit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <p
            className={`text-3xl lg:text-4xl font-bold font-mono tabular-nums leading-tight ${
              metrics.netProfitPerUnit > 0
                ? "text-emerald-500"
                : metrics.netProfitPerUnit < 0
                  ? "text-rose-500"
                  : ""
            }`}
          >
            {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
            {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
          </p>
          <p className={`mt-1 text-xs ${subtleText}`}>
            {metrics.netProfitPerUnit < 0
              ? "ขาดทุน! ควรปรับราคาขายเพิ่ม"
              : "หักสินค้า ค่าแพ็ก ค่าแอด และ GP แล้ว"}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${cardClass}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${mutedText}`}>
              อัตรากำไรสุทธิ (Net Margin %)
            </span>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <p
            className={`text-3xl lg:text-4xl font-bold font-mono tabular-nums leading-tight ${
              metrics.netMarginPercent >= 20
                ? "text-emerald-500"
                : metrics.netMarginPercent > 0
                  ? "text-amber-500"
                  : "text-rose-500"
            }`}
          >
            {formatCurrency(metrics.netMarginPercent, 1)}%
          </p>
          <p className={`mt-1 text-xs ${subtleText}`}>
            {metrics.netMarginPercent >= 20
              ? "สัดส่วนกำไรแข็งแรง (>= 20%)"
              : metrics.netMarginPercent > 0
                ? "กำไรบาง ควรระวังตอนจัดโปรลดราคา"
                : "ไม่มีกำไรสุทธิ"}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${cardClass}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${mutedText}`}>
              จุดคุ้มทุน (Break-Even Point)
            </span>
            <Target className="h-4 w-4 text-purple-500" />
          </div>
          {metrics.canBreakEven && metrics.breakEvenUnits !== null ? (
            <>
              <p className="text-3xl lg:text-4xl font-bold font-mono tabular-nums leading-tight">
                {metrics.breakEvenUnits.toLocaleString("th-TH")}{" "}
                <span className="text-base font-sans font-medium">ชิ้น</span>
              </p>
              <p className={`mt-1 text-xs ${subtleText}`}>
                ยอดขายคืนทุน ฿{formatCurrency(metrics.breakEvenRevenue ?? 0, 0)}{" "}
                (ทุนคงที่ ฿{formatCurrency(fixedCost, 0)})
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-rose-500">
                ไม่สามารถคืนทุนได้
              </p>
              <p className={`mt-1 text-xs ${subtleText}`}>
                กำไรต่อชิ้น &le; 0 บาท กรุณาเพิ่มราคาขาย
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
