import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export interface SupabaseEnvStatus {
  isConfigured: boolean;
  missingKeys: string[];
  errorMessage: string | null;
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const missingKeys: string[] = [];

  if (!supabaseUrl) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missingKeys.length > 0) {
    return {
      isConfigured: false,
      missingKeys,
      errorMessage: `ไม่พบค่า Environment Variables: ${missingKeys.join(", ")}`,
    };
  }

  try {
    const parsed = new URL(supabaseUrl);
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

  return { isConfigured: true, missingKeys: [], errorMessage: null };
}

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const status = getSupabaseEnvStatus();
  if (!status.isConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
