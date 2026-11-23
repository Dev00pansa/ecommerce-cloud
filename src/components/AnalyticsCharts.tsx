"use client";

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Megaphone,
  PackageX,
  Percent,
  PieChart,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { formatCurrency } from "@/lib/calculator";
import { useAppLanguage } from "@/lib/language";
import { useTheme } from "@/context/ThemeContext";
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

const GLASS_CARD_CLASS =
  "rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-slate-200 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]";

const CARD_HEADER_BAND_CLASS =
  "bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80";

const GLOWING_ICON_BADGE_CLASS =
  "w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none";

function formatCompactSignedBaht(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe >= 0 ? "+" : "-";
  const abs = Math.abs(safe);
  if (abs >= 1_000_000) {
    return `${sign}฿${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}฿${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}฿${Math.round(abs).toLocaleString(locale)}`;
}

function formatCompactBaht(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (safe >= 1_000_000) {
    return `฿${(safe / 1_000_000).toFixed(1)}M`;
  }
  if (safe >= 10_000) {
    return `฿${(safe / 1_000).toFixed(1)}k`;
  }
  return `฿${Math.round(safe).toLocaleString(locale)}`;
}

export function AnalyticsCharts({
  inputs,
  metrics,
  analysis,
  activeDiscountPercent,
}: AnalyticsChartsProps) {
  const [language] = useAppLanguage();
  const { isLight } = useTheme();
  const isEn = language === "en";
  const locale = isEn ? "en-US" : "th-TH";

  const isIncomplete = analysis.isIncompleteData;
  const isLoss = !isIncomplete && metrics.netProfitPerUnit < 0;

  const svgTrackColor = isLight ? "#e2e8f0" : "#18181b";
  const svgDonutTrackColor = isLight ? "#e2e8f0" : "#111614";
  const svgGridStroke = isLight ? "#e2e8f0" : "#18181b";
  const svgZeroStroke = isLight ? "#94a3b8" : "#52525b";
  const svgZeroLabelFill = isLight ? "#475569" : "#71717a";
  const svgProfitLabelFill = isLight ? "#047857" : "#6ee7b7";
  const svgCyanLabelFill = isLight ? "#0e7490" : "#67e8f9";
  const svgLossLabelFill = isLight ? "#be123c" : "#fda4af";
  const svgAxisMutedFill = isLight ? "#475569" : "#a1a1aa";
  const svgAxisStrongFill = isLight ? "#0f172a" : "#d4d4d8";
  const svgSelectedStroke = isLight ? "#0f172a" : "#a5f3fc";
  const svgSelectedAxisFill = isLight ? "#0e7490" : "#67e8f9";

  const scoreRadius = 56;
  const scoreCircumference = 2 * Math.PI * scoreRadius;
  const scoreStrokeLength = (analysis.healthScore / 100) * scoreCircumference;

  const gradeStyle =
    analysis.healthGrade === "S" || analysis.healthGrade === "A"
      ? {
          ring: isLight ? "#059669" : "#10b981",
          text: "text-emerald-400 light:text-emerald-700",
          badge:
            "border-emerald-500/40 bg-emerald-500/12 text-emerald-300 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-800",
        }
      : analysis.healthGrade === "B"
        ? {
            ring: isLight ? "#0891b2" : "#06b6d4",
            text: "text-cyan-400 light:text-cyan-700",
            badge:
              "border-cyan-500/40 bg-cyan-500/12 text-cyan-300 light:border-cyan-300 light:bg-cyan-50 light:text-cyan-800",
          }
        : analysis.healthGrade === "C" || analysis.healthGrade === "N/A"
          ? {
              ring: isLight ? "#d97706" : "#f59e0b",
              text: "text-amber-400 light:text-amber-700",
              badge:
                "border-amber-500/40 bg-amber-500/12 text-amber-300 light:border-amber-300 light:bg-amber-50 light:text-amber-800",
            }
          : {
              ring: isLight ? "#e11d48" : "#f43f5e",
              text: "text-rose-400 light:text-rose-600",
              badge:
                "border-rose-500/40 bg-rose-500/12 text-rose-300 light:border-rose-300 light:bg-rose-50 light:text-rose-700",
            };

  const donutRadius = 72;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSegments = [
    {
      key: "cost",
      label: isEn ? "Product Cost" : "ต้นทุนสินค้า",
      amount: inputs.costPrice,
      share: Math.max(0, metrics.productCostShare),
      color: "#6366f1",
    },
    {
      key: "pack_ads",
      label: isEn ? "Pack + Ads" : "ค่าแพ็ก + ค่าแอด",
      amount: metrics.packAndAdsCost,
      share: Math.max(0, metrics.packAdsShare),
      color: "#f59e0b",
    },
    {
      key: "fee",
      label: isEn
        ? `Platform GP (${inputs.platformFeePercent}%)`
        : `ค่า GP (${inputs.platformFeePercent}%)`,
      amount: metrics.platformFeeBaht,
      share: Math.max(0, metrics.feeShare),
      color: "#a855f7",
    },
    {
      key: "profit",
      label: isEn ? "Net Profit" : "กำไรสุทธิ",
      amount: Math.max(0, metrics.netProfitPerUnit),
      share: Math.max(0, metrics.profitShare),
      color: "#10b981",
    },
  ];

  const totalShare = donutSegments.reduce((sum, seg) => sum + seg.share, 0);
  const safeShareScale = totalShare > 0 ? 100 / totalShare : 0;

  const donutRenderedSegments = donutSegments.reduce<
    {
      key: string;
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

  const visibleSegmentCount = donutRenderedSegments.filter(
    (s) => s.length > 0.5
  ).length;

  const discountProfits = analysis.discountCurve.map((p) => p.profitPerUnit);
  const discountMax = Math.max(...discountProfits, 10);
  const discountMin = Math.min(...discountProfits, 0);
  const discountRange = Math.max(discountMax - discountMin, 1);

  const chartTopPad = 30;
  const chartBottomPad = 38;
  const chartPlotHeight = 148;
  const discountZeroY =
    chartTopPad + (discountMax / discountRange) * chartPlotHeight;

  const volumeAllValues = analysis.volumeProjections.flatMap((p) => [
    p.revenue,
    p.netTotalProfit,
  ]);
  const volumeMax = Math.max(...volumeAllValues, 10);
  const volumeMin = Math.min(
    ...analysis.volumeProjections.map((p) => p.netTotalProfit),
    0
  );
  const volumeRange = Math.max(volumeMax - volumeMin, 1);
  const volumeZeroY =
    chartTopPad + (volumeMax / volumeRange) * chartPlotHeight;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={GLASS_CARD_CLASS}>
        <div
          className={`${CARD_HEADER_BAND_CLASS} flex flex-wrap items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={GLOWING_ICON_BADGE_CLASS}>
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                FINANCIAL DIAGNOSTIC ENGINE — HEALTH SCORE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                {isEn
                  ? `Profit Structure Health Score (${analysis.healthScore} / 100)`
                  : `คะแนนสุขภาพโครงสร้างกำไร (${analysis.healthScore} / 100)`}
              </h3>
            </div>
          </div>

          <span
            className={`rounded-full border px-3.5 py-1 text-xs font-semibold ${gradeStyle.badge}`}
          >
            {analysis.healthGradeLabel}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/90 bg-black/65 p-5 light:border-slate-200 light:bg-slate-50/80">
              <div className="relative h-36 w-36">
                <svg
                  viewBox="0 0 140 140"
                  className="h-full w-full"
                  role="img"
                  aria-label={
                    isEn
                      ? `Profit health score ${analysis.healthScore} out of 100`
                      : `คะแนนสุขภาพโครงสร้างกำไร ${analysis.healthScore} จาก 100`
                  }
                >
                  <circle
                    cx="70"
                    cy="70"
                    r={scoreRadius}
                    fill="none"
                    stroke={svgTrackColor}
                    strokeWidth="12"
                  />
                  {analysis.healthScore > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={scoreRadius}
                      fill="none"
                      stroke={gradeStyle.ring}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${scoreStrokeLength} ${scoreCircumference}`}
                      transform="rotate(-90 70 70)"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`font-mono text-3xl font-bold tabular-nums leading-none ${gradeStyle.text}`}
                  >
                    {analysis.healthScore}
                  </span>
                  <span className="mt-1 font-mono text-[11px] text-zinc-500 light:text-slate-500">
                    {isEn ? "/ 100 pts" : "/ 100 คะแนน"}
                  </span>
                  {analysis.healthGrade !== "N/A" && (
                    <span
                      className={`mt-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${gradeStyle.badge}`}
                    >
                      GRADE {analysis.healthGrade}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {analysis.healthBreakdown.map((factor) => {
                const pct =
                  factor.maxScore > 0
                    ? Math.min(100, (factor.score / factor.maxScore) * 100)
                    : 0;
                return (
                  <div
                    key={factor.key}
                    className="rounded-xl border border-zinc-800/90 bg-black/65 p-4 space-y-2 light:border-slate-200 light:bg-slate-50/80"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-zinc-200 light:text-slate-800 truncate">
                        {factor.label}
                      </span>
                      <span className="shrink-0 font-mono font-bold tabular-nums text-zinc-100 light:text-slate-900">
                        {factor.score}/{factor.maxScore}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900 light:bg-slate-200">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 75
                            ? "bg-emerald-400 light:bg-emerald-600"
                            : pct >= 45
                              ? "bg-amber-400 light:bg-amber-500"
                              : "bg-rose-500 light:bg-rose-600"
                        }`}
                      />
                    </div>
                    <span className="block font-mono text-[11px] text-zinc-400 light:text-slate-600">
                      {factor.summary}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div
          className={`lg:col-span-5 min-w-0 flex flex-col ${GLASS_CARD_CLASS}`}
        >
          <div
            className={`${CARD_HEADER_BAND_CLASS} flex items-center gap-3.5`}
          >
            <div className={GLOWING_ICON_BADGE_CLASS}>
              <PieChart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                CHART 01 — COST STRUCTURE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900 truncate">
                {isEn
                  ? "Unit Price Structure Share"
                  : "สัดส่วนโครงสร้างราคาต่อชิ้น"}
              </h3>
              <p className="text-xs text-zinc-400 light:text-slate-600 truncate">
                {isEn
                  ? "Cost, packing & ads, GP fees, and net profit"
                  : "เปรียบเทียบสัดส่วนต้นทุน ค่าธรรมเนียม และกำไรสุทธิ"}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 flex-1 flex items-center min-w-0">
            <div className="w-full flex flex-col sm:flex-row lg:flex-col 2xl:flex-row items-center gap-5 min-w-0">
              <div className="relative h-44 w-44 shrink-0">
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full"
                  role="img"
                  aria-label={
                    isEn
                      ? "Cost structure donut chart"
                      : "กราฟวงแหวนสัดส่วนโครงสร้างราคา"
                  }
                >
                  <circle
                    cx="100"
                    cy="100"
                    r={donutRadius}
                    fill="none"
                    stroke={svgDonutTrackColor}
                    strokeWidth="22"
                  />

                  {totalShare > 0 &&
                    donutRenderedSegments.map((seg) => {
                      if (seg.length <= 0.5) return null;
                      const gap =
                        visibleSegmentCount > 1 && seg.length > 5 ? 3 : 0;
                      return (
                        <circle
                          key={seg.key}
                          cx="100"
                          cy="100"
                          r={donutRadius}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="20"
                          strokeDasharray={`${Math.max(1, seg.length - gap)} ${donutCircumference}`}
                          strokeDashoffset={seg.offset}
                          transform="rotate(-90 100 100)"
                        />
                      );
                    })}

                  {isLoss && (
                    <circle
                      cx="100"
                      cy="100"
                      r={87}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                      strokeOpacity="0.75"
                    />
                  )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[11px] text-zinc-400 light:text-slate-600">
                    {isEn ? "Net Profit/Unit" : "กำไรสุทธิ/ชิ้น"}
                  </span>
                  <span
                    className={`mt-0.5 font-mono text-base sm:text-lg font-bold tabular-nums ${
                      isIncomplete
                        ? "text-zinc-400 light:text-slate-500"
                        : isLoss
                          ? "text-rose-400 light:text-rose-600"
                          : "text-emerald-400 light:text-emerald-700"
                    }`}
                  >
                    {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                    {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-zinc-500 light:text-slate-500">
                    Margin {formatCurrency(metrics.netMarginPercent, 1)}%
                  </span>
                </div>
              </div>

              <div className="w-full min-w-0 flex-1 space-y-2.5">
                {donutSegments.map((seg) => {
                  const displayShare =
                    inputs.sellingPrice > 0
                      ? (seg.amount / inputs.sellingPrice) * 100
                      : seg.share;

                  return (
                    <div
                      key={seg.key}
                      className="flex items-center justify-between gap-2 text-xs min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-zinc-300 light:text-slate-700 truncate">
                          {seg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                        <span className="text-zinc-100 light:text-slate-900 font-medium">
                          ฿{formatCurrency(seg.amount)}
                        </span>
                        <span className="min-w-[44px] text-right text-zinc-500 light:text-slate-500">
                          {formatCurrency(displayShare, 1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isLoss && (
                  <div className="pt-2 border-t border-zinc-800/80 light:border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-400 light:text-rose-600">
                      {isEn ? "Net Deficit" : "ส่วนต่างที่ขาดทุน"}
                    </span>
                    <span className="font-bold text-rose-400 light:text-rose-600">
                      -฿{formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`lg:col-span-7 min-w-0 flex flex-col ${GLASS_CARD_CLASS}`}
        >
          <div
            className={`${CARD_HEADER_BAND_CLASS} flex flex-wrap items-center justify-between gap-3`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={GLOWING_ICON_BADGE_CLASS}>
                <Percent className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                  CHART 02 — DISCOUNT SENSITIVITY (0%–50%)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                  {isEn
                    ? "Promo Discount Profit Impact"
                    : "ผลกระทบต่อกำไรเมื่อจัดโปรโมชันลดราคา"}
                </h3>
                <p className="text-xs text-zinc-400 light:text-slate-600">
                  {isEn
                    ? "Emerald-Cyan = Profitable · Rose-Orange = Selling at a loss"
                    : "เขียว-ฟ้า = ยังเหลือกำไรต่อชิ้น · แดง-ส้ม = เริ่มขาดทุนเข้าเนื้อ"}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-cyan-300 light:border-cyan-200 light:bg-cyan-50 light:text-cyan-800">
              {isEn
                ? `Max Safe Discount ${formatCurrency(analysis.maxSafeDiscountPercent, 1)}%`
                : `ลดปลอดภัยสูงสุด ${formatCurrency(analysis.maxSafeDiscountPercent, 1)}%`}
            </span>
          </div>

          <div className="p-5 sm:p-6 flex-1 flex items-center">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 560 222"
                className="w-full min-w-[420px] h-auto"
                role="img"
                aria-label={
                  isEn
                    ? "Discount sensitivity bar chart from 0 to 50 percent"
                    : "กราฟแท่งวิเคราะห์ผลกระทบเมื่อจัดโปรโมชันลดราคา 0 ถึง 50 เปอร์เซ็นต์"
                }
              >
                <defs>
                  <linearGradient
                    id="khumlab-discount-profit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient
                    id="khumlab-discount-loss"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>

                <line
                  x1="18"
                  y1={chartTopPad}
                  x2="542"
                  y2={chartTopPad}
                  stroke={svgGridStroke}
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1={chartTopPad + chartPlotHeight}
                  x2="542"
                  y2={chartTopPad + chartPlotHeight}
                  stroke={svgGridStroke}
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1={discountZeroY}
                  x2="542"
                  y2={discountZeroY}
                  stroke={svgZeroStroke}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <text
                  x="14"
                  y={Math.max(14, discountZeroY - 4)}
                  fill={svgZeroLabelFill}
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

                  return (
                    <g key={point.discountPercent}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill={
                          point.isProfitable
                            ? "url(#khumlab-discount-profit)"
                            : "url(#khumlab-discount-loss)"
                        }
                        fillOpacity={isSelectedSlider ? 1 : 0.85}
                        stroke={isSelectedSlider ? svgSelectedStroke : "none"}
                        strokeWidth={isSelectedSlider ? 2 : 0}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={
                          point.isProfitable
                            ? Math.max(14, y - 7)
                            : Math.min(200, y + barHeight + 13)
                        }
                        textAnchor="middle"
                        fill={
                          point.isProfitable
                            ? svgCyanLabelFill
                            : svgLossLabelFill
                        }
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {formatCompactSignedBaht(point.profitPerUnit, locale)}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={chartTopPad + chartPlotHeight + chartBottomPad - 8}
                        textAnchor="middle"
                        fill={
                          isSelectedSlider
                            ? svgSelectedAxisFill
                            : svgAxisMutedFill
                        }
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
      </div>

      <div className={GLASS_CARD_CLASS}>
        <div
          className={`${CARD_HEADER_BAND_CLASS} flex flex-wrap items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={GLOWING_ICON_BADGE_CLASS}>
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                CHART 03 — VOLUME & BREAK-EVEN PROJECTION
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                {isEn
                  ? "Total Revenue vs. Cumulative Net Profit by Sales Volume"
                  : "เปรียบเทียบยอดขายรวม และกำไรสุทธิสะสมตามจำนวนยอดขาย"}
              </h3>
              <p className="text-xs text-zinc-400 light:text-slate-600">
                {inputs.fixedCost > 0
                  ? isEn
                    ? `Net profit shown after deducting ฿${formatCurrency(inputs.fixedCost, 0)} monthly fixed costs across 10 / 50 / 100 / 500 units`
                    : `คำนวณกำไรสุทธิหลังหักต้นทุนคงที่ต่อเดือน ฿${formatCurrency(inputs.fixedCost, 0)} เทียบกับยอดขายรวมในแต่ละระดับ`
                  : isEn
                    ? "No monthly fixed costs — comparing total revenue and cumulative net profit across 10 / 50 / 100 / 500 units"
                    : "ไม่มีต้นทุนคงที่ต่อเดือน เปรียบเทียบยอดขายรวมกับกำไรสุทธิสะสมที่ 10 / 50 / 100 / 500 ชิ้น"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-black/60 px-3 py-1 text-[11px] text-zinc-300 light:border-slate-200 light:bg-white light:text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400 light:bg-cyan-600" />
                <span>{isEn ? "Revenue" : "ยอดขายรวม"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600" />
                <span>{isEn ? "Net Profit" : "กำไรสุทธิ"}</span>
              </span>
            </div>

            {inputs.fixedCost > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-300 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-800">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  {metrics.canBreakEven && metrics.breakEvenUnits !== null
                    ? isEn
                      ? `Break-Even ${metrics.breakEvenUnits.toLocaleString(locale)} units`
                      : `จุดคุ้มทุน ${metrics.breakEvenUnits.toLocaleString(locale)} ชิ้น`
                    : isEn
                      ? "Cannot Break Even"
                      : "ยังไม่คุ้มทุน"}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 w-full overflow-x-auto">
              <svg
                viewBox="0 0 540 228"
                className="w-full min-w-[380px] h-auto"
                role="img"
                aria-label={
                  isEn
                    ? "Paired bar chart comparing total revenue and cumulative net profit at 10, 50, 100, and 500 units"
                    : "กราฟแท่งเปรียบเทียบยอดขายรวมและกำไรสุทธิสะสมที่ 10, 50, 100 และ 500 ชิ้น"
                }
              >
                <defs>
                  <linearGradient
                    id="khumlab-vol-revenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient
                    id="khumlab-vol-profit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="khumlab-vol-loss"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>

                <line
                  x1="18"
                  y1={chartTopPad}
                  x2="522"
                  y2={chartTopPad}
                  stroke={svgGridStroke}
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1={chartTopPad + chartPlotHeight}
                  x2="522"
                  y2={chartTopPad + chartPlotHeight}
                  stroke={svgGridStroke}
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1={volumeZeroY}
                  x2="522"
                  y2={volumeZeroY}
                  stroke={svgZeroStroke}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <text
                  x="14"
                  y={Math.max(14, volumeZeroY - 4)}
                  fill={svgZeroLabelFill}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ฿0
                </text>

                {analysis.volumeProjections.map((point, idx) => {
                  const slotWidth = 484 / analysis.volumeProjections.length;
                  const barWidth = 30;
                  const pairGap = 8;
                  const pairWidth = barWidth * 2 + pairGap;
                  const pairStartX =
                    32 + idx * slotWidth + (slotWidth - pairWidth) / 2;

                  const revHeight = Math.max(
                    (Math.max(0, point.revenue) / volumeRange) *
                      chartPlotHeight,
                    4
                  );
                  const revY = volumeZeroY - revHeight;

                  const profHeight = Math.max(
                    (Math.abs(point.netTotalProfit) / volumeRange) *
                      chartPlotHeight,
                    4
                  );
                  const profY = point.isProfitable
                    ? volumeZeroY - profHeight
                    : volumeZeroY;

                  const revLabelY =
                    point.isProfitable && Math.abs(revY - profY) < 12
                      ? Math.max(11, revY - 14)
                      : Math.max(13, revY - 6);
                  const profLabelY = point.isProfitable
                    ? Math.max(13, profY - 6)
                    : Math.min(204, profY + profHeight + 13);

                  return (
                    <g key={point.units}>
                      <rect
                        x={pairStartX}
                        y={revY}
                        width={barWidth}
                        height={revHeight}
                        rx="6"
                        fill="url(#khumlab-vol-revenue)"
                        fillOpacity="0.88"
                      />
                      <text
                        x={pairStartX + barWidth / 2 - 2}
                        y={revLabelY}
                        textAnchor="middle"
                        fill={svgCyanLabelFill}
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {formatCompactBaht(point.revenue, locale)}
                      </text>

                      <rect
                        x={pairStartX + barWidth + pairGap}
                        y={profY}
                        width={barWidth}
                        height={profHeight}
                        rx="6"
                        fill={
                          point.isProfitable
                            ? "url(#khumlab-vol-profit)"
                            : "url(#khumlab-vol-loss)"
                        }
                        fillOpacity="0.92"
                      />
                      <text
                        x={pairStartX + barWidth + pairGap + barWidth / 2 + 2}
                        y={profLabelY}
                        textAnchor="middle"
                        fill={
                          point.isProfitable
                            ? svgProfitLabelFill
                            : svgLossLabelFill
                        }
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        {formatCompactSignedBaht(point.netTotalProfit, locale)}
                      </text>

                      <text
                        x={pairStartX + pairWidth / 2}
                        y={chartTopPad + chartPlotHeight + chartBottomPad - 6}
                        textAnchor="middle"
                        fill={svgAxisStrongFill}
                        fontSize="11.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {point.units} {isEn ? "units" : "ชิ้น"}
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
                  className={`rounded-xl border p-3.5 space-y-1.5 ${
                    point.isProfitable
                      ? "border-emerald-500/25 bg-black/65 light:border-emerald-200 light:bg-emerald-50/45"
                      : "border-rose-500/30 bg-rose-950/15 light:border-rose-200 light:bg-rose-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-mono font-semibold text-white light:text-slate-900">
                      {point.units.toLocaleString(locale)}{" "}
                      {isEn ? "units" : "ชิ้น"}
                    </span>
                    <span className="font-mono text-[11px] text-cyan-400 light:text-cyan-700 font-medium">
                      ฿{formatCurrency(point.revenue, 0)}
                    </span>
                  </div>
                  <p
                    className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
                      point.isProfitable
                        ? "text-emerald-400 light:text-emerald-700"
                        : "text-rose-400 light:text-rose-600"
                    }`}
                  >
                    {point.netTotalProfit >= 0 ? "+" : "-"}฿
                    {formatCurrency(Math.abs(point.netTotalProfit), 0)}
                  </p>
                  <span className="block text-[11px] text-zinc-500 light:text-slate-600">
                    {point.isProfitable
                      ? isEn
                        ? "Cumulative Net Profit"
                        : "กำไรสุทธิสะสม"
                      : isEn
                        ? "Below Fixed Costs"
                        : "ยังไม่พ้นต้นทุนคงที่"}
                  </span>
                </div>
              ))}
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
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                ADVANCED SELLER METRICS & SMART ADVISOR
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                {isEn
                  ? "Deep Seller Metrics & Strategic Recommendations"
                  : "ตัวชี้วัดเชิงลึกและคำแนะนำเชิงกลยุทธ์"}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-amber-500/25 bg-black/65 p-4 flex flex-col justify-between gap-3 light:border-amber-200 light:bg-amber-50/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/12 text-amber-400 light:border-amber-300 light:bg-amber-100 light:text-amber-700">
                  <PackageX className="h-4 w-4" />
                </span>
                <div className="space-y-1 min-w-0">
                  <span className="block text-xs text-zinc-400 light:text-slate-600">
                    {isEn
                      ? "Return / Damage Risk (Return Loss)"
                      : "ความเสี่ยงพัสดุตีกลับ / เสียหาย (Return Loss)"}
                  </span>
                  {analysis.returnLossMultiplier !== null ? (
                    <p
                      className={`font-mono text-2xl font-bold tabular-nums ${
                        analysis.returnLossMultiplier >= 5
                          ? "text-rose-400 light:text-rose-600"
                          : analysis.returnLossMultiplier >= 3
                            ? "text-amber-300 light:text-amber-700"
                            : "text-emerald-400 light:text-emerald-700"
                      }`}
                    >
                      {analysis.returnLossMultiplier}{" "}
                      {isEn
                        ? analysis.returnLossMultiplier === 1
                          ? "unit"
                          : "units"
                        : "ชิ้น"}
                    </p>
                  ) : (
                    <p className="font-mono text-lg font-bold text-zinc-500 light:text-slate-400">
                      —
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-400 light:text-slate-600 leading-relaxed">
                {isIncomplete
                  ? isEn
                    ? "Enter a selling price to evaluate parcel return risk."
                    : "กรุณาระบุราคาขายเพื่อประเมินความเสี่ยงพัสดุตีกลับ"
                  : analysis.returnLossMultiplier === null
                    ? isEn
                      ? "Current price loses money per unit and cannot absorb parcel return costs."
                      : "ราคาปัจจุบันขาดทุนต่อชิ้น ไม่สามารถชดเชยต้นทุนพัสดุตีกลับได้"
                    : analysis.returnLossMultiplier === 0
                      ? isEn
                        ? "Zero variable cost lost per unit when a parcel is returned."
                        : "ไม่มีต้นทุนผันแปรที่สูญเสียต่อชิ้นเมื่อเกิดการตีกลับ"
                      : isEn
                        ? `Every 1 returned parcel requires ${analysis.returnLossMultiplier} extra sales just to recover the loss.`
                        : `หากโดนตีกลับ 1 ชิ้น ต้องขายเพิ่ม ${analysis.returnLossMultiplier} ชิ้นถึงจะคืนทุน`}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/25 bg-black/65 p-4 flex flex-col justify-between gap-3 light:border-cyan-200 light:bg-cyan-50/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/12 text-cyan-400 light:border-cyan-300 light:bg-cyan-100 light:text-cyan-700">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div className="space-y-1 min-w-0">
                  <span className="block text-xs text-zinc-400 light:text-slate-600">
                    {isEn
                      ? "Max Allowable Ad Spend (Max Safe CPA)"
                      : "ค่าโฆษณาสูงสุดที่รับได้ (Max Safe CPA)"}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-mono text-2xl font-bold tabular-nums text-cyan-300 light:text-cyan-700">
                      {isIncomplete
                        ? "—"
                        : `฿${formatCurrency(analysis.maxSafeTotalAds)}`}
                    </p>
                    {analysis.breakEvenRoas !== null && (
                      <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300 light:border-cyan-300 light:bg-cyan-100 light:text-cyan-800">
                        {isEn ? "Min ROAS" : "ROAS ขั้นต่ำ"}{" "}
                        {formatCurrency(analysis.breakEvenRoas, 2)}x
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 light:text-slate-600 leading-relaxed">
                {isIncomplete
                  ? isEn
                    ? "Enter a selling price to calculate your max CPA ceiling and Break-Even ROAS."
                    : "กรุณาระบุราคาขายเพื่อคำนวณเพดานค่าแอดและ Break-Even ROAS"
                  : analysis.maxSafeAdditionalAds > 0
                    ? isEn
                      ? `You can spend up to +฿${formatCurrency(analysis.maxSafeAdditionalAds)}/unit more on ads before net profit hits ฿0.`
                      : `อัดค่าแอดเพิ่มจากปัจจุบันได้อีกสูงสุด +฿${formatCurrency(analysis.maxSafeAdditionalAds)}/ชิ้น ก่อนกำไรจะเป็น ฿0`
                    : isEn
                      ? "No remaining headroom to increase ad spend — already at or past unit break-even."
                      : "ไม่สามารถเพิ่มงบโฆษณาจากระดับนี้ได้แล้ว เนื่องจากเกินจุดคุ้มทุนต่อชิ้น"}
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/25 bg-black/65 p-4 flex flex-col justify-between gap-3 light:border-purple-200 light:bg-purple-50/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/12 text-purple-400 light:border-purple-300 light:bg-purple-100 light:text-purple-700">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="space-y-1 min-w-0">
                  <span className="block text-xs text-zinc-400 light:text-slate-600">
                    {isEn
                      ? "Actionable Optimization Plan (Actionable Fix)"
                      : "ทางออกปรับแก้แบบเจาะจง (Actionable Fix)"}
                  </span>
                  <p className="text-sm font-semibold text-zinc-100 light:text-slate-900">
                    {isIncomplete
                      ? isEn
                        ? "Awaiting selling price"
                        : "รอการระบุราคาขาย"
                      : analysis.actionableFix.needsImprovement
                        ? isEn
                          ? "How to reach a healthy 25% net margin"
                          : "แนวทางดันกำไรสุทธิให้ถึง 25%"
                        : isEn
                          ? "Exceeds the 25% benchmark margin"
                          : "ผ่านเกณฑ์กำไรมาตรฐาน 25% แล้ว"}
                  </p>
                </div>
              </div>

              {isIncomplete ? (
                <p className="text-xs text-zinc-500 light:text-slate-500 leading-relaxed">
                  {isEn
                    ? "Enter a selling price per unit to generate exact pricing and cost-cutting targets."
                    : "ระบุราคาขายต่อชิ้นเพื่อรับตัวเลขปรับราคาและลดต้นทุนอัตโนมัติ"}
                </p>
              ) : analysis.actionableFix.needsImprovement ? (
                <div className="space-y-1.5 text-xs text-zinc-300 light:text-slate-700 leading-relaxed">
                  <p>
                    <strong className="text-purple-400 light:text-purple-700">
                      {isEn ? "Option 1:" : "ทางเลือก 1:"}
                    </strong>{" "}
                    {analysis.actionableFix.targetSellingPrice !== null &&
                    analysis.actionableFix.priceIncreaseNeeded !== null
                      ? isEn
                        ? `Raise price from ฿${formatCurrency(analysis.actionableFix.currentSellingPrice)} to ฿${formatCurrency(analysis.actionableFix.targetSellingPrice)} (+฿${formatCurrency(analysis.actionableFix.priceIncreaseNeeded)}) for a 25% net margin.`
                        : `ปรับราคาขายจาก ฿${formatCurrency(analysis.actionableFix.currentSellingPrice)} เป็น ฿${formatCurrency(analysis.actionableFix.targetSellingPrice)} (+฿${formatCurrency(analysis.actionableFix.priceIncreaseNeeded)}) เพื่อให้ได้กำไรสุทธิ 25%`
                      : isEn
                        ? "Platform GP rate is too high to achieve a 25% margin through price increases alone."
                        : "ค่า GP แพลตฟอร์มสูงเกินกว่าจะทำกำไร 25% ได้จากการขึ้นราคา"}
                  </p>
                  <p>
                    <strong className="text-cyan-400 light:text-cyan-700">
                      {isEn ? "Option 2:" : "ทางเลือก 2:"}
                    </strong>{" "}
                    {analysis.actionableFix.costReductionFeasible
                      ? isEn
                        ? `Or cut unit cost/ad spend by ฿${formatCurrency(analysis.actionableFix.costReductionNeeded)}/unit to keep the current price.`
                        : `หรือลดต้นทุน/ค่าแอดลง ฿${formatCurrency(analysis.actionableFix.costReductionNeeded)} ต่อชิ้น หากต้องการขายราคาเดิม`
                      : isEn
                        ? `Requires cutting ฿${formatCurrency(analysis.actionableFix.costReductionNeeded)}/unit (exceeds current variable costs — combine with a price raise).`
                        : `ต้องลดต้นทุน/ค่าแอดลง ฿${formatCurrency(analysis.actionableFix.costReductionNeeded)} ต่อชิ้น (เกินต้นทุนผันแปรปัจจุบัน แนะนำปรับราคาขายร่วมด้วย)`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-300/90 light:text-emerald-800 leading-relaxed">
                  {isEn ? (
                    <>
                      Your current structure delivers{" "}
                      <strong className="font-mono">
                        {formatCurrency(metrics.netMarginPercent, 1)}%
                      </strong>{" "}
                      margin — safely above the 25% benchmark and ready to scale
                      ads or run campaigns.
                    </>
                  ) : (
                    <>
                      โครงสร้างปัจจุบันทำกำไรได้{" "}
                      <strong className="font-mono">
                        {formatCurrency(metrics.netMarginPercent, 1)}%
                      </strong>{" "}
                      สูงกว่าเกณฑ์ปลอดภัย 25% พร้อมสำหรับการขยายงบโฆษณาหรือจัดโปรโมชัน
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {!isIncomplete && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-zinc-200 light:text-slate-800">
                {isEn
                  ? `3-Tier Suggested Retail Pricing (Already factored in ${inputs.platformFeePercent}% GP)`
                  : `ราคาขายแนะนำ 3 ระดับ (คำนวณทบกลับค่า GP ${inputs.platformFeePercent}% เรียบร้อยแล้ว)`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {analysis.targetPrices.map((tier) => {
                  const isCompetitive = tier.targetMarginPercent === 20;
                  const isHighMargin = tier.targetMarginPercent === 40;

                  const cardBorderClass = tier.recommended
                    ? "border-emerald-400/55 bg-emerald-500/[0.08] shadow-[0_0_20px_-8px_rgba(16,185,129,0.3)] light:border-emerald-400 light:bg-emerald-50/75 light:shadow-xs"
                    : isCompetitive
                      ? "border-cyan-500/30 bg-black/65 light:border-cyan-200 light:bg-cyan-50/35"
                      : isHighMargin
                        ? "border-purple-500/30 bg-black/65 light:border-purple-200 light:bg-purple-50/35"
                        : "border-zinc-800/90 bg-black/65 light:border-slate-200 light:bg-slate-50";

                  const badgeClass = tier.recommended
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300"
                    : isCompetitive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 light:bg-cyan-100 light:text-cyan-800 light:border-cyan-300"
                      : "bg-purple-500/15 text-purple-300 border border-purple-500/30 light:bg-purple-100 light:text-purple-800 light:border-purple-300";

                  const priceClass = tier.recommended
                    ? "text-emerald-400 light:text-emerald-700"
                    : isCompetitive
                      ? "text-cyan-300 light:text-cyan-700"
                      : "text-purple-300 light:text-purple-700";

                  return (
                    <div
                      key={tier.targetMarginPercent}
                      className={`rounded-xl border p-4 space-y-2 ${cardBorderClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white light:text-slate-900">
                          {tier.tierLabel}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold ${badgeClass}`}
                        >
                          Margin {tier.targetMarginPercent}%
                        </span>
                      </div>

                      {tier.feasible &&
                      tier.suggestedPrice !== null &&
                      tier.estimatedProfitPerUnit !== null ? (
                        <>
                          <p
                            className={`font-mono text-2xl font-bold tabular-nums ${priceClass}`}
                          >
                            ฿{formatCurrency(tier.suggestedPrice)}
                          </p>
                          <p className="text-xs text-zinc-400 light:text-slate-600">
                            {isEn ? "Est. net profit " : "เหลือกำไรสุทธิ "}
                            <span className="font-mono font-semibold text-emerald-400 light:text-emerald-700">
                              +฿{formatCurrency(tier.estimatedProfitPerUnit)}
                              {isEn ? "/unit" : "/ชิ้น"}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-rose-400 light:text-rose-600 pt-1">
                          {isEn
                            ? "Cannot target this margin because the platform GP fee is too high."
                            : "ไม่สามารถตั้งราคาเป้าหมายนี้ได้ เนื่องจากค่า GP แพลตฟอร์มสูงเกินเกณฑ์"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <p className="text-xs sm:text-sm font-semibold text-zinc-200 light:text-slate-800">
              {isEn
                ? "Strategic Insights for This Product"
                : "คำแนะนำเชิงกลยุทธ์เฉพาะสำหรับรายการนี้"}
            </p>
            <div className="space-y-2.5">
              {analysis.insights.map((insight) => (
                <div
                  key={insight.title}
                  className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                    insight.severity === "danger"
                      ? "border-rose-500/30 bg-rose-950/20 light:border-rose-200 light:bg-rose-50/75"
                      : insight.severity === "warning"
                        ? "border-amber-500/25 bg-amber-950/15 light:border-amber-200 light:bg-amber-50/75"
                        : "border-emerald-500/25 bg-emerald-950/15 light:border-emerald-200 light:bg-emerald-50/75"
                  }`}
                >
                  {insight.severity === "healthy" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 light:text-emerald-600" />
                  ) : (
                    <AlertCircle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        insight.severity === "danger"
                          ? "text-rose-400 light:text-rose-600"
                          : "text-amber-400 light:text-amber-600"
                      }`}
                    />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-100 light:text-slate-900">
                      {insight.title}
                    </p>
                    <p className="text-xs text-zinc-400 light:text-slate-600 leading-relaxed">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
