import type {
  CalculationMetrics,
  CalculatorInputValues,
  EcommerceCalculationRecord,
  PlatformPreset,
  PromoSimulationResult,
} from "@/types";

export const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "Shopee", label: "Shopee 13%", badge: "Marketplace", feePercent: 13 },
  { id: "TikTok Shop", label: "TikTok Shop 12%", badge: "Social Commerce", feePercent: 12 },
  { id: "Lazada", label: "Lazada 12%", badge: "Marketplace", feePercent: 12 },
  { id: "ขายตรง", label: "ขายตรง 0%", badge: "Direct / Chat", feePercent: 0 },
];

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

export function buildCsvExportContent(
  records: EcommerceCalculationRecord[],
  fallbackInput: CalculatorInputValues
): string {
  const rows =
    records.length > 0
      ? records.map((r) => ({
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
      : [
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
        ];

  const headers = [
    "ชื่อสินค้า",
    "แพลตฟอร์ม",
    "ต้นทุนสินค้า (บาท)",
    "ค่าแพ็ก (บาท)",
    "ค่าแอด (บาท)",
    "ค่าธรรมเนียม (%)",
    "ค่าธรรมเนียม (บาท)",
    "ต้นทุนรวมต่อชิ้น (บาท)",
    "ราคาขาย (บาท)",
    "กำไรสุทธิต่อชิ้น (บาท)",
    "Net Margin (%)",
    "ต้นทุนคงที่รวม (บาท)",
    "จุดคุ้มทุน (ชิ้น)",
    "วันที่บันทึก",
  ];

  const escapeCell = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`;

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

      return [
        escapeCell(row.productName),
        escapeCell(row.platform),
        row.costPrice.toFixed(2),
        row.packagingCost.toFixed(2),
        row.adsCost.toFixed(2),
        row.platformFeePercent.toFixed(2),
        m.platformFeeBaht.toFixed(2),
        m.totalCostPerUnit.toFixed(2),
        row.sellingPrice.toFixed(2),
        m.netProfitPerUnit.toFixed(2),
        m.netMarginPercent.toFixed(2),
        row.fixedCost.toFixed(2),
        escapeCell(m.breakEvenUnits !== null ? m.breakEvenUnits : "ไม่สามารถคืนทุนได้"),
        escapeCell(row.createdAt),
      ].join(",");
    }),
  ];

  return "\uFEFF" + lines.join("\r\n");
}
