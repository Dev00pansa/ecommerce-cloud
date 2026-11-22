import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type UserProject = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type EcommerceCalculation = {
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
};

export type SupabaseConfigStatus = {
  isConfigured: boolean;
  missingKeys: string[];
  errorMessage: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function validateConfig(url: string, anonKey: string): SupabaseConfigStatus {
  const missingKeys: string[] = [];

  if (!url) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missingKeys.length > 0) {
    return {
      isConfigured: false,
      missingKeys,
      errorMessage: `ไม่พบค่า Environment Variables: ${missingKeys.join(", ")}`,
    };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isConfigured: false,
        missingKeys: ["NEXT_PUBLIC_SUPABASE_URL"],
        errorMessage: "ค่า NEXT_PUBLIC_SUPABASE_URL ต้องขึ้นต้นด้วย http:// หรือ https://",
      };
    }
  } catch {
    return {
      isConfigured: false,
      missingKeys: ["NEXT_PUBLIC_SUPABASE_URL"],
      errorMessage: "รูปแบบ NEXT_PUBLIC_SUPABASE_URL ไม่ถูกต้อง",
    };
  }

  return {
    isConfigured: true,
    missingKeys: [],
    errorMessage: null,
  };
}

export const supabaseConfigStatus = validateConfig(supabaseUrl, supabaseAnonKey);

export const supabase: SupabaseClient | null = supabaseConfigStatus.isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
