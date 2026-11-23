"use client";

import {
  AlertCircle,
  CheckCircle2,
  Megaphone,
  Percent,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/calculator";
import type {
  CalculationMetrics,
  CalculatorInputValues,
  FinancialAnalysisResult,
} from "@/types";

interface AnalyticsChartsProps {
  inputs: CalculatorInputValues;
  metrics: CalculationMetrics;
  analysis: FinancialAnalysisResult;
  activeDiscountPercent: number;
}

function formatCompactBaht(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe >= 0 ? "+" : "-";
  const abs = Math.abs(safe);
  if (abs >= 1_000_000) {
    return `${sign}฿${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}฿${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}฿${Math.round(abs).toLocaleString("th-TH")}`;
}

export function AnalyticsCharts({
  inputs,
  metrics,
  analysis,
  activeDiscountPercent,
}: AnalyticsChartsProps) {
  const isLoss = metrics.netProfitPerUnit < 0;

  const donutRadius = 72;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSegments = [
    {
      label: "ต้นทุนสินค้า",
      amount: inputs.costPrice,
      share: Math.max(0, metrics.productCostShare),
      color: "#71717a",
    },
    {
      label: "ค่าแพ็ก + ค่าแอด",
      amount: metrics.packAndAdsCost,
      share: Math.max(0, metrics.packAdsShare),
      color: "#f59e0b",
    },
    {
      label: `ค่า GP (${inputs.platformFeePercent}%)`,
      amount: metrics.platformFeeBaht,
      share: Math.max(0, metrics.feeShare),
      color: "#38bdf8",
    },
    {
      label: "กำไรสุทธิ",
      amount: Math.max(0, metrics.netProfitPerUnit),
      share: Math.max(0, metrics.profitShare),
      color: "#10b981",
    },
  ];

  const totalShare = donutSegments.reduce((sum, seg) => sum + seg.share, 0);
  const safeShareScale = totalShare > 0 ? 100 / totalShare : 0;

  const donutRenderedSegments = donutSegments.reduce<
    {
      label: string;
      amount: number;
      share: number;
      color: string;
      length: number;
      offset: number;
    }[]
  >((acc, seg) => {
    const prevUsed = acc.reduce((sum, item) => sum + item.length, 0);
    const normalizedPercent = seg.share * safeShareScale;
    const length = (normalizedPercent / 100) * donutCircumference;
    acc.push({
      ...seg,
      length,
      offset: -prevUsed,
    });
    return acc;
  }, []);

  const discountProfits = analysis.discountCurve.map((p) => p.profitPerUnit);
  const discountMax = Math.max(...discountProfits, 10);
  const discountMin = Math.min(...discountProfits, 0);
  const discountRange = Math.max(discountMax - discountMin, 1);

  const chartTopPad = 28;
  const chartBottomPad = 34;
  const chartPlotHeight = 148;
  const discountZeroY =
    chartTopPad + (discountMax / discountRange) * chartPlotHeight;

  const volumeProfits = analysis.volumeProjections.map((p) => p.netTotalProfit);
  const volumeMax = Math.max(...volumeProfits, 10);
  const volumeMin = Math.min(...volumeProfits, 0);
  const volumeRange = Math.max(volumeMax - volumeMin, 1);
  const volumeZeroY =
    chartTopPad + (volumeMax / volumeRange) * chartPlotHeight;

  const advisorBadge =
    analysis.healthLevel === "loss"
      ? {
          text: "ต้องปรับโครงสร้างราคาด่วน",
          className: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        }
      : analysis.healthLevel === "thin"
        ? {
            text: "กำไรบาง ควรเพิ่มกันชน",
            className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
          }
        : analysis.healthLevel === "good"
          ? {
              text: "สุขภาพกำไรอยู่ในเกณฑ์ดี",
              className: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
            }
          : {
              text: "สุขภาพกำไรแข็งแกร่งมาก",
              className: "border-emerald-400/50 bg-emerald-500/15 text-emerald-300",
            };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-[#070707] border border-emerald-500/20 p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
              CHART 01 — COST STRUCTURE
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              สัดส่วนโครงสร้างราคาต่อชิ้น
            </h3>
            <p className="text-xs text-zinc-400">
              เปรียบเทียบสัดส่วนต้นทุน ค่าธรรมเนียม และกำไรสุทธิในราคาขาย
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-6">
            <div className="relative h-48 w-48 shrink-0">
              <svg
                viewBox="0 0 200 200"
                className="h-full w-full"
                role="img"
                aria-label="กราฟวงแหวนสัดส่วนโครงสร้างราคา"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={donutRadius}
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="20"
                />

                {totalShare > 0 &&
                  donutRenderedSegments.map((seg) =>
                    seg.length > 0.5 ? (
                      <circle
                        key={seg.label}
                        cx="100"
                        cy="100"
                        r={donutRadius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={`${seg.length} ${donutCircumference}`}
                        strokeDashoffset={seg.offset}
                        transform="rotate(-90 100 100)"
                      />
                    ) : null
                  )}

                {isLoss && (
                  <circle
                    cx="100"
                    cy="100"
                    r={87}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    strokeOpacity="0.7"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-[11px] text-zinc-400">กำไรสุทธิ/ชิ้น</span>
                <span
                  className={`mt-0.5 font-mono text-lg sm:text-xl font-bold tabular-nums ${
                    isLoss ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                  {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                </span>
                <span className="mt-0.5 font-mono text-[11px] text-zinc-500">
                  Margin {formatCurrency(metrics.netMarginPercent, 1)}%
                </span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {donutSegments.map((seg) => {
                const displayShare =
                  inputs.sellingPrice > 0
                    ? (seg.amount / inputs.sellingPrice) * 100
                    : seg.share;

                return (
                  <div
                    key={seg.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-zinc-300 truncate">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                      <span className="text-zinc-100 font-medium">
                        ฿{formatCurrency(seg.amount)}
                      </span>
                      <span className="w-11 text-right text-zinc-500">
                        {formatCurrency(displayShare, 1)}%
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoss && (
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400">ส่วนต่างที่ขาดทุน</span>
                  <span className="font-bold text-rose-400">
                    -฿{formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-[#070707] border border-emerald-500/20 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                CHART 02 — DISCOUNT SENSITIVITY (0%–50%)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                ผลกระทบต่อกำไรเมื่อจัดโปรโมชันลดราคา
              </h3>
              <p className="text-xs text-zinc-400">
                สีเขียว = ยังเหลือกำไรต่อชิ้น · สีแดง = เริ่มขาดทุนเข้าเนื้อ
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-300">
              ลดปลอดภัยสูงสุด {formatCurrency(analysis.maxSafeDiscountPercent, 1)}%
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 560 218"
              className="w-full min-w-[420px] h-auto"
              role="img"
              aria-label="กราฟแท่งวิเคราะห์ผลกระทบเมื่อจัดโปรโมชันลดราคา 0 ถึง 50 เปอร์เซ็นต์"
            >
              <line
                x1="18"
                y1={chartTopPad}
                x2="542"
                y2={chartTopPad}
                stroke="#18181b"
                strokeWidth="1"
              />
              <line
                x1="18"
                y1={chartTopPad + chartPlotHeight}
                x2="542"
                y2={chartTopPad + chartPlotHeight}
                stroke="#18181b"
                strokeWidth="1"
              />
              <line
                x1="18"
                y1={discountZeroY}
                x2="542"
                y2={discountZeroY}
                stroke="#52525b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x="14"
                y={Math.max(14, discountZeroY - 4)}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
              >
                ฿0
              </text>

              {analysis.discountCurve.map((point, idx) => {
                const slotWidth = 508 / analysis.discountCurve.length;
                const barWidth = 34;
                const x = 32 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const rawHeight =
                  (Math.abs(point.profitPerUnit) / discountRange) *
                  chartPlotHeight;
                const barHeight = Math.max(rawHeight, 3);
                const y = point.isProfitable
                  ? discountZeroY - barHeight
                  : discountZeroY;
                const isSelectedSlider =
                  point.discountPercent === activeDiscountPercent;
                const fillColor = point.isProfitable ? "#10b981" : "#f43f5e";

                return (
                  <g key={point.discountPercent}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill={fillColor}
                      fillOpacity={isSelectedSlider ? 0.95 : 0.78}
                      stroke={isSelectedSlider ? "#ecfdf5" : "none"}
                      strokeWidth={isSelectedSlider ? 1.5 : 0}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={
                        point.isProfitable
                          ? Math.max(14, y - 6)
                          : Math.min(200, y + barHeight + 13)
                      }
                      textAnchor="middle"
                      fill={point.isProfitable ? "#6ee7b7" : "#fda4af"}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {formatCompactBaht(point.profitPerUnit)}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={chartTopPad + chartPlotHeight + chartBottomPad - 8}
                      textAnchor="middle"
                      fill={isSelectedSlider ? "#34d399" : "#a1a1aa"}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isSelectedSlider ? "700" : "500"}
                    >
                      -{point.discountPercent}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#070707] border border-emerald-500/20 p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
              CHART 03 — VOLUME & BREAK-EVEN PROJECTION
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              คาดการณ์กำไรสุทธิสะสมตามจำนวนยอดขาย (หักต้นทุนคงที่แล้ว)
            </h3>
            <p className="text-xs text-zinc-400">
              {inputs.fixedCost > 0
                ? `คำนวณหลังหักต้นทุนคงที่ต่อเดือน ฿${formatCurrency(inputs.fixedCost, 0)} เพื่อเห็นภาพจุดคุ้มทุนและศักยภาพการขยายยอด`
                : "ไม่มีต้นทุนคงที่ต่อเดือน แสดงกำไรสุทธิรวมตามระดับยอดขาย 10 / 50 / 100 / 500 ชิ้น"}
            </p>
          </div>
          {inputs.fixedCost > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>
                {metrics.canBreakEven && metrics.breakEvenUnits !== null
                  ? `จุดคุ้มทุน ${metrics.breakEvenUnits.toLocaleString("th-TH")} ชิ้น`
                  : "ยังไม่คุ้มทุน"}
              </span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 w-full overflow-x-auto">
            <svg
              viewBox="0 0 520 218"
              className="w-full min-w-[360px] h-auto"
              role="img"
              aria-label="กราฟคาดการณ์กำไรสุทธิสะสมที่ยอดขาย 10, 50, 100 และ 500 ชิ้น"
            >
              <line
                x1="18"
                y1={chartTopPad}
                x2="502"
                y2={chartTopPad}
                stroke="#18181b"
                strokeWidth="1"
              />
              <line
                x1="18"
                y1={chartTopPad + chartPlotHeight}
                x2="502"
                y2={chartTopPad + chartPlotHeight}
                stroke="#18181b"
                strokeWidth="1"
              />
              <line
                x1="18"
                y1={volumeZeroY}
                x2="502"
                y2={volumeZeroY}
                stroke="#52525b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x="14"
                y={Math.max(14, volumeZeroY - 4)}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
              >
                ฿0
              </text>

              {analysis.volumeProjections.map((point, idx) => {
                const slotWidth = 468 / analysis.volumeProjections.length;
                const barWidth = 58;
                const x = 32 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const rawHeight =
                  (Math.abs(point.netTotalProfit) / volumeRange) *
                  chartPlotHeight;
                const barHeight = Math.max(rawHeight, 4);
                const y = point.isProfitable
                  ? volumeZeroY - barHeight
                  : volumeZeroY;

                return (
                  <g key={point.units}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="8"
                      fill={point.isProfitable ? "#10b981" : "#f43f5e"}
                      fillOpacity="0.82"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={
                        point.isProfitable
                          ? Math.max(14, y - 7)
                          : Math.min(200, y + barHeight + 14)
                      }
                      textAnchor="middle"
                      fill={point.isProfitable ? "#6ee7b7" : "#fda4af"}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {formatCompactBaht(point.netTotalProfit)}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={chartTopPad + chartPlotHeight + chartBottomPad - 8}
                      textAnchor="middle"
                      fill="#d4d4d8"
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {point.units} ชิ้น
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {analysis.volumeProjections.map((point) => (
              <div
                key={point.units}
                className={`rounded-xl border p-3.5 space-y-1 ${
                  point.isProfitable
                    ? "border-emerald-500/25 bg-black/70"
                    : "border-rose-500/25 bg-rose-950/15"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-zinc-200">
                    {point.units.toLocaleString("th-TH")} ชิ้น
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    ยอดขาย ฿{formatCurrency(point.revenue, 0)}
                  </span>
                </div>
                <p
                  className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
                    point.isProfitable ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {point.netTotalProfit >= 0 ? "+" : "-"}฿
                  {formatCurrency(Math.abs(point.netTotalProfit), 0)}
                </p>
                <span className="block text-[11px] text-zinc-500">
                  {point.isProfitable ? "กำไรสุทธิสะสม" : "ยังไม่พ้นต้นทุนคงที่"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#070707] border border-emerald-500/25 p-5 sm:p-7 space-y-6 shadow-[0_0_26px_-10px_rgba(16,185,129,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/12 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                SMART PRICING ADVISOR
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                ระบบวิเคราะห์และคำแนะนำการตั้งราคาอัจฉริยะ
              </h3>
            </div>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${advisorBadge.className}`}
          >
            {advisorBadge.text}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-xs sm:text-sm font-semibold text-zinc-200">
            ราคาขายแนะนำ 3 ระดับ (คำนวณทบกลับค่า GP {inputs.platformFeePercent}% เรียบร้อยแล้ว)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {analysis.targetPrices.map((tier) => (
              <div
                key={tier.targetMarginPercent}
                className={`rounded-xl border p-4 space-y-2 ${
                  tier.recommended
                    ? "border-emerald-400/50 bg-emerald-500/[0.08] shadow-[0_0_20px_-8px_rgba(16,185,129,0.3)]"
                    : "border-zinc-800/90 bg-black/75"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">
                    {tier.tierLabel}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${
                      tier.recommended
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    Margin {tier.targetMarginPercent}%
                  </span>
                </div>

                {tier.feasible &&
                tier.suggestedPrice !== null &&
                tier.estimatedProfitPerUnit !== null ? (
                  <>
                    <p
                      className={`font-mono text-2xl font-bold tabular-nums ${
                        tier.recommended ? "text-emerald-400" : "text-zinc-100"
                      }`}
                    >
                      ฿{formatCurrency(tier.suggestedPrice)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      เหลือกำไรสุทธิ{" "}
                      <span className="font-mono font-semibold text-emerald-400">
                        +฿{formatCurrency(tier.estimatedProfitPerUnit)}/ชิ้น
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-rose-400 pt-1">
                    ไม่สามารถตั้งราคาเป้าหมายนี้ได้ เนื่องจากค่า GP แพลตฟอร์มสูงเกินเกณฑ์
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-zinc-800/90 bg-black/75 p-4 flex items-start gap-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400">
              <Megaphone className="h-4 w-4" />
            </span>
            <div className="space-y-1 min-w-0">
              <span className="block text-xs text-zinc-400">
                เพดานงบยิงแอดสูงสุดต่อออเดอร์ (Max Safe CPA)
              </span>
              <p className="font-mono text-xl font-bold tabular-nums text-white">
                ฿{formatCurrency(analysis.maxSafeTotalAds)}
                <span className="text-xs font-sans font-normal text-zinc-400">
                  {" "}
                  / ออเดอร์
                </span>
              </p>
              <p className="text-xs text-zinc-500">
                {analysis.maxSafeAdditionalAds > 0
                  ? `สามารถเพิ่มงบแอดจากปัจจุบันได้อีกสูงสุด +฿${formatCurrency(analysis.maxSafeAdditionalAds)}/ชิ้น ก่อนเริ่มขาดทุน`
                  : "ไม่สามารถเพิ่มงบแอดเพิ่มจากนี้ได้แล้ว (เกินจุดคุ้มทุนต่อชิ้น)"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/90 bg-black/75 p-4 flex items-start gap-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-400">
              <Percent className="h-4 w-4" />
            </span>
            <div className="space-y-1 min-w-0">
              <span className="block text-xs text-zinc-400">
                เพดานส่วนลดสูงสุดช่วงแคมเปญ (Max Safe Discount)
              </span>
              <p className="font-mono text-xl font-bold tabular-nums text-white">
                {formatCurrency(analysis.maxSafeDiscountPercent, 1)}%
              </p>
              <p className="text-xs text-zinc-500">
                {analysis.maxSafeDiscountPercent > 0
                  ? `ลดราคาได้สูงสุดไม่เกิน ${formatCurrency(analysis.maxSafeDiscountPercent, 1)}% ก่อนกำไรจะกลายเป็น ฿0`
                  : "ราคาปัจจุบันไม่รองรับการจัดส่วนลดเพิ่มเติม"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm font-semibold text-zinc-200">
            ข้อสังเกตและคำแนะนำเฉพาะสำหรับรายการนี้
          </p>
          <div className="space-y-2.5">
            {analysis.insights.map((insight) => (
              <div
                key={insight.title}
                className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                  insight.severity === "danger"
                    ? "border-rose-500/30 bg-rose-950/15"
                    : insight.severity === "warning"
                      ? "border-amber-500/25 bg-amber-950/10"
                      : "border-emerald-500/25 bg-emerald-950/10"
                }`}
              >
                {insight.severity === "healthy" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      insight.severity === "danger"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  />
                )}
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                    {insight.title}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {insight.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
