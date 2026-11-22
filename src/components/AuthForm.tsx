"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
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

const MAX_CLIENT_ATTEMPTS = 5;
const CLIENT_WINDOW_MS = 60_000;
const MIN_HUMAN_DURATION_MS = 1_500;

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

  const [honeypotValue, setHoneypotValue] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const formLoadedAtRef = useRef<number>(0);
  const attemptTimestampsRef = useRef<number[]>([]);

  const sliderTrackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSliderRef = useRef<boolean>(false);
  const [sliderPercent, setSliderPercent] = useState<number>(0);
  const [humanVerified, setHumanVerified] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    formLoadedAtRef.current = Date.now();
    const intervalId = window.setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % AUTH_BACKGROUND_IMAGES.length);
    }, 5500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timerId = window.setInterval(() => {
      setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [lockoutSeconds]);

  function switchTab(nextTab: AuthTabMode) {
    setActiveTab(nextTab);
    setErrorMessage(null);
    formLoadedAtRef.current = Date.now();
  }

  function handleSliderPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (humanVerified || submitting || lockoutSeconds > 0) return;
    isDraggingSliderRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSliderPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDraggingSliderRef.current || humanVerified) return;
    const track = sliderTrackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const handleWidth = 42;
    const usableWidth = Math.max(rect.width - handleWidth, 1);
    const relativeX = event.clientX - rect.left - handleWidth / 2;
    const nextPercent = Math.max(
      0,
      Math.min(100, (relativeX / usableWidth) * 100)
    );

    if (nextPercent >= 88) {
      setSliderPercent(100);
      setHumanVerified(true);
      isDraggingSliderRef.current = false;
    } else {
      setSliderPercent(nextPercent);
    }
  }

  function handleSliderPointerUp() {
    if (!isDraggingSliderRef.current) return;
    isDraggingSliderRef.current = false;
    if (!humanVerified) {
      setSliderPercent(0);
    }
  }

  async function verifySecurityGuard(action: AuthTabMode): Promise<boolean> {
    if (honeypotValue.trim().length > 0) {
      setErrorMessage("ระบบตรวจพบพฤติกรรมอัตโนมัติที่ผิดปกติ คำขอถูกปฏิเสธ");
      return false;
    }

    if (lockoutSeconds > 0) {
      setErrorMessage(
        `ทำรายการเกินกำหนด กรุณารออีก ${lockoutSeconds} วินาทีก่อนลองใหม่อีกครั้ง`
      );
      return false;
    }

    const elapsedMs = Date.now() - formLoadedAtRef.current;
    if (elapsedMs < MIN_HUMAN_DURATION_MS) {
      setErrorMessage("ส่งข้อมูลเร็วผิดปกติ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง");
      return false;
    }

    if (action === "register" && !humanVerified) {
      setErrorMessage("กรุณาเลื่อนแถบยืนยันตัวตนไปทางขวาสุดเพื่อยืนยันว่าไม่ใช่บอท");
      return false;
    }

    const now = Date.now();
    const recent = attemptTimestampsRef.current.filter(
      (timestamp) => now - timestamp < CLIENT_WINDOW_MS
    );

    if (recent.length >= MAX_CLIENT_ATTEMPTS) {
      attemptTimestampsRef.current = recent;
      setLockoutSeconds(60);
      setErrorMessage(
        "พยายามทำรายการเกิน 5 ครั้งภายใน 1 นาที ระบบล็อกชั่วคราว กรุณารอ 60 วินาที"
      );
      return false;
    }

    recent.push(now);
    attemptTimestampsRef.current = recent;

    try {
      const response = await fetch("/api/auth/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          honeypot: honeypotValue,
          elapsedMs,
          humanVerified: action === "register" ? humanVerified : true,
        }),
      });

      const payload = (await response.json()) as {
        allowed?: boolean;
        retryAfterSeconds?: number;
        error?: string;
      };

      if (!response.ok || payload.allowed !== true) {
        if (
          typeof payload.retryAfterSeconds === "number" &&
          payload.retryAfterSeconds > 0
        ) {
          setLockoutSeconds(payload.retryAfterSeconds);
        }
        setErrorMessage(
          payload.error ?? "ไม่สามารถทำรายการได้ในขณะนี้ กรุณารอสักครู่"
        );
        return false;
      }

      return true;
    } catch {
      return true;
    }
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
    if (submitting || lockoutSeconds > 0) return;

    setErrorMessage(null);
    const identifier = loginIdentifier.trim();

    if (!identifier) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้ (Username) หรืออีเมล");
      return;
    }
    if (!loginPassword) {
      setErrorMessage("กรุณากรอกรหัสผ่าน");
      return;
    }

    const guardPassed = await verifySecurityGuard("login");
    if (!guardPassed) return;

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

      if (rpcError || !resolvedEmail || typeof resolvedEmail !== "string") {
        setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: loginPassword,
      });

      if (signInError) {
        setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      attemptTimestampsRef.current = [];
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || lockoutSeconds > 0) return;

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

    const guardPassed = await verifySecurityGuard("register");
    if (!guardPassed) return;

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

      attemptTimestampsRef.current = [];

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
              ? "ใช้ Username (ตรงตัวพิมพ์เล็ก-ใหญ่) หรือ Email เพื่อเข้าสู่ Dashboard"
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

        {lockoutSeconds > 0 && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs sm:text-sm text-amber-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              ระบบล็อกชั่วคราวเนื่องจากส่งคำขอถี่เกินไป กรุณารออีก{" "}
              <strong className="font-mono tabular-nums">{lockoutSeconds}</strong>{" "}
              วินาที
            </span>
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
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0 overflow-hidden"
            >
              <label htmlFor="login-company-website">Website</label>
              <input
                id="login-company-website"
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotValue}
                onChange={(e) => setHoneypotValue(e.target.value)}
              />
            </div>

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
                  maxLength={120}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="เช่น user_01 หรือ you@example.com"
                  disabled={submitting || lockoutSeconds > 0}
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
                  maxLength={128}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  disabled={submitting || lockoutSeconds > 0}
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
              disabled={submitting || lockoutSeconds > 0}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>
                {lockoutSeconds > 0
                  ? `รออีก ${lockoutSeconds} วินาที`
                  : submitting
                    ? "กำลังเข้าสู่ระบบ..."
                    : "เข้าสู่ระบบ"}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0 overflow-hidden"
            >
              <label htmlFor="register-company-website">Website</label>
              <input
                id="register-company-website"
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotValue}
                onChange={(e) => setHoneypotValue(e.target.value)}
              />
            </div>

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
                  maxLength={20}
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
                  disabled={submitting || lockoutSeconds > 0}
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
                  {usernameStatus === "checking" && (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-emerald-400" />
                  )}
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
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น you@example.com"
                  disabled={submitting || lockoutSeconds > 0}
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
                  maxLength={128}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่านของคุณ"
                  disabled={submitting || lockoutSeconds > 0}
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
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้งให้ตรงกัน"
                  disabled={submitting || lockoutSeconds > 0}
                  className={`w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm focus:outline-none disabled:opacity-60 ${inputClass}`}
                />
              </div>
              {confirmPassword && confirmPassword !== registerPassword && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  รหัสผ่านยังไม่ตรงกัน
                </p>
              )}
            </div>

            <div className="pt-1">
              <div
                ref={sliderTrackRef}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                onPointerCancel={handleSliderPointerUp}
                role="slider"
                tabIndex={0}
                aria-label="เลื่อนไปทางขวาเพื่อยืนยันว่าไม่ใช่บอท"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPercent)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSliderPercent(100);
                    setHumanVerified(true);
                  }
                }}
                className={`relative h-11 w-full rounded-lg border select-none touch-none overflow-hidden transition-colors ${
                  humanVerified
                    ? "border-emerald-500/60 bg-emerald-950/40"
                    : "border-zinc-800 bg-zinc-950/90 cursor-ew-resize"
                }`}
              >
                <div
                  style={{ width: `${sliderPercent}%` }}
                  className="pointer-events-none absolute inset-y-0 left-0 bg-emerald-500/20 transition-[width] duration-75"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-11 text-xs font-medium">
                  {humanVerified ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>ยืนยันตัวตนเรียบร้อยแล้ว</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      เลื่อนไปทางขวาเพื่อยืนยันว่าไม่ใช่บอท
                    </span>
                  )}
                </div>
                <div
                  style={{
                    left: `calc(${sliderPercent}% - ${(sliderPercent * 42) / 100}px)`,
                  }}
                  className={`pointer-events-none absolute top-1 bottom-1 w-9 rounded-md flex items-center justify-center transition-colors ${
                    humanVerified
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-zinc-800 text-emerald-400 border border-zinc-700"
                  }`}
                >
                  {humanVerified ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || lockoutSeconds > 0 || !humanVerified}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>
                {lockoutSeconds > 0
                  ? `รออีก ${lockoutSeconds} วินาที`
                  : submitting
                    ? "กำลังสร้างบัญชี..."
                    : "สมัครสมาชิกและเริ่มใช้งาน"}
              </span>
            </button>
          </form>
        )}
      </div>
    </>
  );
}
