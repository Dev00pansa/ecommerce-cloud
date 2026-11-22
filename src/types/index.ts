export type ThemeMode = "light" | "dark";

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
  created_at: string;
}
