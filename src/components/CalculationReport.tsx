"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Download,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { MAX_CLOUD_RECORDS, formatCurrency } from "@/lib/calculator";
import type {
  CalculationMetrics,
  CalculatorInputValues,
  PromoSimulationResult,
} from "@/types";

interface CalculationReportProps {
  inputs: CalculatorInputValues;
  metrics: CalculationMetrics;
  simulation: PromoSimulationResult;
  discountPercent: number;
  previewImageUrl: string | null;
  saving: boolean;
  isCloudFull: boolean;
  onChangeDiscount: (next: number) => void;
  onSaveToCloud: () => void;
  onExportCsv: () => void;
  onEditTop: () => void;
}

export function CalculationReport({
  inputs,
  metrics,
  simulation,
  discountPercent,
  previewImageUrl,
  saving,
  isCloudFull,
  onChangeDiscount,
  onSaveToCloud,
  onExportCsv,
  onEditTop,
}: CalculationReportProps) {
  const [showPromoSimulator, setShowPromoSimulator] = useState(false);

  const productTitle = inputs.productName.trim() || "สินค้าไม่ได้ระบุชื่อ";
  const isLoss = metrics.netProfitPerUnit < 0;
  const isThinMargin = !isLoss && metrics.netMarginPercent < 15;

  const statusText = isLoss
    ? "ราคาขายนี้ขาดทุนต่อชิ้น"
    : isThinMargin
      ? "กำไรบาง ระวังขาดทุนตอนจัดโปร"
      : "กำไรดี พร้อมลุยขาย";

  const statusColorClass = isLoss
    ? "text-rose-400 border-rose-500/50 bg-rose-950/30"
    : isThinMargin
      ? "text-amber-300 border-amber-500/50 bg-amber-950/30"
      : "text-emerald-400 border-emerald-500/50 bg-emerald-950/30";

  const sellingBase = inputs.sellingPrice > 0 ? inputs.sellingPrice : 0;
  const shareOfSelling = (amount: number): string => {
    if (sellingBase <= 0) return "0.0%";
    return `${formatCurrency((amount / sellingBase) * 100, 1)}%`;
  };

  return (
    <section
      id="calculation-report"
      className="relative scroll-mt-20 overflow-hidden rounded-2xl bg-[#050505] border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_32px_-8px_rgba(16,185,129,0.22)] space-y-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 to-transparent"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {previewImageUrl ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={productTitle}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 select-none">
              <ImageIcon className="h-5 w-5 text-zinc-500" />
              <span className="text-[10px] font-medium tracking-tight text-zinc-500 leading-none">
                ไม่มีรูปภาพ
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                STEP 04 — FINANCIAL SUMMARY
              </span>
              <span className="text-xs text-zinc-600">|</span>
              <span className="text-xs font-medium text-zinc-400">
                ช่องทาง: {inputs.platform} (GP {inputs.platformFeePercent}%)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {productTitle}
            </h2>
          </div>
        </div>

        <div
          className={`self-start sm:self-center rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold ${statusColorClass}`}
        >
          {statusText}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 border-y border-zinc-800/90 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/90">
        <div className="py-5 sm:pr-5">
          <span className="block text-xs text-zinc-400">กำไรสุทธิต่อชิ้น</span>
          <p
            className={`mt-1.5 text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
              isLoss ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
            {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
          </p>
        </div>

        <div className="py-5 sm:px-5">
          <span className="block text-xs text-zinc-400">อัตรากำไร %</span>
          <p
            className={`mt-1.5 text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
              isLoss
                ? "text-rose-400"
                : isThinMargin
                  ? "text-amber-300"
                  : "text-zinc-100"
            }`}
          >
            {formatCurrency(metrics.netMarginPercent, 1)}%
          </p>
        </div>

        <div className="py-5 sm:px-5">
          <span className="block text-xs text-zinc-400">
            ต้นทุนรวมทั้งหมดต่อชิ้น
          </span>
          <p className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold tabular-nums text-zinc-100">
            ฿{formatCurrency(metrics.totalCostPerUnit)}
          </p>
        </div>

        <div className="py-5 sm:pl-5">
          <span className="block text-xs text-zinc-400">
            จุดคุ้มทุน (จำนวนชิ้น)
          </span>
          {inputs.fixedCost <= 0 ? (
            <p className="mt-2 text-base font-medium text-zinc-400">
              ไม่มีต้นทุนคงที่
            </p>
          ) : metrics.canBreakEven && metrics.breakEvenUnits !== null ? (
            <p className="mt-1.5 text-2xl sm:text-3xl font-mono font-bold tabular-nums text-zinc-100">
              {metrics.breakEvenUnits.toLocaleString("th-TH")}{" "}
              <span className="text-sm font-sans font-normal text-zinc-400">
                ชิ้น
              </span>
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-rose-400">
              ไม่คุ้มทุน (ขาดทุนต่อชิ้น)
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-100">
            ตารางแจกแจงโครงสร้างราคาต่อ 1 ชิ้น
          </h3>
          <span className="font-mono text-xs text-zinc-500">
            หน่วย: บาท (THB)
          </span>
        </div>

        <div className="overflow-x-auto border-t border-b border-zinc-800/90">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/90 text-xs text-zinc-400">
                <th className="py-3 font-medium">รายการ</th>
                <th className="py-3 text-right font-medium">จำนวนเงิน (บาท)</th>
                <th className="py-3 text-right font-medium w-36">
                  สัดส่วนต่อราคาขาย
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              <tr>
                <td className="py-3.5 text-zinc-200 font-medium">
                  ราคาขายที่ตั้งไว้
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-100">
                  ฿{formatCurrency(inputs.sellingPrice)}
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-400">
                  {sellingBase > 0 ? "100.0%" : "0.0%"}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-zinc-400">
                  หัก ต้นทุนสินค้าต่อชิ้น
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-300">
                  -฿{formatCurrency(inputs.costPrice)}
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-500">
                  {shareOfSelling(inputs.costPrice)}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-zinc-400">
                  หัก ค่ากล่อง ค่าแพ็ก และค่าโฆษณา
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-300">
                  -฿{formatCurrency(metrics.packAndAdsCost)}
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-500">
                  {shareOfSelling(metrics.packAndAdsCost)}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-zinc-400">
                  หัก ค่า GP แพลตฟอร์ม ({inputs.platform} {inputs.platformFeePercent}%)
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-300">
                  -฿{formatCurrency(metrics.platformFeeBaht)}
                </td>
                <td className="py-3.5 text-right font-mono tabular-nums text-zinc-500">
                  {shareOfSelling(metrics.platformFeeBaht)}
                </td>
              </tr>

              <tr className="border-t border-zinc-800 bg-black font-semibold">
                <td className="py-4 text-zinc-100">คงเหลือกำไรสุทธิต่อชิ้น</td>
                <td
                  className={`py-4 text-right font-mono text-base tabular-nums ${
                    isLoss ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                  {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                </td>
                <td
                  className={`py-4 text-right font-mono tabular-nums ${
                    isLoss ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {formatCurrency(metrics.netMarginPercent, 1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              style={{ width: `${Math.max(0, metrics.productCostShare)}%` }}
              className="h-full bg-zinc-500"
            />
            <div
              style={{ width: `${Math.max(0, metrics.packAdsShare)}%` }}
              className="h-full bg-amber-500/80"
            />
            <div
              style={{ width: `${Math.max(0, metrics.feeShare)}%` }}
              className="h-full bg-zinc-700"
            />
            <div
              style={{ width: `${Math.max(0, metrics.profitShare)}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              <span>ทุนสินค้า</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500/80" />
              <span>ค่าแพ็ก + ค่าแอด</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              <span>ค่า GP แพลตฟอร์ม</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>กำไรสุทธิ</span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-b border-zinc-800/90 py-5">
        <button
          type="button"
          onClick={() => setShowPromoSimulator((prev) => !prev)}
          className="w-full flex items-center justify-between text-left py-1"
        >
          <div>
            <span className="text-sm sm:text-base font-semibold text-zinc-100">
              ลองจำลองลดราคาจัดโปรโมชัน (0%–50%)
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">
              กดเพื่อทดลองเลื่อนดูว่าถ้าจัด Flash Sale ลดราคาลง จะยังเหลือกำไรชิ้นละเท่าไหร่
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-black px-3 py-1.5 text-xs font-mono text-emerald-400">
            <span>ลด {discountPercent}%</span>
            {showPromoSimulator ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        </button>

        {showPromoSimulator && (
          <div className="mt-5 pt-5 border-t border-zinc-900 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>เลื่อนปรับส่วนลดโปรโมชัน</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  ส่วนลด {discountPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={discountPercent}
                onChange={(e) => onChangeDiscount(Number(e.target.value))}
                aria-label="แถบเลื่อนส่วนลดโปรโมชัน 0 ถึง 50 เปอร์เซ็นต์"
                className="w-full accent-emerald-500 cursor-pointer h-2"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
              <div>
                <span className="text-xs text-zinc-400">ราคาขายหลังลด</span>
                <p className="text-xl font-mono font-bold tabular-nums text-zinc-100 mt-1">
                  ฿{formatCurrency(simulation.discountedPrice)}
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-400">
                  กำไรสุทธิต่อชิ้นหลังลด
                </span>
                <p
                  className={`text-xl font-mono font-bold tabular-nums mt-1 ${
                    simulation.discountedProfitPerUnit > 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {simulation.discountedProfitPerUnit >= 0 ? "+" : "-"}฿
                  {formatCurrency(Math.abs(simulation.discountedProfitPerUnit))}
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-400">
                  ต้องขายเพิ่มเพื่อให้ได้กำไรเท่าเดิม
                </span>
                <p className="text-xl font-mono font-bold tabular-nums text-zinc-100 mt-1">
                  {simulation.requiredUnitsForSameProfit !== null
                    ? `${simulation.requiredUnitsForSameProfit.toLocaleString("th-TH")} ชิ้น`
                    : "ขาดทุนต่อชิ้น"}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400">
              {simulation.discountedProfitPerUnit > 0 &&
              simulation.requiredUnitsForSameProfit !== null ? (
                <>
                  เมื่อลดราคา {discountPercent}% เหลือชิ้นละ{" "}
                  <strong className="font-mono text-zinc-200">
                    ฿{formatCurrency(simulation.discountedPrice)}
                  </strong>{" "}
                  คุณต้องขายให้ได้{" "}
                  <strong className="font-mono text-emerald-400">
                    {simulation.requiredUnitsForSameProfit.toLocaleString("th-TH")}{" "}
                    ชิ้น
                  </strong>{" "}
                  จึงจะได้กำไรรวมเท่ากับการขายราคาปกติ {simulation.baselineUnits} ชิ้น
                </>
              ) : (
                <span className="text-rose-400 font-medium">
                  การลดราคา {discountPercent}% ทำให้ขาดทุนหรือไม่ได้กำไรต่อชิ้น ไม่แนะนำให้จัดโปรโมชันในระดับราคานี้
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {isCloudFull && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-amber-500/45 bg-amber-950/20 px-4 py-3 text-xs sm:text-sm text-amber-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            พื้นที่คลาวด์เต็ม ({MAX_CLOUD_RECORDS}/{MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveToCloud}
            disabled={saving || isCloudFull}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.45)] transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            <span>
              {isCloudFull
                ? `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS})`
                : saving
                  ? "กำลังบันทึกลง Cloud..."
                  : "บันทึกข้อมูลนี้ลง Cloud"}
            </span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-black px-5 py-3.5 text-sm font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-white"
          >
            <Download className="h-4 w-4" />
            <span>ส่งออกไฟล์ CSV</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onEditTop}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-emerald-400"
        >
          <ArrowUp className="h-4 w-4" />
          <span>แก้ไขตัวเลขด้านบน</span>
        </button>
      </div>
    </section>
  );
}
