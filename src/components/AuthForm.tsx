"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const AUTH_BACKGROUND_IMAGES: readonly string[] = [
  "/images/auth/bg-1.jpg",
  "/images/auth/bg-2.jpg",
  "/images/auth/bg-3.jpg",
  "/images/auth/bg-4.jpg",
  "/images/auth/bg-5.jpg",
];

export function AuthForm() {
  const router = useRouter();
  const envStatus = getSupabaseEnvStatus();

  const [activeTab, setActiveTab] = useState<AuthTabMode>("login");
  const [activeBgIndex, setActiveBgIndex] = useState<number>(0);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % AUTH_BACKGROUND_IMAGES.length);
    }, 5500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
      return true;
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

  const inputClass =
    "border-zinc-800 bg-black/90 text-zinc-100 placeholder-zinc-500 transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25";
  const mutedText = "text-zinc-400";

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
      >
        {AUTH_BACKGROUND_IMAGES.map((src, idx) => {
          const isActive = idx === activeBgIndex;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading={idx === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ease-in-out will-change-[opacity,transform] ${
                isActive ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          );
        })}

        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.88)_100%)]" />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md overflow-hidden rounded-xl border border-emerald-500/45 bg-black/85 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_-8px_rgba(16,185,129,0.35),inset_0_1px_0_0_rgba(52,211,153,0.25)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent"
        />

        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 mb-3">
            <Lock className="h-3 w-3" />
            <span>KhumLab Cloud Account</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
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

        <div className="grid grid-cols-2 rounded-lg border border-zinc-800/90 bg-black/90 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "login"
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
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
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
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
            className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs sm:text-sm text-rose-400"
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
                  placeholder="เช่น user_01 หรือ you@example.com"
                  disabled={submitting}
                  className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
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
                  className={`w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-60"
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
                  placeholder="เช่น seller_01 (a-z, 0-9, _)"
                  disabled={submitting}
                  className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm font-mono focus:outline-none disabled:opacity-60 ${inputClass}`}
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
                  placeholder="เช่น you@example.com"
                  disabled={submitting}
                  className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
                />
              </div>
            </div>

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
                  className={`w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
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
                  className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-60"
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
    </>
  );
}
