import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * สร้าง Supabase Client สำหรับทำงานฝั่ง Server (Server Components / Route Handlers)
 * โดยเชื่อมกับ Cookie Store ของ Next.js เพื่อตรวจสอบ Session จาก Backend โดยตรง
 */
export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // ใน Server Component แบบ read-only อาจไม่สามารถแก้ไข cookie ได้
          // ซึ่ง Middleware จะทำหน้าที่รีเฟรช token ให้อยู่แล้ว
        }
      },
    },
  });
}
