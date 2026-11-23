import type { PasswordStrengthResult } from "@/types";

const USERNAME_REGEX = /^[A-Za-z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizePlainText(raw: string, maxLength = 120): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validateUsername(raw: string): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const normalized = raw.trim();

  if (!normalized) {
    return { valid: false, normalized, error: "กรุณากรอกชื่อผู้ใช้ (Username)" };
  }
  if (/\s/.test(normalized)) {
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
      error: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ A-Z, a-z ตัวเลข 0-9 และ _ เท่านั้น",
    };
  }

  return { valid: true, normalized, error: null };
}

export function validateEmail(raw: string): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return { valid: false, normalized, error: "กรุณากรอกอีเมล" };
  }
  if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    return { valid: false, normalized, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  }
  return { valid: true, normalized, error: null };
}

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

  if (password.length >= 8 && categoryCount >= 3) {
    return {
      level: "strong",
      score: 3,
      label: "โอเคมาก",
      colorHex: "#10B981",
      hint: "รหัสผ่านแข็งแรง มีความหลากหลายของอักขระครบถ้วน",
    };
  }

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
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("user not found") ||
    msg.includes("invalid_credentials")
  ) {
    return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return "อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (msg.includes("ecommerce_calculations_user_product_name_unique_idx")) {
    return "ชื่อสินค้านี้มีอยู่ในคลาวด์แล้ว กรุณาตั้งชื่อใหม่ไม่ให้ซ้ำกัน";
  }
  if (
    msg.includes("duplicate key") ||
    msg.includes("profiles_username_key") ||
    msg.includes("profiles_username_lower_unique_idx")
  ) {
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
  if (msg.includes("cloud_storage_limit_reached")) {
    return "พื้นที่คลาวด์เต็ม (20/20 รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม";
  }
  if (msg.includes("username_cooldown_active")) {
    return "สามารถเปลี่ยนชื่อผู้ใช้ได้เดือนละ 1 ครั้ง (ทุก 30 วัน) เท่านั้น";
  }
  if (msg.includes("password_cooldown_active")) {
    return "สามารถเปลี่ยนรหัสผ่านได้เดือนละ 1 ครั้ง (ทุก 30 วัน) เท่านั้น";
  }
  if (msg.includes("row-level security")) {
    return "ไม่มีสิทธิ์เข้าถึงข้อมูลส่วนตัวนี้";
  }

  return "ไม่สามารถดำเนินการได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง";
}
