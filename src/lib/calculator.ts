import type {
  CalculationMetrics,
  CalculatorInputValues,
  CsvExportColumnKey,
  CsvExportColumnOption,
  DiscountSensitivityPoint,
  EcommerceCalculationRecord,
  FinancialAnalysisResult,
  PlatformPreset,
  PricingAdvisorInsight,
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

  const maxSafeAdditionalAds = Math.max(0, baseMetrics.netProfitPerUnit);
  const maxSafeTotalAds = Math.max(
    0,
    sellingPrice - baseMetrics.platformFeeBaht - costPrice - packagingCost
  );

  let maxSafeDiscountPercent = 0;
  if (sellingPrice > 0 && feeRate < 1 && baseMetrics.netProfitPerUnit > 0) {
    const breakEvenRatio = nonFeeUnitCost / (sellingPrice * (1 - feeRate));
    const computedDiscount = (1 - breakEvenRatio) * 100;
    if (Number.isFinite(computedDiscount)) {
      maxSafeDiscountPercent = Math.max(0, Math.min(100, computedDiscount));
    }
  }

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
          ? `ควรปรับราคาขายขึ้นเป็นอย่างน้อย ฿${formatCurrency(minBreakEvenSellingPrice)} เพื่อไม่ให้เข้าเนื้อ (หรือตั้งราคาที่ ฿${formatCurrency(targetPrices[1]?.suggestedPrice ?? minBreakEvenSellingPrice)} เพื่อกำไรสุทธิ 30%)`
          : "ค่าธรรมเนียมแพลตฟอร์มสูงถึง 100% ทำให้ไม่สามารถทำกำไรได้ กรุณาตรวจสอบค่าธรรมเนียม (GP)",
    });
  } else if (baseMetrics.netMarginPercent < 15) {
    insights.push({
      severity: "warning",
      title: `อัตรากำไรสุทธิค่อนข้างบาง (${formatCurrency(baseMetrics.netMarginPercent, 1)}%)`,
      detail:
        targetPrices[1]?.suggestedPrice !== null
          ? `หากมีส่วนลดแคมเปญหรือค่าแอดผันผวนอาจขาดทุนได้ทันที แนะนำปรับราคาขายใกล้เคียง ฿${formatCurrency(targetPrices[1].suggestedPrice)} เพื่อเพิ่มกันชนกำไรเป็น 30%`
          : "ควรลดต้นทุนต่อชิ้นหรือลดค่าโฆษณาเพื่อสร้างกันชนกำไรให้ปลอดภัยขึ้น",
    });
  } else {
    insights.push({
      severity: "healthy",
      title: `โครงสร้างกำไรแข็งแรง (Net Margin ${formatCurrency(baseMetrics.netMarginPercent, 1)}%)`,
      detail: `หลังหักต้นทุนและ GP แพลตฟอร์มแล้วยังเหลือกำไรชิ้นละ +฿${formatCurrency(baseMetrics.netProfitPerUnit)} สามารถขยายงบการตลาดหรือจัดโปรโมชันได้อย่างมั่นใจ`,
    });
  }

  if (
    baseMetrics.platformFeeBaht > 0 &&
    baseMetrics.platformFeeBaht > Math.max(0, baseMetrics.netProfitPerUnit)
  ) {
    insights.push({
      severity: "warning",
      title: `ค่า GP แพลตฟอร์ม (฿${formatCurrency(baseMetrics.platformFeeBaht)}) สูงกว่ากำไรสุทธิของคุณ`,
      detail: `ช่องทาง ${input.platform} หักค่าธรรมเนียม ${formatCurrency(platformFeePercent, 1)}% ซึ่งกินสัดส่วนมากกว่ารายได้สุทธิ แนะนำบวกค่า GP ทบเข้าในราคาตั้งขายหรือดึงลูกค้ากลับมาซื้อซ้ำผ่านช่องทางขายตรง 0%`,
    });
  }

  if (costPrice > 0 && adsCost > costPrice) {
    insights.push({
      severity: "warning",
      title: `ค่าโฆษณาต่อชิ้น (฿${formatCurrency(adsCost)}) สูงกว่าต้นทุนสินค้า (฿${formatCurrency(costPrice)})`,
      detail:
        "สัดส่วนค่าแอดกินต้นทุนสูงเกินไป แนะนำทำโปรขายแบบ Bundle (ซื้อ 2–3 ชิ้น) เพื่อเพิ่มยอดต่อออเดอร์และดึงค่าแอดเฉลี่ยต่อชิ้นให้ลดลง",
    });
  }

  if (baseMetrics.netProfitPerUnit > 0) {
    if (maxSafeDiscountPercent < 15) {
      insights.push({
        severity: "warning",
        title: `พื้นที่จัดโปร Flash Sale จำกัด (ลดได้สูงสุด ${formatCurrency(maxSafeDiscountPercent, 1)}%)`,
        detail:
          "หากต้องเข้าร่วมแคมเปญ Double Day ที่บังคับลด 15%–20% แนะนำตั้งราคาป้ายเผื่อส่วนลดไว้ล่วงหน้าเพื่อไม่ให้ขายดีแต่เข้าเนื้อ",
      });
    } else if (maxSafeDiscountPercent >= 25) {
      insights.push({
        severity: "healthy",
        title: `พร้อมลุยแคมเปญส่วนลด (ลดได้สูงสุด ${formatCurrency(maxSafeDiscountPercent, 1)}% โดยไม่ขาดทุน)`,
        detail:
          "สินค้ามีระยะปลอดภัยเพียงพอสำหรับจัดคูปองส่วนลดหรือ Flash Sale 10%–20% เพื่อเร่งยอดขายโดยยังคงมีกำไรสุทธิเหลืออยู่",
      });
    }
  }

  if (fixedCost > 0 && baseMetrics.breakEvenUnits !== null) {
    if (baseMetrics.breakEvenUnits > 300) {
      insights.push({
        severity: "warning",
        title: `จุดคุ้มทุนสูง (${baseMetrics.breakEvenUnits.toLocaleString("th-TH")} ชิ้น/เดือน)`,
        detail: `ด้วยต้นทุนคงที่ ฿${formatCurrency(fixedCost, 0)} ต้องทำยอดขายเฉลี่ยราว ${Math.ceil(baseMetrics.breakEvenUnits / 30).toLocaleString("th-TH")} ชิ้น/วันจึงจะคุ้มทุน แนะนำเพิ่มกำไรต่อชิ้นหรือจัดเซตสินค้าเพื่อลดเป้าจำนวนออเดอร์`,
      });
    } else {
      insights.push({
        severity: "healthy",
        title: `จุดคุ้มทุนอยู่ในเกณฑ์จัดการได้ (${baseMetrics.breakEvenUnits.toLocaleString("th-TH")} ชิ้น/เดือน)`,
        detail: `ขายเฉลี่ยเพียงวันละ ${Math.max(1, Math.ceil(baseMetrics.breakEvenUnits / 30)).toLocaleString("th-TH")} ชิ้นก็ครอบคลุมต้นทุนคงที่ ฿${formatCurrency(fixedCost, 0)} แล้ว ที่เหลือคือกำไรสุทธิเต็มจำนวน`,
      });
    }
  }

  return {
    discountCurve,
    volumeProjections,
    targetPrices,
    minBreakEvenSellingPrice,
    maxSafeAdditionalAds,
    maxSafeTotalAds,
    maxSafeDiscountPercent,
    healthLevel,
    insights,
  };
}
