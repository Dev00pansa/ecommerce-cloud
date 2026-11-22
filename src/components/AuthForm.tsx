"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { createClient, getSupabaseEnvStatus } from "@/lib/supabase/client";
import {
  translateSupabaseError,
  validateEmail,
  validateUsername,
} from "@/lib/auth";
import type { AuthTabMode } from "@/types";
import { useTheme } from "@/components/ThemeProvider";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

/**
 * ฟอร์มเข้าสู่ระบบ (Login) และสมัครสมาชิก (Register) สำหรับหน้า /login
 * ค่าเริ่มต้นจะเปิดที่แท็บ "เข้าสู่ระบบ" เสมอ
 */
export function AuthForm() {
  const { isDark } = useTheme();
  const router = useRouter();
  const envStatus = getSupabaseEnvStatus();

  const [activeTab, setActiveTab] = useState<AuthTabMode>("login");

  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [usernameFeedback, setUsernameFeedback] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function switchTab(nextTab: AuthTabMode) {
    setActiveTab(nextTab);
    setErrorMessage(null);
  }

  async function verifyUsernameAvailability(rawUsername: string): Promise<boolean> {
    const check = validateUsername(rawUsername);
    if (!check.valid) {
      setUsernameStatus("invalid");
      setUsernameFeedback(check.error);
      return false;
    }

    const supabase = createClient();
    if (!supabase) {
      return false;
    }

    setUsernameStatus("checking");
    setUsernameFeedback("กำลังตรวจสอบชื่อผู้ใช้...");

    const { data, error } = await supabase.rpc("check_username_available", {
      p_username: check.normalized,
    });

    if (error) {
      setUsernameStatus("idle");
      setUsernameFeedback(null);
      return true; // ปล่อยให้ขั้นตอนสมัครเช็กซ้ำอีกครั้งหาก RPC ขัดข้องชั่วคราว
    }

    if (data === true) {
      setUsernameStatus("available");
      setUsernameFeedback("ชื่อผู้ใช้นี้สามารถใช้งานได้");
      return true;
    }

    setUsernameStatus("taken");
    setUsernameFeedback("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น");
    return false;
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setErrorMessage(null);
    const identifier = loginIdentifier.trim().toLowerCase();

    if (!identifier) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้ (Username) หรืออีเมล");
      return;
    }
    if (!loginPassword) {
      setErrorMessage("กรุณากรอกรหัสผ่าน");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErrorMessage(envStatus.errorMessage ?? "ยังไม่ได้ตั้งค่าระบบ Cloud");
      return;
    }

    setSubmitting(true);

    try {
      // แปลง Username เป็น Email ผ่าน SECURITY DEFINER RPC ก่อนเข้าสู่ระบบ
      const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
        "get_email_for_login",
        { p_identifier: identifier }
      );

      if (rpcError) {
        setErrorMessage(translateSupabaseError(rpcError));
        return;
      }

      if (!resolvedEmail || typeof resolvedEmail !== "string") {
        setErrorMessage("ไม่พบบัญชีผู้ใช้หรือชื่อผู้ใช้นี้ในระบบ");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: loginPassword,
      });

      if (signInError) {
        setErrorMessage(translateSupabaseError(signInError));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMessage(translateSupabaseError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setErrorMessage(null);

    const usernameCheck = validateUsername(username);
    if (!usernameCheck.valid) {
      setErrorMessage(usernameCheck.error);
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.error);
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErrorMessage(envStatus.errorMessage ?? "ยังไม่ได้ตั้งค่าระบบ Cloud");
      return;
    }

    setSubmitting(true);

    try {
      // ตรวจสอบชื่อผู้ใช้ซ้ำอีกครั้งก่อนสร้างบัญชีจริง
      const available = await verifyUsernameAvailability(usernameCheck.normalized);
      if (!available) {
        setErrorMessage("ชื่อผู้ใช้ (Username) นี้มีคนใช้แล้ว กรุณาเปลี่ยนชื่อใหม่");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailCheck.normalized,
        password: registerPassword,
        options: {
          data: {
            username: usernameCheck.normalized,
          },
        },
      });

      if (signUpError) {
        setErrorMessage(translateSupabaseError(signUpError));
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setErrorMessage("อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน");
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // กรณีโปรเจกต์เปิด confirm email อยู่ ให้ล็อกอินหรือแจ้งชัดเจน
        setErrorMessage(
          "สร้างบัญชีสำเร็จ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้หรืออีเมลที่สมัครไว้"
        );
        setActiveTab("login");
      }
    } catch (err) {
      setErrorMessage(translateSupabaseError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white shadow-sm";
  const inputClass = isDark
    ? "border-zinc-800 bg-[#000000] text-zinc-100 placeholder-zinc-600 focus:border-emerald-500"
    : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-600";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";

  return (
    <div className={`mx-auto w-full max-w-md rounded-xl border p-6 sm:p-8 ${cardClass}`}>
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 mb-3">
          <Lock className="h-3 w-3" />
          <span>KhumLab Cloud Account</span>
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {activeTab === "login"
            ? "เข้าสู่ระบบ KhumLab"
            : "สร้างบัญชีผู้ใช้งานใหม่"}
        </h1>
        <p className={`mt-1 text-xs sm:text-sm ${mutedText}`}>
          {activeTab === "login"
            ? "ใช้ Username หรือ Email ที่สมัครไว้เพื่อเข้าสู่ Dashboard"
            : "สมัครสมาชิกแล้วเข้าใช้งานเครื่องมือคำนวณและบันทึก Cloud ได้ทันที"}
        </p>
      </div>

      {/* แท็บสลับ เข้าสู่ระบบ / สมัครสมาชิก */}
      <div
        className={`grid grid-cols-2 rounded-lg border p-1 mb-6 ${
          isDark
            ? "border-zinc-800 bg-[#000000]"
            : "border-slate-200 bg-slate-100"
        }`}
      >
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "login"
              ? "bg-emerald-500 text-slate-950"
              : mutedText
          }`}
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>เข้าสู่ระบบ</span>
        </button>
        <button
          type="button"
          onClick={() => switchTab("register")}
          className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "register"
              ? "bg-emerald-500 text-slate-950"
              : mutedText
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>สมัครสมาชิก</span>
        </button>
      </div>

      {!envStatus.isConfigured && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-500"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{envStatus.errorMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className={`mb-4 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm ${
            isDark
              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {activeTab === "login" ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-identifier"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              ชื่อผู้ใช้ หรือ อีเมล (Username / Email)
            </label>
            <div className="relative">
              <UserIcon
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="เช่น pansa_dev หรือ you@example.com"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="login-password"
                type={showLoginPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((prev) => !prev)}
                aria-label={showLoginPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded ${mutedText}`}
              >
                {showLoginPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>{submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* 1. Username */}
          <div>
            <label
              htmlFor="register-username"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              ชื่อผู้ใช้ (Username)
            </label>
            <div className="relative">
              <UserIcon
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameStatus("idle");
                  setUsernameFeedback(null);
                }}
                onBlur={() => {
                  if (username.trim()) {
                    void verifyUsernameAvailability(username);
                  }
                }}
                placeholder="a-z, 0-9, _ ความยาว 4–20 ตัว"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
            </div>
            {usernameFeedback && (
              <p
                className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${
                  usernameStatus === "available"
                    ? "text-emerald-500"
                    : usernameStatus === "checking"
                      ? mutedText
                      : "text-rose-500"
                }`}
              >
                {usernameStatus === "available" && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                )}
                {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{usernameFeedback}</span>
              </p>
            )}
          </div>

          {/* 2. Email */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              อีเมล (สำหรับติดต่อและอ้างอิงบัญชี)
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
            </div>
          </div>

          {/* 3. Password + PasswordStrengthMeter */}
          <div>
            <label
              htmlFor="register-password"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="register-password"
                type={showRegisterPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="ตั้งรหัสผ่านของคุณ"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((prev) => !prev)}
                aria-label={
                  showRegisterPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                }
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded ${mutedText}`}
              >
                {showRegisterPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordStrengthMeter password={registerPassword} />
          </div>

          {/* 4. Confirm Password */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="block text-xs sm:text-sm font-medium mb-1.5"
            >
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`}
              />
              <input
                id="register-confirm-password"
                type={showRegisterPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="พิมพ์รหัสผ่านอีกครั้งให้ตรงกัน"
                disabled={submitting}
                className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputClass}`}
              />
            </div>
            {confirmPassword && confirmPassword !== registerPassword && (
              <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                รหัสผ่านยังไม่ตรงกัน
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>
              {submitting ? "กำลังสร้างบัญชี..." : "สมัครสมาชิกและเริ่มใช้งาน"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
