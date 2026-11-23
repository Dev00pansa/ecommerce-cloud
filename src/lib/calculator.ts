import type {
  ActionableFixRecommendation,
  CalculationMetrics,
  CalculatorInputValues,
  CsvExportColumnKey,
  CsvExportColumnOption,
  DiscountSensitivityPoint,
  EcommerceCalculationRecord,
  FinancialAnalysisResult,
  HealthScoreFactor,
  PlatformPreset,
  PricingAdvisorInsight,
  ProfitHealthGrade,
  PromoSimulationResult,
  TargetPriceRecommendation,
  VolumeProjectionPoint,
} from "@/types";

export const MAX_CLOUD_RECORDS = 20;
export const MAX_MONETARY_VALUE = 299_999;

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "Shopee", label: "Shopee 13%", badge: "Marketplace", feePercent: 13 },
  { id: "TikTok Shop", label: "TikTok Shop 12%", badge: "Social Commerce", feePercent: 12 },
  { id: "Lazada", label: "Lazada 12%", badge: "Marketplace", feePercent: 12 },
  { id: "ขายตรง", label: "ขายตรง 0%", badge: "Direct / Chat", feePercent: 0 },
];

export const CSV_EXPORT_COLUMNS: readonly CsvExportColumnOption[] = [
  { key: "product_name", label: "ชื่อสินค้า", defaultSelected: true },
  { key: "platform", label: "แพลตฟอร์ม", defaultSelected: true },
  { key: "total_cost_per_unit", label: "ต้นทุนรวมต่อชิ้น (บาท)", defaultSelected: true },
  { key: "selling_price", label: "ราคาขาย (บาท)", defaultSelected: true },
  { key: "net_profit_per_unit", label: "กำไรสุทธิต่อชิ้น (บาท)", defaultSelected: true },
  { key: "net_margin_percent", label: "Net Margin (%)", defaultSelected: true },
  { key: "created_at", label: "วันที่บันทึก", defaultSelected: true },
  { key: "cost_price", label: "ต้นทุนสินค้า (บาท)", defaultSelected: false },
  { key: "packaging_cost", label: "ค่าแพ็ก (บาท)", defaultSelected: false },
  { key: "ads_cost", label: "ค่าแอด (บาท)", defaultSelected: false },
  { key: "platform_fee_percent", label: "ค่าธรรมเนียม (%)", defaultSelected: false },
  { key: "platform_fee_baht", label: "ค่าธรรมเนียม (บาท)", defaultSelected: false },
  { key: "fixed_cost", label: "ต้นทุนคงที่รวม (บาท)", defaultSelected: false },
  { key: "break_even_units", label: "จุดคุ้มทุน (ชิ้น)", defaultSelected: false },
];

export const DEFAULT_CSV_EXPORT_KEYS: CsvExportColumnKey[] = CSV_EXPORT_COLUMNS
  .filter((col) => col.defaultSelected)
  .map((col) => col.key);

export const ALL_CSV_EXPORT_KEYS: CsvExportColumnKey[] = CSV_EXPORT_COLUMNS.map(
  (col) => col.key
);

export function parseSafeNonNegativeNumber(raw: string, max?: number): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;

  if (typeof max === "number" && parsed > max) {
    return max;
  }

  return parsed;
}

export function formatCurrency(value: number, decimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculateEcommerceMetrics(
  input: CalculatorInputValues
): CalculationMetrics {
  const costPrice = Number.isFinite(input.costPrice) && input.costPrice > 0 ? input.costPrice : 0;
  const packagingCost =
    Number.isFinite(input.packagingCost) && input.packagingCost > 0 ? input.packagingCost : 0;
  const adsCost = Number.isFinite(input.adsCost) && input.adsCost > 0 ? input.adsCost : 0;
  const platformFeePercent =
    Number.isFinite(input.platformFeePercent) && input.platformFeePercent > 0
      ? Math.min(100, input.platformFeePercent)
      : 0;
  const sellingPrice =
    Number.isFinite(input.sellingPrice) && input.sellingPrice > 0 ? input.sellingPrice : 0;
  const fixedCost = Number.isFinite(input.fixedCost) && input.fixedCost > 0 ? input.fixedCost : 0;

  const platformFeeBaht = sellingPrice * (platformFeePercent / 100);
  const packAndAdsCost = packagingCost + adsCost;
  const totalCostPerUnit = costPrice + packAndAdsCost + platformFeeBaht;
  const netProfitPerUnit = sellingPrice - totalCostPerUnit;

  const netMarginPercent =
    sellingPrice > 0 ? (netProfitPerUnit / sellingPrice) * 100 : 0;

  const canBreakEven = netProfitPerUnit > 0;
  const breakEvenUnits = canBreakEven
    ? Math.ceil(fixedCost / netProfitPerUnit)
    : null;
  const breakEvenRevenue =
    breakEvenUnits !== null ? breakEvenUnits * sellingPrice : null;

  const chartBase = Math.max(sellingPrice, totalCostPerUnit, 1);
  const productCostShare = (costPrice / chartBase) * 100;
  const packAdsShare = (packAndAdsCost / chartBase) * 100;
  const feeShare = (platformFeeBaht / chartBase) * 100;
  const profitShare =
    netProfitPerUnit > 0 ? (netProfitPerUnit / chartBase) * 100 : 0;

  return {
    platformFeeBaht,
    totalCostPerUnit,
    netProfitPerUnit,
    netMarginPercent,
    canBreakEven,
    breakEvenUnits,
    breakEvenRevenue,
    packAndAdsCost,
    productCostShare,
    packAdsShare,
    feeShare,
    profitShare,
  };
}

export function simulatePromoDiscount(
  input: CalculatorInputValues,
  baseMetrics: CalculationMetrics,
  rawDiscountPercent: number
): PromoSimulationResult {
  const discountPercent = Number.isFinite(rawDiscountPercent)
    ? Math.min(50, Math.max(0, rawDiscountPercent))
    : 0;

  const costPrice = Math.max(0, Number.isFinite(input.costPrice) ? input.costPrice : 0);
  const packagingCost = Math.max(0, Number.isFinite(input.packagingCost) ? input.packagingCost : 0);
  const adsCost = Math.max(0, Number.isFinite(input.adsCost) ? input.adsCost : 0);
  const platformFeePercent = Math.min(
    100,
    Math.max(0, Number.isFinite(input.platformFeePercent) ? input.platformFeePercent : 0)
  );
  const sellingPrice = Math.max(0, Number.isFinite(input.sellingPrice) ? input.sellingPrice : 0);
  const fixedCost = Math.max(0, Number.isFinite(input.fixedCost) ? input.fixedCost : 0);

  const discountedPrice = sellingPrice * (1 - discountPercent / 100);
  const discountedPlatformFeeBaht = discountedPrice * (platformFeePercent / 100);
  const discountedTotalCostPerUnit =
    costPrice + packagingCost + adsCost + discountedPlatformFeeBaht;
  const discountedProfitPerUnit = discountedPrice - discountedTotalCostPerUnit;

  const discountedMarginPercent =
    discountedPrice > 0 ? (discountedProfitPerUnit / discountedPrice) * 100 : 0;

  const discountedBreakEvenUnits =
    discountedProfitPerUnit > 0 ? Math.ceil(fixedCost / discountedProfitPerUnit) : null;

  const baselineUnits = 100;
  const baselineTotalProfit =
    baseMetrics.netProfitPerUnit > 0
      ? baseMetrics.netProfitPerUnit * baselineUnits
      : 0;

  const canMatchBaselineProfit =
    baseMetrics.netProfitPerUnit > 0 && discountedProfitPerUnit > 0;

  const requiredUnitsForSameProfit = canMatchBaselineProfit
    ? Math.ceil(baselineTotalProfit / discountedProfitPerUnit)
    : null;

  const volumeMultiplier = canMatchBaselineProfit
    ? baseMetrics.netProfitPerUnit / discountedProfitPerUnit
    : null;

  return {
    discountPercent,
    discountedPrice,
    discountedPlatformFeeBaht,
    discountedTotalCostPerUnit,
    discountedProfitPerUnit,
    discountedMarginPercent,
    discountedBreakEvenUnits,
    baselineUnits,
    baselineTotalProfit,
    requiredUnitsForSameProfit,
    volumeMultiplier,
  };
}

export function exportCalculationsToCsv(
  items: EcommerceCalculationRecord[],
  selectedKeys?: readonly CsvExportColumnKey[],
  fallbackInput?: CalculatorInputValues
): string {
  const keySet =
    selectedKeys !== undefined
      ? new Set(selectedKeys)
      : new Set(ALL_CSV_EXPORT_KEYS);

  const activeColumns = CSV_EXPORT_COLUMNS.filter((col) => keySet.has(col.key));
  if (activeColumns.length === 0) {
    return "\uFEFF";
  }

  const rows =
    items.length > 0
      ? items.map((r) => ({
          productName: r.product_name,
          platform: r.platform,
          costPrice: Number(r.cost_price) || 0,
          packagingCost: Number(r.packaging_cost) || 0,
          adsCost: Number(r.ads_cost) || 0,
          platformFeePercent: Number(r.platform_fee_percent) || 0,
          sellingPrice: Number(r.selling_price) || 0,
          fixedCost: Number(r.fixed_cost) || 0,
          createdAt: new Date(r.created_at).toLocaleString("th-TH"),
        }))
      : fallbackInput
        ? [
            {
              productName: fallbackInput.productName.trim() || "สินค้าปัจจุบัน",
              platform: fallbackInput.platform,
              costPrice: fallbackInput.costPrice,
              packagingCost: fallbackInput.packagingCost,
              adsCost: fallbackInput.adsCost,
              platformFeePercent: fallbackInput.platformFeePercent,
              sellingPrice: fallbackInput.sellingPrice,
              fixedCost: fallbackInput.fixedCost,
              createdAt: new Date().toLocaleString("th-TH"),
            },
          ]
        : [];

  const escapeCell = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`;

  const headers = activeColumns.map((col) => escapeCell(col.label));

  const lines = [
    headers.join(","),
    ...rows.map((row) => {
      const m = calculateEcommerceMetrics({
        productName: row.productName,
        platform: row.platform,
        costPrice: row.costPrice,
        packagingCost: row.packagingCost,
        adsCost: row.adsCost,
        platformFeePercent: row.platformFeePercent,
        sellingPrice: row.sellingPrice,
        fixedCost: row.fixedCost,
      });

      const cellMap: Record<CsvExportColumnKey, string> = {
        product_name: escapeCell(row.productName),
        platform: escapeCell(row.platform),
        cost_price: row.costPrice.toFixed(2),
        packaging_cost: row.packagingCost.toFixed(2),
        ads_cost: row.adsCost.toFixed(2),
        platform_fee_percent: row.platformFeePercent.toFixed(2),
        platform_fee_baht: m.platformFeeBaht.toFixed(2),
        total_cost_per_unit: m.totalCostPerUnit.toFixed(2),
        selling_price: row.sellingPrice.toFixed(2),
        net_profit_per_unit: m.netProfitPerUnit.toFixed(2),
        net_margin_percent: m.netMarginPercent.toFixed(2),
        fixed_cost: row.fixedCost.toFixed(2),
        break_even_units: escapeCell(
          m.breakEvenUnits !== null ? m.breakEvenUnits : "ไม่สามารถคืนทุนได้"
        ),
        created_at: escapeCell(row.createdAt),
      };

      return activeColumns.map((col) => cellMap[col.key]).join(",");
    }),
  ];

  return "\uFEFF" + lines.join("\r\n");
}

export function buildCsvExportContent(
  records: EcommerceCalculationRecord[],
  fallbackInput: CalculatorInputValues,
  selectedKeys?: readonly CsvExportColumnKey[]
): string {
  return exportCalculationsToCsv(records, selectedKeys, fallbackInput);
}

const DISCOUNT_SENSITIVITY_STEPS: readonly number[] = [
  0, 5, 10, 15, 20, 30, 40, 50,
];

const VOLUME_PROJECTION_UNITS: readonly number[] = [10, 50, 100, 500];

const TARGET_MARGIN_TIERS: readonly {
  targetMarginPercent: number;
  tierLabel: string;
  tierSubtitle: string;
  recommended: boolean;
}[] = [
  {
    targetMarginPercent: 20,
    tierLabel: "ราคาแข่งขัน",
    tierSubtitle: "อัตรากำไรเป้าหมาย 20%",
    recommended: false,
  },
  {
    targetMarginPercent: 30,
    tierLabel: "ราคามาตรฐานแนะนำ",
    tierSubtitle: "อัตรากำไรเป้าหมาย 30%",
    recommended: true,
  },
  {
    targetMarginPercent: 40,
    tierLabel: "ราคาทำกำไรสูง",
    tierSubtitle: "อัตรากำไรเป้าหมาย 40%",
    recommended: false,
  },
];

export function buildFinancialAnalysis(
  input: CalculatorInputValues,
  baseMetrics: CalculationMetrics
): FinancialAnalysisResult {
  const costPrice =
    Number.isFinite(input.costPrice) && input.costPrice > 0
      ? input.costPrice
      : 0;
  const packagingCost =
    Number.isFinite(input.packagingCost) && input.packagingCost > 0
      ? input.packagingCost
      : 0;
  const adsCost =
    Number.isFinite(input.adsCost) && input.adsCost > 0 ? input.adsCost : 0;
  const platformFeePercent =
    Number.isFinite(input.platformFeePercent) && input.platformFeePercent > 0
      ? Math.min(100, input.platformFeePercent)
      : 0;
  const sellingPrice =
    Number.isFinite(input.sellingPrice) && input.sellingPrice > 0
      ? input.sellingPrice
      : 0;
  const fixedCost =
    Number.isFinite(input.fixedCost) && input.fixedCost > 0
      ? input.fixedCost
      : 0;

  const isIncompleteData = sellingPrice <= 0;
  const hasZeroProductCostWarning = sellingPrice > 0 && costPrice <= 0;

  const feeRate = platformFeePercent / 100;
  const nonFeeUnitCost = costPrice + packagingCost + adsCost;

  const discountCurve: DiscountSensitivityPoint[] =
    DISCOUNT_SENSITIVITY_STEPS.map((discountPercent) => {
      const discountedPrice = sellingPrice * (1 - discountPercent / 100);
      const feeBaht = discountedPrice * feeRate;
      const profitPerUnit = discountedPrice - (nonFeeUnitCost + feeBaht);
      const marginPercent =
        discountedPrice > 0 ? (profitPerUnit / discountedPrice) * 100 : 0;

      return {
        discountPercent,
        discountedPrice,
        profitPerUnit,
        marginPercent,
        isProfitable: profitPerUnit >= 0,
      };
    });

  const volumeProjections: VolumeProjectionPoint[] =
    VOLUME_PROJECTION_UNITS.map((units) => {
      const revenue = sellingPrice * units;
      const grossProfit = baseMetrics.netProfitPerUnit * units;
      const netTotalProfit = grossProfit - fixedCost;

      return {
        units,
        revenue,
        grossProfit,
        netTotalProfit,
        isProfitable: netTotalProfit >= 0,
      };
    });

  const minBreakEvenSellingPrice =
    feeRate < 1 ? nonFeeUnitCost / (1 - feeRate) : null;

  const targetPrices: TargetPriceRecommendation[] = TARGET_MARGIN_TIERS.map(
    (tier) => {
      const targetRate = tier.targetMarginPercent / 100;
      const denominator = 1 - feeRate - targetRate;
      if (denominator <= 0.0001) {
        return {
          ...tier,
          suggestedPrice: null,
          estimatedProfitPerUnit: null,
          feasible: false,
        };
      }

      const rawPrice = nonFeeUnitCost / denominator;
      const suggestedPrice =
        Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;
      const estimatedProfitPerUnit = suggestedPrice * targetRate;

      return {
        ...tier,
        suggestedPrice,
        estimatedProfitPerUnit,
        feasible: true,
      };
    }
  );

  const maxSafeAdditionalAds = isIncompleteData
    ? 0
    : Math.max(0, baseMetrics.netProfitPerUnit);
  const maxSafeTotalAds = isIncompleteData
    ? 0
    : Math.max(
        0,
        sellingPrice - baseMetrics.platformFeeBaht - costPrice - packagingCost
      );
  const breakEvenRoas =
    !isIncompleteData && maxSafeTotalAds > 0
      ? sellingPrice / maxSafeTotalAds
      : null;

  let maxSafeDiscountPercent = 0;
  if (!isIncompleteData && feeRate < 1 && baseMetrics.netProfitPerUnit > 0) {
    const breakEvenRatio = nonFeeUnitCost / (sellingPrice * (1 - feeRate));
    const computedDiscount = (1 - breakEvenRatio) * 100;
    if (Number.isFinite(computedDiscount)) {
      maxSafeDiscountPercent = Math.max(0, Math.min(100, computedDiscount));
    }
  }

  const returnLossMultiplier =
    !isIncompleteData && baseMetrics.netProfitPerUnit > 0
      ? baseMetrics.totalCostPerUnit > 0
        ? Math.ceil(
            baseMetrics.totalCostPerUnit / baseMetrics.netProfitPerUnit
          )
        : 0
      : null;

  const targetMarginForFix = 25;
  const fixDenominator = 1 - feeRate - targetMarginForFix / 100;
  const targetPriceForFix =
    !isIncompleteData && fixDenominator > 0.0001
      ? nonFeeUnitCost / fixDenominator
      : null;
  const priceIncreaseNeeded =
    targetPriceForFix !== null
      ? Math.max(0, targetPriceForFix - sellingPrice)
      : null;
  const targetProfitAtCurrentPrice =
    sellingPrice * (targetMarginForFix / 100);
  const costReductionNeeded = isIncompleteData
    ? 0
    : Math.max(0, targetProfitAtCurrentPrice - baseMetrics.netProfitPerUnit);
  const costReductionFeasible =
    !isIncompleteData && costReductionNeeded <= nonFeeUnitCost;

  const actionableFix: ActionableFixRecommendation = {
    needsImprovement:
      !isIncompleteData && baseMetrics.netMarginPercent < targetMarginForFix,
    targetMarginPercent: targetMarginForFix,
    currentSellingPrice: sellingPrice,
    targetSellingPrice: targetPriceForFix,
    priceIncreaseNeeded,
    costReductionNeeded,
    costReductionFeasible,
  };

  if (isIncompleteData) {
    const emptyBreakdown: HealthScoreFactor[] = [
      {
        key: "margin",
        label: "อัตรากำไรสุทธิ (Net Margin)",
        score: 0,
        maxScore: 40,
        summary: "ยังไม่มีราคาขาย",
      },
      {
        key: "ads",
        label: "ประสิทธิภาพค่าแอด (Ad Ratio)",
        score: 0,
        maxScore: 25,
        summary: "ยังไม่มีราคาขาย",
      },
      {
        key: "discount",
        label: "กันชนส่วนลด (Discount Buffer)",
        score: 0,
        maxScore: 20,
        summary: "ยังไม่มีราคาขาย",
      },
      {
        key: "unit_risk",
        label: "ผลตอบแทนต่อความเสี่ยง (Unit Risk)",
        score: 0,
        maxScore: 15,
        summary: "ยังไม่มีราคาขาย",
      },
    ];

    return {
      isIncompleteData: true,
      hasZeroProductCostWarning: false,
      healthScore: 0,
      healthGrade: "N/A",
      healthGradeLabel: "ข้อมูลไม่สมบูรณ์ — ยังไม่ได้ตั้งราคาขาย",
      healthBreakdown: emptyBreakdown,
      discountCurve,
      volumeProjections,
      targetPrices,
      minBreakEvenSellingPrice,
      maxSafeAdditionalAds: 0,
      maxSafeTotalAds: 0,
      breakEvenRoas: null,
      maxSafeDiscountPercent: 0,
      returnLossMultiplier: null,
      actionableFix,
      healthLevel: "incomplete",
      insights: [
        {
          severity: "warning",
          title: "ยังไม่ได้ตั้งราคาขายต่อชิ้น",
          detail:
            "กรุณาย้อนกลับไประบุราคาขายต่อชิ้น เพื่อให้ระบบวิเคราะห์กำไรและจุดคุ้มทุนได้จริง",
        },
      ],
    };
  }

  const marginScore =
    baseMetrics.netMarginPercent >= 35
      ? 40
      : baseMetrics.netMarginPercent >= 25
        ? 32
        : baseMetrics.netMarginPercent >= 15
          ? 22
          : baseMetrics.netMarginPercent >= 5
            ? 10
            : 0;

  const adCostRatioPercent =
    sellingPrice > 0 ? (adsCost / sellingPrice) * 100 : 0;
  const adCostScore =
    adCostRatioPercent <= 15
      ? 25
      : adCostRatioPercent <= 25
        ? 16
        : adCostRatioPercent <= 35
          ? 8
          : 0;

  const discountBufferScore =
    maxSafeDiscountPercent >= 25
      ? 20
      : maxSafeDiscountPercent >= 15
        ? 14
        : maxSafeDiscountPercent >= 5
          ? 7
          : 0;

  let unitRiskScore = 0;
  if (baseMetrics.netProfitPerUnit > 0) {
    if (baseMetrics.totalCostPerUnit <= 0) {
      unitRiskScore = 15;
    } else {
      const unitRiskRatio =
        baseMetrics.netProfitPerUnit / baseMetrics.totalCostPerUnit;
      unitRiskScore =
        unitRiskRatio >= 0.5
          ? 15
          : unitRiskRatio >= 0.3
            ? 12
            : unitRiskRatio >= 0.15
              ? 8
              : unitRiskRatio >= 0.05
                ? 4
                : 1;
    }
  }

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      marginScore + adCostScore + discountBufferScore + unitRiskScore
    )
  );

  let healthGrade: ProfitHealthGrade;
  let healthGradeLabel: string;
  if (baseMetrics.netProfitPerUnit <= 0 || healthScore < 35) {
    healthGrade = "D";
    healthGradeLabel = "เกรด D — โครงสร้างอันตราย";
  } else if (healthScore >= 85) {
    healthGrade = "S";
    healthGradeLabel = "เกรด S — โครงสร้างแกร่งมาก";
  } else if (healthScore >= 70) {
    healthGrade = "A";
    healthGradeLabel = "เกรด A — น่าลงทุน";
  } else if (healthScore >= 55) {
    healthGrade = "B";
    healthGradeLabel = "เกรด B — พอไปได้แต่ต้องคุมต้นทุน";
  } else {
    healthGrade = "C";
    healthGradeLabel = "เกรด C — กำไรบางเสี่ยงเข้าเนื้อ";
  }

  const unitRiskRatioValue =
    baseMetrics.totalCostPerUnit > 0
      ? baseMetrics.netProfitPerUnit / baseMetrics.totalCostPerUnit
      : baseMetrics.netProfitPerUnit > 0
        ? 1
        : 0;

  const healthBreakdown: HealthScoreFactor[] = [
    {
      key: "margin",
      label: "อัตรากำไรสุทธิ (Net Margin)",
      score: marginScore,
      maxScore: 40,
      summary: `${formatCurrency(baseMetrics.netMarginPercent, 1)}%`,
    },
    {
      key: "ads",
      label: "ประสิทธิภาพค่าแอด (Ad Ratio)",
      score: adCostScore,
      maxScore: 25,
      summary: `${formatCurrency(adCostRatioPercent, 1)}% ของราคาขาย`,
    },
    {
      key: "discount",
      label: "กันชนส่วนลด (Discount Buffer)",
      score: discountBufferScore,
      maxScore: 20,
      summary: `ลดปลอดภัยสูงสุด ${formatCurrency(maxSafeDiscountPercent, 1)}%`,
    },
    {
      key: "unit_risk",
      label: "ความคุ้มทุนต่อความเสี่ยง (Unit Risk)",
      score: unitRiskScore,
      maxScore: 15,
      summary:
        baseMetrics.netProfitPerUnit > 0
          ? `${formatCurrency(unitRiskRatioValue * 100, 0)}% ต่อทุนผันแปร`
          : "ขาดทุนต่อชิ้น",
    },
  ];

  const healthLevel: FinancialAnalysisResult["healthLevel"] =
    baseMetrics.netProfitPerUnit < 0
      ? "loss"
      : baseMetrics.netMarginPercent < 15
        ? "thin"
        : baseMetrics.netMarginPercent < 30
          ? "good"
          : "excellent";

  const insights: PricingAdvisorInsight[] = [];

  if (baseMetrics.netProfitPerUnit < 0) {
    const shortfall = Math.abs(baseMetrics.netProfitPerUnit);
    insights.push({
      severity: "danger",
      title: `ราคาขายปัจจุบันขาดทุนชิ้นละ ฿${formatCurrency(shortfall)}`,
      detail:
        minBreakEvenSellingPrice !== null
          ? `ควรปรับราคาขายขึ้นเป็นอย่างน้อย ฿${formatCurrency(minBreakEvenSellingPrice)} เพื่อหยุดการขาดทุน หรือปรับเป็น ฿${formatCurrency(targetPriceForFix ?? minBreakEvenSellingPrice)} เพื่อสร้างกำไรสุทธิ 25%`
          : "ค่าธรรมเนียมแพลตฟอร์มสูงถึง 100% ทำให้ไม่สามารถทำกำไรได้ กรุณาตรวจสอบค่าธรรมเนียม (GP)",
    });
  }

  if (costPrice > 0 && adsCost > costPrice) {
    insights.push({
      severity: "danger",
      title: `งบโฆษณาต่อชิ้น (฿${formatCurrency(adsCost)}) สูงกว่าต้นทุนสินค้า (฿${formatCurrency(costPrice)})`,
      detail:
        "งบโฆษณาต่อชิ้นสูงกว่าต้นทุนตัวสินค้าแล้ว เสี่ยงกำไรหายทันทีหากค่าแอดผันผวน แนะนำจัดเซตขายพ่วง (Bundle) เพื่อเพิ่มยอดต่อบิลและกดค่าแอดเฉลี่ยต่อชิ้นลง",
    });
  }

  if (
    baseMetrics.platformFeeBaht > 0 &&
    baseMetrics.platformFeeBaht > Math.max(0, baseMetrics.netProfitPerUnit)
  ) {
    insights.push({
      severity: "warning",
      title: `ค่า GP แพลตฟอร์ม (฿${formatCurrency(baseMetrics.platformFeeBaht)}) สูงกว่ากำไรสุทธิของคุณ`,
      detail:
        "แพลตฟอร์มได้ส่วนแบ่งต่อชิ้นมากกว่ากำไรที่คุณได้รับ ควรพิจารณาดันยอดขายช่องทางขายตรงหรือจัดเซตสินค้าเพื่อเพิ่มยอดต่อบิล",
    });
  }

  if (
    baseMetrics.netMarginPercent > 0 &&
    baseMetrics.netMarginPercent < 15
  ) {
    insights.push({
      severity: "warning",
      title: `กำไรสุทธิบางเสี่ยงเข้าเนื้อ (${formatCurrency(baseMetrics.netMarginPercent, 1)}%)`,
      detail:
        "กำไรสุทธิต่ำกว่า 15% ถือว่าบางมาก หากลูกค้ากดใช้โค้ดส่วนลดร้านค้าหรือมีพัสดุตีกลับเพียงไม่กี่ออเดอร์ ภาพรวมทั้งเดือนอาจขาดทุนทันที",
    });
  }

  if (returnLossMultiplier !== null && returnLossMultiplier >= 4) {
    insights.push({
      severity: "warning",
      title: `ความเสี่ยงพัสดุตีกลับสูง (ต้องขายเพิ่ม ${returnLossMultiplier} ชิ้นต่อการตีกลับ 1 ชิ้น)`,
      detail:
        "อัตราต้นทุนที่สูญเสียต่อการตีกลับค่อนข้างสูง แนะนำเพิ่มความเข้มงวดในการคัดกรองออเดอร์เก็บเงินปลายทาง (COD) และมาตรฐานการแพ็กสินค้า",
    });
  }

  if (baseMetrics.netMarginPercent >= 30 && maxSafeDiscountPercent >= 20) {
    insights.push({
      severity: "healthy",
      title: `โครงสร้างกำไรแข็งแรงมาก (Net Margin ${formatCurrency(baseMetrics.netMarginPercent, 1)}%)`,
      detail:
        "โครงสร้างกำไรแข็งแรงมาก สามารถจัดโปรโมชันลดราคา 10%–15% ช่วงแคมเปญเลขเบิ้ลเพื่อดึงยอดขายได้โดยไม่เข้าเนื้อ",
    });
  } else if (
    baseMetrics.netMarginPercent >= 15 &&
    insights.length < 3
  ) {
    insights.push({
      severity: "healthy",
      title: `โครงสร้างกำไรอยู่ในเกณฑ์สมดุล (Net Margin ${formatCurrency(baseMetrics.netMarginPercent, 1)}%)`,
      detail: `มีกันชนส่วนลดปลอดภัยสูงสุด ${formatCurrency(maxSafeDiscountPercent, 1)}% และสามารถเพิ่มงบโฆษณาได้อีก +฿${formatCurrency(maxSafeAdditionalAds)}/ชิ้นก่อนชนจุดคุ้มทุน`,
    });
  }

  if (
    fixedCost > 0 &&
    baseMetrics.breakEvenUnits !== null &&
    insights.length < 4
  ) {
    if (baseMetrics.breakEvenUnits > 300) {
      insights.push({
        severity: "warning",
        title: `จุดคุ้มทุนรายเดือนสูง (${baseMetrics.breakEvenUnits.toLocaleString("th-TH")} ชิ้น/เดือน)`,
        detail: `ด้วยต้นทุนคงที่ ฿${formatCurrency(fixedCost, 0)} ต้องทำยอดขายเฉลี่ยวันละ ${Math.ceil(baseMetrics.breakEvenUnits / 30).toLocaleString("th-TH")} ชิ้นจึงจะคุ้มทุน ควรเพิ่มกำไรต่อชิ้นเพื่อลดแรงกดดันด้านยอดขาย`,
      });
    } else {
      insights.push({
        severity: "healthy",
        title: `จุดคุ้มทุนอยู่ในระดับจัดการได้ (${baseMetrics.breakEvenUnits.toLocaleString("th-TH")} ชิ้น/เดือน)`,
        detail: `ขายเฉลี่ยเพียงวันละ ${Math.max(1, Math.ceil(baseMetrics.breakEvenUnits / 30)).toLocaleString("th-TH")} ชิ้นก็ครอบคลุมต้นทุนคงที่ ฿${formatCurrency(fixedCost, 0)} แล้ว`,
      });
    }
  }

  return {
    isIncompleteData: false,
    hasZeroProductCostWarning,
    healthScore,
    healthGrade,
    healthGradeLabel,
    healthBreakdown,
    discountCurve,
    volumeProjections,
    targetPrices,
    minBreakEvenSellingPrice,
    maxSafeAdditionalAds,
    maxSafeTotalAds,
    breakEvenRoas,
    maxSafeDiscountPercent,
    returnLossMultiplier,
    actionableFix,
    healthLevel,
    insights: insights.slice(0, 4),
  };
}
