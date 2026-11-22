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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  username?: string | null;
  isAuthenticated?: boolean;
}

/**
 * แถบเมนูหลักด้านบน (Sticky Header)
 * ใช้ Container กว้าง max-w-[1440px] และตัดปุ่มสลับโหมดสีออกเพื่อโฟกัสโหมดดำ-เขียว
 */
export function Navbar({
  username = null,
  isAuthenticated = false,
}: NavbarProps) {
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
    <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-[#000000]/90 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-6 py-3.5 md:px-12 lg:px-16">
        {/* ด้านซ้าย: โลโก้และชื่อโปรเจกต์ */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition-transform group-hover:scale-105">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 block leading-none">
              E-Com MarginLab
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              Digital for E-Commerce
            </span>
          </div>
        </Link>

        {/* ตรงกลาง: เมนูลิงก์นำทาง */}
        <nav className="hidden sm:flex items-center gap-1.5">
          <Link
            href="/"
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-zinc-900 text-emerald-400"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            หน้าหลัก
          </Link>
          <Link
            href={calculatorHref}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard")
                ? "bg-zinc-900 text-emerald-400"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            เครื่องมือคำนวณ
          </Link>
        </nav>

        {/* มุมขวาบน: สถานะผู้ใช้ / ปุ่มเข้าสู่ระบบ */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {username && (
                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 transition-colors hover:border-emerald-500/50"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>@{username}</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-60"
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
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
