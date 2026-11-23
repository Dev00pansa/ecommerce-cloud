import type { AppLanguage, PasswordStrengthResult } from "@/types";

const USERNAME_REGEX = /^[A-Za-z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizePlainText(raw: string, maxLength = 120): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validateUsername(
  raw: string,
  language: AppLanguage = "th"
): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const isEn = language === "en";
  const normalized = raw.trim();

  if (!normalized) {
    return {
      valid: false,
      normalized,
      error: isEn
        ? "Please enter a username."
        : "กรุณากรอกชื่อผู้ใช้ (Username)",
    };
  }
  if (/\s/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: isEn
        ? "Username cannot contain spaces."
        : "ชื่อผู้ใช้ห้ามมีช่องว่าง",
    };
  }
  if (normalized.length < 4 || normalized.length > 20) {
    return {
      valid: false,
      normalized,
      error: isEn
        ? "Username must be 4–20 characters long."
        : "ชื่อผู้ใช้ต้องมีความยาว 4–20 ตัวอักษร",
    };
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: isEn
        ? "Username may only contain letters A-Z, a-z, digits 0-9, and underscore (_)."
        : "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ A-Z, a-z ตัวเลข 0-9 และ _ เท่านั้น",
    };
  }

  return { valid: true, normalized, error: null };
}

export function validateEmail(
  raw: string,
  language: AppLanguage = "th"
): {
  valid: boolean;
  normalized: string;
  error: string | null;
} {
  const isEn = language === "en";
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return {
      valid: false,
      normalized,
      error: isEn ? "Please enter an email address." : "กรุณากรอกอีเมล",
    };
  }
  if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: isEn ? "Invalid email format." : "รูปแบบอีเมลไม่ถูกต้อง",
    };
  }
  return { valid: true, normalized, error: null };
}

export function evaluatePasswordStrength(
  password: string,
  language: AppLanguage = "th"
): PasswordStrengthResult {
  const isEn = language === "en";
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
      label: isEn ? "Strong" : "โอเคมาก",
      colorHex: "#10B981",
      hint: isEn
        ? "Strong password with solid character variety."
        : "รหัสผ่านแข็งแรง มีความหลากหลายของอักขระครบถ้วน",
    };
  }

  if (password.length >= 6 && categoryCount >= 2) {
    const missing: string[] = [];
    if (password.length < 8) {
      missing.push(isEn ? "8+ characters" : "เพิ่มความยาวเป็น 8 ตัวขึ้นไป");
    }
    if (!hasUpper) {
      missing.push(isEn ? "an uppercase letter (A-Z)" : "ตัวพิมพ์ใหญ่ (A-Z)");
    }
    if (!hasSymbol) {
      missing.push(isEn ? "a symbol (!@#$)" : "อักขระพิเศษ (!@#$)");
    }

    return {
      level: "medium",
      score: 2,
      label: isEn ? "Fair" : "พอได้แต่ไม่ดี",
      colorHex: "#F59E0B",
      hint:
        missing.length > 0
          ? isEn
            ? `Try adding ${missing.slice(0, 2).join(" and ")}.`
            : `แนะนำให้เพิ่ม ${missing.slice(0, 2).join(" และ ")}`
          : isEn
            ? "Add one more character type for stronger protection."
            : "เพิ่มความหลากหลายอีก 1 รูปแบบเพื่อให้ปลอดภัยระดับสูงสุด",
    };
  }

  const weakHints: string[] = [];
  if (password.length < 6) {
    weakHints.push(isEn ? "use at least 6–8 characters" : "ตั้งให้ยาวอย่างน้อย 6–8 ตัวอักษร");
  }
  if (categoryCount < 2) {
    weakHints.push(
      isEn ? "mix letters with numbers or symbols" : "ผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์"
    );
  }

  return {
    level: "weak",
    score: 1,
    label: isEn ? "Weak" : "ไม่ปลอดภัย",
    colorHex: "#EF4444",
    hint:
      weakHints.length > 0
        ? isEn
          ? `Please ${weakHints.join(" and ")}.`
          : `ควร${weakHints.join(" และ")}`
        : isEn
          ? "This password is too easy to guess."
          : "รหัสผ่านคาดเดาง่ายเกินไป",
  };
}

export function translateSupabaseError(
  error: unknown,
  language: AppLanguage = "th"
): string {
  const isEn = language === "en";
  const rawMessage =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "";

  const msg = rawMessage.toLowerCase();

  if (!msg) {
    return isEn
      ? "An unknown error occurred. Please try again."
      : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง";
  }
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("user not found") ||
    msg.includes("invalid_credentials")
  ) {
    return isEn
      ? "Invalid username or password."
      : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return isEn
      ? "This email is already registered. Please sign in instead."
      : "อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (msg.includes("ecommerce_calculations_user_product_name_unique_idx")) {
    return isEn
      ? "This product name already exists in Cloud Storage. Please use a unique name."
      : "ชื่อสินค้านี้มีอยู่ในคลาวด์แล้ว กรุณาตั้งชื่อใหม่ไม่ให้ซ้ำกัน";
  }
  if (
    msg.includes("duplicate key") ||
    msg.includes("profiles_username_key") ||
    msg.includes("profiles_username_lower_unique_idx")
  ) {
    return isEn
      ? "This username is already taken. Please choose another."
      : "ชื่อผู้ใช้ (Username) นี้มีคนใช้แล้ว กรุณาเลือกชื่ออื่น";
  }
  if (
    msg.includes("password should be at least") ||
    msg.includes("weak_password")
  ) {
    return isEn
      ? "Password must be at least 6 characters long."
      : "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
  }
  if (msg.includes("unable to validate email") || msg.includes("invalid email")) {
    return isEn ? "Invalid email format." : "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (msg.includes("email not confirmed")) {
    return isEn
      ? "This email address has not been confirmed yet."
      : "บัญชีนี้ยังไม่ได้ยืนยันอีเมล กรุณาตรวจสอบการตั้งค่า Auth";
  }
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return isEn
      ? "Too many requests. Please wait a moment and try again."
      : "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return isEn
      ? "Unable to connect to Cloud service. Please check your internet connection."
      : "ไม่สามารถเชื่อมต่อระบบ Cloud ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  }
  if (msg.includes("cloud_storage_limit_reached")) {
    return isEn
      ? "Cloud Storage is full (20/20 items). Please delete older records before saving more."
      : "พื้นที่คลาวด์เต็ม (20/20 รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม";
  }
  if (msg.includes("username_cooldown_active")) {
    return isEn
      ? "Username can only be changed once every 30 days."
      : "สามารถเปลี่ยนชื่อผู้ใช้ได้เดือนละ 1 ครั้ง (ทุก 30 วัน) เท่านั้น";
  }
  if (msg.includes("password_cooldown_active")) {
    return isEn
      ? "Password can only be changed once every 30 days."
      : "สามารถเปลี่ยนรหัสผ่านได้เดือนละ 1 ครั้ง (ทุก 30 วัน) เท่านั้น";
  }
  if (msg.includes("row-level security")) {
    return isEn
      ? "You do not have permission to access this private resource."
      : "ไม่มีสิทธิ์เข้าถึงข้อมูลส่วนตัวนี้";
  }

  return isEn
    ? "Action could not be completed. Please verify your inputs and try again."
    : "ไม่สามารถดำเนินการได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง";
}
