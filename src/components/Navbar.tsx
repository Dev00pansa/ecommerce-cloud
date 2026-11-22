"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import {
  ChevronDown,
  Loader2,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppLanguage } from "@/lib/language";
import { KhumLabLogo } from "@/components/KhumLabLogo";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";

interface NavbarProps {
  username?: string | null;
  email?: string | null;
  isAuthenticated?: boolean;
}

export function Navbar({
  username = null,
  email = null,
  isAuthenticated = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useAppLanguage();
  const isEn = language === "en";

  const [overrideUsername, setOverrideUsername] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayUsername = overrideUsername ?? username ?? "";

  useEffect(() => {
    if (!logoutConfirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loggingOut) {
        setLogoutConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [logoutConfirmOpen, loggingOut]);

  function handleLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  async function handleConfirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    setLogoutConfirmOpen(false);
    setOverrideUsername(null);
    router.push("/login");
    router.refresh();
    setLoggingOut(false);
  }

  const calculatorHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-zinc-800/90 bg-[#000000]/90 backdrop-blur-md">
        <div className="w-full max-w-[1600px] mx-auto h-full flex items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center">
            <Link
              href="/"
              scroll={true}
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <KhumLabLogo
                size={36}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 block leading-none">
                  KhumLab
                </span>
                <span className="text-[11px] font-medium text-zinc-500">
                  Digital for E-Commerce
                </span>
              </div>
            </Link>

            <span
              aria-hidden="true"
              className="hidden md:block h-5 w-px bg-zinc-800 mx-4"
            />

            <nav className="hidden sm:flex items-center gap-1 ml-3 md:ml-0">
              <Link
                href="/"
                scroll={true}
                onClick={handleLogoClick}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-zinc-900 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {isEn ? "Home" : "หน้าหลัก"}
              </Link>
              <Link
                href={calculatorHref}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith("/dashboard")
                    ? "bg-zinc-900 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {isEn ? "Calculator" : "เครื่องมือคำนวณ"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {displayUsername && (
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="group inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.04] hover:text-white focus:outline-none"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 transition-colors group-hover:bg-emerald-500/25">
                      <UserIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="max-w-[140px] truncate tracking-tight">
                      {displayUsername}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-zinc-300" />
                  </button>
                )}

                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-zinc-800/80"
                />

                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(true)}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-red-400 transition-colors hover:bg-white/[0.04] hover:text-red-300 disabled:opacity-60 focus:outline-none"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isEn ? "Sign Out" : "ออกจากระบบ"}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{isEn ? "Sign In" : "เข้าสู่ระบบ"}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && (
        <AccountSettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          username={displayUsername}
          initialEmail={email}
          language={language}
          onChangeLanguage={setLanguage}
          onUsernameUpdated={(next) => setOverrideUsername(next)}
        />
      )}

      {logoutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loggingOut) {
              setLogoutConfirmOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <div className="relative w-full max-w-sm border border-zinc-800 bg-[#070707] p-6 text-zinc-100 shadow-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
            />

            <div className="space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <LogOut className="h-5 w-5" />
              </div>
              <h2
                id="logout-confirm-title"
                className="pt-1 text-lg font-bold tracking-tight text-white"
              >
                {isEn
                  ? "Are you sure you want to sign out?"
                  : "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?"}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                {isEn
                  ? "Your saved calculations remain safely stored on the Cloud. You can sign back in anytime."
                  : "ข้อมูลการคำนวณที่บันทึกไว้จะยังคงปลอดภัยบน Cloud และคุณสามารถกลับเข้าสู่ระบบได้ทุกเมื่อ"}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                disabled={loggingOut}
                className="px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
              >
                {isEn ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {loggingOut
                    ? isEn
                      ? "Signing out..."
                      : "กำลังออกจากระบบ..."
                    : isEn
                      ? "Confirm Sign Out"
                      : "ยืนยันออกจากระบบ"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
