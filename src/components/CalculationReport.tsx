"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudUpload,
  Download,
  Image as ImageIcon,
  Loader2,
  ReceiptText,
  Tag,
} from "lucide-react";
import {
  MAX_CLOUD_RECORDS,
  formatCurrency,
  formatPlatformDisplayName,
} from "@/lib/calculator";
import { useAppLanguage } from "@/lib/language";
import type {
  CalculationMetrics,
  CalculatorInputValues,
  FinancialAnalysisResult,
  PromoSimulationResult,
} from "@/types";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

interface CalculationReportProps {
  inputs: CalculatorInputValues;
  metrics: CalculationMetrics;
  simulation: PromoSimulationResult;
  analysis: FinancialAnalysisResult;
  discountPercent: number;
  previewImageUrl: string | null;
  saving: boolean;
  isCloudFull: boolean;
  isEditing?: boolean;
  saveCooldownSeconds?: number;
  onChangeDiscount: (next: number) => void;
  onSaveToCloud: () => void;
  onExportCsv: () => void;
  onBackToCalculator: () => void;
}

const GLASS_CARD_CLASS =
  "rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)]";

const CARD_HEADER_BAND_CLASS =
  "bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4";

const GLOWING_ICON_BADGE_CLASS =
  "w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)]";

export function CalculationReport({
  inputs,
  metrics,
  simulation,
  analysis,
  discountPercent,
  previewImageUrl,
  saving,
  isCloudFull,
  isEditing = false,
  saveCooldownSeconds = 0,
  onChangeDiscount,
  onSaveToCloud,
  onExportCsv,
  onBackToCalculator,
}: CalculationReportProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const locale = isEn ? "en-US" : "th-TH";

  const [showPromoSimulator, setShowPromoSimulator] = useState(true);

  const saveBlockedByLimit = isCloudFull && !isEditing;
  const saveBlockedByCooldown = !isEditing && saveCooldownSeconds > 0;

  const productTitle =
    inputs.productName.trim() ||
    (isEn ? "Untitled Product" : "สินค้าไม่ได้ระบุชื่อ");
  const displayPlatform = formatPlatformDisplayName(inputs.platform, language);

  const isIncomplete = analysis.isIncompleteData;
  const isLoss = !isIncomplete && metrics.netProfitPerUnit < 0;
  const isThinMargin =
    !isIncomplete && !isLoss && metrics.netMarginPercent < 15;

  const statusText = isIncomplete
    ? isEn
      ? "Incomplete — Selling Price Required"
      : "ข้อมูลไม่สมบูรณ์ — ยังไม่ได้ตั้งราคาขาย"
    : isLoss
      ? isEn
        ? "Losing Money per Unit"
        : "ราคาขายนี้ขาดทุนต่อชิ้น"
      : isThinMargin
        ? isEn
          ? "Thin Margin — Risky on Promos"
          : "กำไรบาง ระวังขาดทุนตอนจัดโปร"
        : isEn
          ? "Healthy Profit — Ready to Sell"
          : "กำไรดี พร้อมลุยขาย";

  const statusColorClass = isIncomplete
    ? "text-amber-300 border-amber-500/45 bg-amber-950/30"
    : isLoss
      ? "text-rose-400 border-rose-500/50 bg-rose-950/35"
      : isThinMargin
        ? "text-amber-300 border-amber-500/50 bg-amber-950/35"
        : "text-emerald-400 border-emerald-500/50 bg-emerald-950/35";

  const sellingBase = inputs.sellingPrice > 0 ? inputs.sellingPrice : 0;
  const shareOfSelling = (amount: number): string => {
    if (sellingBase <= 0) return "0.0%";
    return `${formatCurrency((amount / sellingBase) * 100, 1)}%`;
  };

  return (
    <section id="calculation-report" className="scroll-mt-20 space-y-6 sm:space-y-8">
      <div className={GLASS_CARD_CLASS}>
        <div
          className={`${CARD_HEADER_BAND_CLASS} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {previewImageUrl ? (
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-emerald-400/35 bg-black shadow-[0_0_16px_rgba(16,185,129,0.18)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt={productTitle}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/15 to-black border border-emerald-500/25 flex flex-col items-center justify-center gap-1 select-none">
                <ImageIcon className="h-5 w-5 text-emerald-400/70" />
                <span className="text-[10px] font-medium tracking-tight text-zinc-400 leading-none">
                  {isEn ? "No Image" : "ไม่มีรูปภาพ"}
                </span>
              </div>
            )}

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  STEP 04 — FINANCIAL SUMMARY
                </span>
                <span className="text-xs text-zinc-600">|</span>
                <span className="text-xs font-medium text-purple-300">
                  {isEn ? "Channel:" : "ช่องทาง:"} {displayPlatform} (GP{" "}
                  {inputs.platformFeePercent}%)
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-white truncate">
                {productTitle}
              </h2>
            </div>
          </div>

          <div
            className={`self-start sm:self-center shrink-0 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold ${statusColorClass}`}
          >
            {statusText}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {analysis.hasZeroProductCostWarning && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-amber-500/45 bg-amber-950/25 px-4 py-3.5 text-xs sm:text-sm text-amber-200 shadow-[0_0_24px_-8px_rgba(245,158,11,0.3)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-amber-300">
                  {isEn ? "Important Notice:" : "ข้อสังเกตสำคัญ:"}
                </strong>{" "}
                {isEn
                  ? "Product cost is set to 0 THB — if this is a physical item, verify you didn't miss entering your wholesale or manufacturing cost, as profit figures will appear artificially inflated."
                  : "ตรวจพบต้นทุนสินค้าเป็น 0 บาท — หากเป็นสินค้าที่จับต้องได้ กรุณาตรวจสอบว่าไม่ได้ลืมกรอกราคาทุนรับมาหรือต้นทุนผลิต เพราะจะทำให้ตัวเลขกำไรสูงเกินจริง"}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-black/65 p-4 space-y-1">
              <span className="block text-xs text-zinc-400">
                {isEn ? "Net Profit / Unit" : "กำไรสุทธิต่อชิ้น"}
              </span>
              <p
                className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
                  isLoss ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/90 bg-black/65 p-4 space-y-1">
              <span className="block text-xs text-zinc-400">
                {isEn ? "Net Margin %" : "อัตรากำไร %"}
              </span>
              <p
                className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
                  isLoss
                    ? "text-rose-400"
                    : isThinMargin
                      ? "text-amber-300"
                      : "text-emerald-300"
                }`}
              >
                {formatCurrency(metrics.netMarginPercent, 1)}%
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/25 bg-black/65 p-4 space-y-1">
              <span className="block text-xs text-zinc-400">
                {isEn ? "Total Cost / Unit" : "ต้นทุนรวมทั้งหมดต่อชิ้น"}
              </span>
              <p className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-indigo-300">
                ฿{formatCurrency(metrics.totalCostPerUnit)}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/25 bg-black/65 p-4 space-y-1">
              <span className="block text-xs text-zinc-400">
                {isEn ? "Break-Even Volume" : "จุดคุ้มทุน (จำนวนชิ้น)"}
              </span>
              {inputs.fixedCost <= 0 ? (
                <p className="pt-1 text-base font-medium text-zinc-400">
                  {isEn ? "No Fixed Costs" : "ไม่มีต้นทุนคงที่"}
                </p>
              ) : metrics.canBreakEven && metrics.breakEvenUnits !== null ? (
                <p className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-cyan-300">
                  {metrics.breakEvenUnits.toLocaleString(locale)}{" "}
                  <span className="text-sm font-sans font-normal text-zinc-400">
                    {isEn ? "units" : "ชิ้น"}
                  </span>
                </p>
              ) : (
                <p className="pt-1 text-sm font-semibold text-rose-400">
                  {isEn
                    ? "Cannot Break Even (Loss)"
                    : "ไม่คุ้มทุน (ขาดทุนต่อชิ้น)"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={GLASS_CARD_CLASS}>
        <div
          className={`${CARD_HEADER_BAND_CLASS} flex flex-wrap items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={GLOWING_ICON_BADGE_CLASS}>
              <ReceiptText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isEn
                  ? "Per-Unit Price Structure Breakdown"
                  : "ตารางแจกแจงโครงสร้างราคาต่อ 1 ชิ้น"}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isEn
                  ? "Exact itemized deductions from retail price down to real net profit"
                  : "แจกแจงทุกรายการหักจากราคาขายหน้าร้านจนเหลือกำไรสุทธิจริง"}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-medium text-cyan-300">
            {isEn ? "Currency: THB (฿)" : "หน่วย: บาท (THB)"}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-black/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/90 text-xs text-zinc-400 bg-zinc-950/60">
                  <th className="py-3 px-4 font-medium">
                    {isEn ? "Line Item" : "รายการ"}
                  </th>
                  <th className="py-3 px-4 text-right font-medium">
                    {isEn ? "Amount (THB)" : "จำนวนเงิน (บาท)"}
                  </th>
                  <th className="py-3 px-4 text-right font-medium w-40">
                    {isEn ? "% of Selling Price" : "สัดส่วนต่อราคาขาย"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-sm">
                <tr>
                  <td className="py-3.5 px-4 text-zinc-100 font-medium">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                      <span>
                        {isEn ? "Planned Selling Price" : "ราคาขายที่ตั้งไว้"}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-cyan-300">
                    ฿{formatCurrency(inputs.sellingPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-cyan-400/80">
                    {sellingBase > 0 ? "100.0%" : "0.0%"}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                      <span>
                        {isEn
                          ? "Less: Base Product Cost"
                          : "หัก ต้นทุนสินค้าต่อชิ้น"}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-indigo-300">
                    -฿{formatCurrency(inputs.costPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-zinc-400">
                    {shareOfSelling(inputs.costPrice)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                      <span>
                        {isEn
                          ? "Less: Packaging & Ad Spend"
                          : "หัก ค่ากล่อง ค่าแพ็ก และค่าโฆษณา"}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-300">
                    -฿{formatCurrency(metrics.packAndAdsCost)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-zinc-400">
                    {shareOfSelling(metrics.packAndAdsCost)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-purple-500" />
                      <span>
                        {isEn
                          ? `Less: Platform GP (${displayPlatform} ${inputs.platformFeePercent}%)`
                          : `หัก ค่า GP แพลตฟอร์ม (${displayPlatform} ${inputs.platformFeePercent}%)`}
                      </span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-purple-300">
                    -฿{formatCurrency(metrics.platformFeeBaht)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-zinc-400">
                    {shareOfSelling(metrics.platformFeeBaht)}
                  </td>
                </tr>

                <tr className="border-t border-emerald-500/20 bg-emerald-950/20 font-semibold">
                  <td className="py-4 px-4 text-white">
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          isLoss ? "bg-rose-500" : "bg-emerald-400"
                        }`}
                      />
                      <span>
                        {isEn
                          ? "Remaining Net Profit / Unit"
                          : "คงเหลือกำไรสุทธิต่อชิ้น"}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-mono text-base tabular-nums ${
                      isLoss ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                    {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-mono tabular-nums ${
                      isLoss ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(metrics.netMarginPercent, 1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800/80">
              <div
                style={{ width: `${Math.max(0, metrics.productCostShare)}%` }}
                className="h-full bg-indigo-500 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.max(0, metrics.packAdsShare)}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.max(0, metrics.feeShare)}%` }}
                className="h-full bg-purple-500 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.max(0, metrics.profitShare)}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>{isEn ? "Product Cost" : "ทุนสินค้า"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{isEn ? "Pack + Ads" : "ค่าแพ็ก + ค่าแอด"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>{isEn ? "Platform GP" : "ค่า GP แพลตฟอร์ม"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{isEn ? "Net Profit" : "กำไรสุทธิ"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsCharts
        inputs={inputs}
        metrics={metrics}
        analysis={analysis}
        activeDiscountPercent={discountPercent}
      />

      <div className={GLASS_CARD_CLASS}>
        <button
          type="button"
          onClick={() => setShowPromoSimulator((prev) => !prev)}
          className={`w-full text-left flex items-center justify-between gap-4 ${CARD_HEADER_BAND_CLASS} ${
            showPromoSimulator ? "" : "border-b-0"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={GLOWING_ICON_BADGE_CLASS}>
              <Tag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-base sm:text-lg font-bold text-white">
                {isEn
                  ? "Promo Discount Simulator (0%–50%)"
                  : "ลองจำลองลดราคาจัดโปรโมชัน (0%–50%)"}
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isEn
                  ? "Slide to preview remaining profit per unit during Flash Sales or coupon campaigns"
                  : "กดเพื่อทดลองเลื่อนดูว่าถ้าจัด Flash Sale ลดราคาลง จะยังเหลือกำไรชิ้นละเท่าไหร่"}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-300">
            <span>
              {isEn ? `${discountPercent}% OFF` : `ลด ${discountPercent}%`}
            </span>
            {showPromoSimulator ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        </button>

        {showPromoSimulator && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {isEn
                    ? "Drag to adjust promo discount"
                    : "เลื่อนปรับส่วนลดโปรโมชัน"}
                </span>
                <span className="font-mono text-sm font-semibold text-cyan-300">
                  {isEn
                    ? `Discount ${discountPercent}%`
                    : `ส่วนลด ${discountPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={discountPercent}
                onChange={(e) => onChangeDiscount(Number(e.target.value))}
                aria-label={
                  isEn
                    ? "Promo discount slider from 0 to 50 percent"
                    : "แถบเลื่อนส่วนลดโปรโมชัน 0 ถึง 50 เปอร์เซ็นต์"
                }
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/80 pt-4">
              <div className="rounded-xl border border-cyan-500/20 bg-black/60 p-4">
                <span className="text-xs text-zinc-400">
                  {isEn ? "Discounted Price" : "ราคาขายหลังลด"}
                </span>
                <p className="text-xl font-mono font-bold tabular-nums text-cyan-300 mt-1">
                  ฿{formatCurrency(simulation.discountedPrice)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-black/60 p-4">
                <span className="text-xs text-zinc-400">
                  {isEn
                    ? "Net Profit / Unit After Discount"
                    : "กำไรสุทธิต่อชิ้นหลังลด"}
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
              <div className="rounded-xl border border-purple-500/20 bg-black/60 p-4">
                <span className="text-xs text-zinc-400">
                  {isEn
                    ? "Units Needed for Same Profit"
                    : "ต้องขายเพิ่มเพื่อให้ได้กำไรเท่าเดิม"}
                </span>
                <p className="text-xl font-mono font-bold tabular-nums text-purple-300 mt-1">
                  {simulation.requiredUnitsForSameProfit !== null
                    ? `${simulation.requiredUnitsForSameProfit.toLocaleString(locale)} ${isEn ? "units" : "ชิ้น"}`
                    : isEn
                      ? "Loss / Unit"
                      : "ขาดทุนต่อชิ้น"}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400">
              {simulation.discountedProfitPerUnit > 0 &&
              simulation.requiredUnitsForSameProfit !== null ? (
                isEn ? (
                  <>
                    With a {discountPercent}% discount (price{" "}
                    <strong className="font-mono text-cyan-300">
                      ฿{formatCurrency(simulation.discountedPrice)}
                    </strong>
                    ), you need to sell{" "}
                    <strong className="font-mono text-emerald-400">
                      {simulation.requiredUnitsForSameProfit.toLocaleString(
                        locale
                      )}{" "}
                      units
                    </strong>{" "}
                    to match the total profit of selling{" "}
                    {simulation.baselineUnits} units at regular price.
                  </>
                ) : (
                  <>
                    เมื่อลดราคา {discountPercent}% เหลือชิ้นละ{" "}
                    <strong className="font-mono text-cyan-300">
                      ฿{formatCurrency(simulation.discountedPrice)}
                    </strong>{" "}
                    คุณต้องขายให้ได้{" "}
                    <strong className="font-mono text-emerald-400">
                      {simulation.requiredUnitsForSameProfit.toLocaleString(
                        locale
                      )}{" "}
                      ชิ้น
                    </strong>{" "}
                    จึงจะได้กำไรรวมเท่ากับการขายราคาปกติ{" "}
                    {simulation.baselineUnits} ชิ้น
                  </>
                )
              ) : (
                <span className="text-rose-400 font-medium">
                  {isEn
                    ? `A ${discountPercent}% discount results in zero profit or a net loss per unit. Running a campaign at this price is not recommended.`
                    : `การลดราคา ${discountPercent}% ทำให้ขาดทุนหรือไม่ได้กำไรต่อชิ้น ไม่แนะนำให้จัดโปรโมชันในระดับราคานี้`}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {saveBlockedByLimit && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-2xl border border-amber-500/45 bg-amber-950/25 backdrop-blur-md px-4 py-3 text-xs sm:text-sm text-amber-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            {isEn
              ? `Cloud storage is full (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} items). Delete older records before saving more.`
              : `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม`}
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToCalculator}
          className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-xl border border-zinc-800/90 bg-[#060807]/85 backdrop-blur-md px-4 py-3 text-xs sm:text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isEn ? "Back" : "ย้อนกลับ"}</span>
        </button>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-[#060807]/85 backdrop-blur-md px-5 py-3 text-sm font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400 hover:text-white"
          >
            <Download className="h-4 w-4" />
            <span>{isEn ? "Export CSV" : "ส่งออกไฟล์ CSV"}</span>
          </button>

          <button
            type="button"
            onClick={onSaveToCloud}
            disabled={saving || saveBlockedByLimit || saveBlockedByCooldown}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
              saveBlockedByCooldown
                ? "border border-zinc-800 bg-zinc-900 text-zinc-400"
                : "bg-emerald-500 text-black shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-50"
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveBlockedByCooldown ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CloudUpload className="h-4 w-4" />
            )}
            <span>
              {saveBlockedByLimit
                ? isEn
                  ? `Cloud Full (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS})`
                  : `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS})`
                : saveBlockedByCooldown
                  ? isEn
                    ? `Please wait (${saveCooldownSeconds}s)`
                    : `รอสักครู่ (${saveCooldownSeconds} วินาที)`
                  : saving
                    ? isEditing
                      ? isEn
                        ? "Saving changes..."
                        : "กำลังบันทึกการแก้ไข..."
                      : isEn
                        ? "Saving to Cloud..."
                        : "กำลังบันทึกลง Cloud..."
                    : isEditing
                      ? isEn
                        ? "Save Changes to Cloud"
                        : "บันทึกการแก้ไขลง Cloud"
                      : isEn
                        ? "Save to Cloud"
                        : "บันทึกข้อมูลนี้ลง Cloud"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
