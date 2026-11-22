"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calculator,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  username?: string | null;
  isAuthenticated?: boolean;
}

/**
 * แถบเมนูหลักด้านบน (Sticky Header)
 * แสดงโลโก้ ลิงก์นำทาง ปุ่มสลับ 2 โหมดสี (ปกติ / ดำ) และสถานะผู้ใช้งาน
 */
export function Navbar({
  username = null,
  isAuthenticated = false,
}: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push("/login");
    router.refresh();
    setLoggingOut(false);
  }

  const calculatorHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark
          ? "border-zinc-800 bg-[#000000]/90"
          : "border-slate-200/90 bg-white/85"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* ด้านซ้าย: โลโก้และชื่อโปรเจกต์ */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition-transform group-hover:scale-105">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight block leading-none">
              E-Com MarginLab
            </span>
            <span
              className={`text-[11px] font-medium ${
                isDark ? "text-zinc-500" : "text-slate-500"
              }`}
            >
              Digital for E-Commerce
            </span>
          </div>
        </Link>

        {/* ตรงกลาง: เมนูลิงก์เรียบง่ายไม่ซ้ำซ้อน */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === "/"
                ? isDark
                  ? "bg-zinc-900 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700"
                : isDark
                  ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            หน้าหลัก
          </Link>
          <Link
            href={calculatorHref}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard")
                ? isDark
                  ? "bg-zinc-900 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700"
                : isDark
                  ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            เครื่องมือคำนวณ
          </Link>
        </nav>

        {/* มุมขวาบน: ปุ่มสลับโหมดสี 2 โหมด + ปุ่มเข้าสู่ระบบ / สถานะผู้ใช้ */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="สลับโหมดสี"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isDark
                ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-emerald-400" />
                <span>ปกติ</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-700" />
                <span>ดำ</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {username && (
                <Link
                  href="/dashboard"
                  className={`hidden md:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-medium transition-colors ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-emerald-400 hover:border-emerald-500/50"
                      : "border-slate-200 bg-slate-50 text-emerald-700 hover:border-emerald-500/50"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>@{username}</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                  isDark
                    ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-rose-500/50 hover:text-rose-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                {loggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>{loggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
