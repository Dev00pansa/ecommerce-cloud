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
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  ) {
    return "อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (
    msg.includes("password should be at least") ||
    msg.includes("weak_password")
  ) {
    return "รหัสผ่านสั้นเกินไป กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร";
  }
  if (
    msg.includes("unable to validate email") ||
    msg.includes("invalid email")
  ) {
    return "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  }
  if (msg.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (หรือปิด Confirm email ในหน้า Supabase Authentication)";
  }
  if (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "ไม่สามารถเชื่อมต่อ Supabase Cloud ได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือค่า URL";
  }
  if (msg.includes("row-level security")) {
    return "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (RLS Policy)";
  }

  return `เกิดข้อผิดพลาด: ${rawMessage}`;
}
