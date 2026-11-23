export type ThemeMode = "light" | "dark";

export type AppLanguage = "th" | "en";

export type AuthTabMode = "login" | "register";

export type PasswordStrengthLevel = "weak" | "medium" | "strong";

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: 1 | 2 | 3;
  label: string;
  colorHex: string;
  hint: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  username_updated_at?: string | null;
  password_updated_at?: string | null;
  created_at: string;
}

export interface PlatformPreset {
  id: string;
  label: string;
  badge: string;
  feePercent: number;
}

export interface CalculatorInputValues {
  productName: string;
  platform: string;
  costPrice: number;
  packagingCost: number;
  adsCost: number;
  platformFeePercent: number;
  sellingPrice: number;
  fixedCost: number;
}

export interface CalculatorFormStrings {
  productName: string;
  platform: string;
  costPrice: string;
  packagingCost: string;
  adsCost: string;
  platformFeePercent: string;
  sellingPrice: string;
  fixedCost: string;
}

export interface CalculationMetrics {
  platformFeeBaht: number;
  totalCostPerUnit: number;
  netProfitPerUnit: number;
  netMarginPercent: number;
  canBreakEven: boolean;
  breakEvenUnits: number | null;
  breakEvenRevenue: number | null;
  packAndAdsCost: number;
  productCostShare: number;
  packAdsShare: number;
  feeShare: number;
  profitShare: number;
}

export interface PromoSimulationResult {
  discountPercent: number;
  discountedPrice: number;
  discountedPlatformFeeBaht: number;
  discountedTotalCostPerUnit: number;
  discountedProfitPerUnit: number;
  discountedMarginPercent: number;
  discountedBreakEvenUnits: number | null;
  baselineUnits: number;
  baselineTotalProfit: number;
  requiredUnitsForSameProfit: number | null;
  volumeMultiplier: number | null;
}

export interface EcommerceCalculationRecord {
  id: string;
  user_id: string;
  product_name: string;
  platform: string;
  cost_price: number;
  packaging_cost: number;
  ads_cost: number;
  platform_fee_percent: number;
  selling_price: number;
  fixed_cost: number;
  product_image_url?: string | null;
  created_at: string;
}

export interface CompressedProductImage {
  blob: Blob;
  previewUrl: string;
  sizeBytes: number;
  mimeType: "image/webp" | "image/jpeg";
  extension: "webp" | "jpg";
}

export type CsvExportColumnKey =
  | "product_name"
  | "platform"
  | "cost_price"
  | "packaging_cost"
  | "ads_cost"
  | "platform_fee_percent"
  | "platform_fee_baht"
  | "total_cost_per_unit"
  | "selling_price"
  | "net_profit_per_unit"
  | "net_margin_percent"
  | "fixed_cost"
  | "break_even_units"
  | "created_at";

export interface CsvExportColumnOption {
  key: CsvExportColumnKey;
  label: string;
  defaultSelected: boolean;
}

export type HistorySortOrder =
  | "date_desc"
  | "date_asc"
  | "profit_desc"
  | "profit_asc";

export interface DiscountSensitivityPoint {
  discountPercent: number;
  discountedPrice: number;
  profitPerUnit: number;
  marginPercent: number;
  isProfitable: boolean;
}

export interface VolumeProjectionPoint {
  units: number;
  revenue: number;
  grossProfit: number;
  netTotalProfit: number;
  isProfitable: boolean;
}

export interface TargetPriceRecommendation {
  targetMarginPercent: number;
  tierLabel: string;
  tierSubtitle: string;
  recommended: boolean;
  suggestedPrice: number | null;
  estimatedProfitPerUnit: number | null;
  feasible: boolean;
}

export interface PricingAdvisorInsight {
  severity: "healthy" | "warning" | "danger";
  title: string;
  detail: string;
}

export interface FinancialAnalysisResult {
  discountCurve: DiscountSensitivityPoint[];
  volumeProjections: VolumeProjectionPoint[];
  targetPrices: TargetPriceRecommendation[];
  minBreakEvenSellingPrice: number | null;
  maxSafeAdditionalAds: number;
  maxSafeTotalAds: number;
  maxSafeDiscountPercent: number;
  healthLevel: "excellent" | "good" | "thin" | "loss";
  insights: PricingAdvisorInsight[];
}
