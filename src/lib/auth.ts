import type { PasswordStrengthResult } from "@/types";

const USERNAME_REGEX = /^[a-z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ตรวจสอบรูปแบบชื่อผู้ใช้ (Username): อนุญาตเฉพาะ a-z, 0-9, _ ยาว 4-20 ตัวอักษร
 */
export function validateUsername(raw: string): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const normalized = raw.trim().toLowerCase();

  if (!normalized) {
    return { valid: false, normalized, error: "กรุณากรอกชื่อผู้ใช้ (Username)" };
  }
  if (/\s/.test(raw.trim())) {
    return {
      valid: false,
      normalized,
      error: "ชื่อผู้ใช้ห้ามมีช่องว่าง",
    };
  }
  if (normalized.length < 4 || normalized.length > 20) {
    return {
      valid: false,
      normalized,
      error: "ชื่อผู้ใช้ต้องมีความยาว 4–20 ตัวอักษร",
    };
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ a-z ตัวเลข 0-9 และ _ เท่านั้น",
    };
  }

  return { valid: true, normalized, error: null };
}

/**
 * ตรวจสอบรูปแบบอีเมลให้ถูกต้อง
 */
export function validateEmail(raw: string): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return { valid: false, normalized, error: "กรุณากรอกอีเมล" };
  }
  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, normalized, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  }
  return { valid: true, normalized, error: null };
}

/**
 * ประเมินระดับความปลอดภัยของรหัสผ่านแบบเรียลไทม์ 3 ระดับ
 * - แดง (#EF4444): ไม่ปลอดภัย (สั้นกว่า 6 ตัว หรือใช้ตัวอักษร/ตัวเลขแบบเดียว)
 * - เหลือง (#F59E0B): พอได้แต่ไม่ดี (ยาว 6+ และผสม 2 รูปแบบ)
 * - เขียว (#10B981): โอเคมาก (ยาว 8+ และผสม 3 รูปแบบขึ้นไป)
 */
export function evaluatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const categoryCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
    Boolean
  ).length;

  // โอเคมาก: ยาว >= 8 และผสมอย่างน้อย 3 รูปแบบ
  if (password.length >= 8 && categoryCount >= 3) {
    return {
      level: "strong",
      score: 3,
      label: "โอเคมาก",
      colorHex: "#10B981",
      hint: "รหัสผ่านแข็งแรง มีความหลากหลายของอักขระครบถ้วน",
    };
  }

  // พอได้แต่ไม่ดี: ยาว >= 6 และผสมอย่างน้อย 2 รูปแบบ
  if (password.length >= 6 && categoryCount >= 2) {
    const missing: string[] = [];
    if (password.length < 8) missing.push("เพิ่มความยาวเป็น 8 ตัวขึ้นไป");
    if (!hasUpper) missing.push("ตัวพิมพ์ใหญ่ (A-Z)");
    if (!hasSymbol) missing.push("อักขระพิเศษ (!@#$)");

    return {
      level: "medium",
      score: 2,
      label: "พอได้แต่ไม่ดี",
      colorHex: "#F59E0B",
      hint:
        missing.length > 0
          ? `แนะนำให้เพิ่ม ${missing.slice(0, 2).join(" และ ")}`
          : "เพิ่มความหลากหลายอีก 1 รูปแบบเพื่อให้ปลอดภัยระดับสูงสุด",
    };
  }

  // ไม่ปลอดภัย: สั้นกว่า 6 ตัว หรือมีแค่รูปแบบเดียว
  const weakHints: string[] = [];
  if (password.length < 6) weakHints.push("ตั้งให้ยาวอย่างน้อย 6–8 ตัวอักษร");
  if (categoryCount < 2) weakHints.push("ผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์");

  return {
    level: "weak",
    score: 1,
    label: "ไม่ปลอดภัย",
    colorHex: "#EF4444",
    hint:
      weakHints.length > 0
        ? `ควร${weakHints.join(" และ")}`
        : "รหัสผ่านคาดเดาง่ายเกินไป",
  };
}

/**
 * แปลข้อความ Error จาก Supabase Auth / Database เป็นภาษาไทยที่อ่านเข้าใจง่าย
 */
export function translateSupabaseError(error: unknown): string {
  const rawMessage =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "";

  const msg = rawMessage.toLowerCase();

  if (!msg) {
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง";
  }
  if (msg.includes("invalid login credentials")) {
    return "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return "อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (msg.includes("duplicate key") || msg.includes("profiles_username_key")) {
    return "ชื่อผู้ใช้ (Username) นี้มีคนใช้แล้ว กรุณาเลือกชื่ออื่น";
  }
  if (
    msg.includes("password should be at least") ||
    msg.includes("weak_password")
  ) {
    return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
  }
  if (msg.includes("unable to validate email") || msg.includes("invalid email")) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (msg.includes("email not confirmed")) {
    return "บัญชีนี้ยังไม่ได้ยืนยันอีเมล กรุณาตรวจสอบการตั้งค่า Auth";
  }
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "ไม่สามารถเชื่อมต่อระบบ Cloud ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  }
  if (msg.includes("row-level security")) {
    return "ไม่มีสิทธิ์เข้าถึงข้อมูลส่วนตัวนี้";
  }

  return `เกิดข้อผิดพลาด: ${rawMessage}`;
}
