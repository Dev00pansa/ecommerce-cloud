"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  BarChart3,
  Calculator,
  Calendar,
  ChevronDown,
  Cloud,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppLanguage } from "@/lib/language";
import { useTheme } from "@/context/ThemeContext";
import { KhumLabLogo } from "@/components/KhumLabLogo";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";

interface NavbarProps {
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  isAuthenticated?: boolean;
}

interface ToolsDropdownItemsProps {
  pathname: string;
  isEn: boolean;
  calculatorTabHref: string;
  cloudTabHref: string;
  onSelect: () => void;
}

function ToolsDropdownItems({
  pathname,
  isEn,
  calculatorTabHref,
  cloudTabHref,
  onSelect,
}: ToolsDropdownItemsProps) {
  const searchParams = useSearchParams();
  const isOnDashboard = pathname.startsWith("/dashboard");
  const activeTabParam = searchParams.get("tab");
  const isSummaryActive = isOnDashboard && activeTabParam === "summary";
  const isCalculatorActive = isOnDashboard && activeTabParam === "calculator";
  const isCloudActive =
    isOnDashboard &&
    activeTabParam !== "calculator" &&
    activeTabParam !== "summary";

  return (
    <div className="p-2 space-y-1">
      <Link
        href={cloudTabHref}
        scroll={false}
        onClick={onSelect}
        className={`group flex items-start gap-3 rounded-xl px-3.5 py-3 border transition-colors ${
          isCloudActive
            ? "bg-emerald-500/12 border-emerald-500/35 light:bg-emerald-50 light:border-emerald-200"
            : "border-transparent hover:bg-white/[0.05] light:hover:bg-slate-100/80"
        }`}
      >
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isCloudActive
              ? "bg-emerald-500/25 text-emerald-300 light:bg-emerald-100 light:text-emerald-700"
              : "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 light:bg-emerald-50 light:text-emerald-700 light:group-hover:bg-emerald-100"
          }`}
        >
          <Cloud className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`block text-sm font-semibold transition-colors ${
                isCloudActive
                  ? "text-emerald-400 light:text-emerald-700"
                  : "text-zinc-100 group-hover:text-emerald-300 light:text-slate-900 light:group-hover:text-emerald-700"
              }`}
            >
              {isEn ? "Cloud Storage" : "คลาวด์เก็บข้อมูล"}
            </span>
            {isCloudActive && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 light:bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 light:text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600 shadow-[0_0_8px_#34d399] light:shadow-none" />
                <span>{isEn ? "Active" : "กำลังใช้งาน"}</span>
              </span>
            )}
          </div>
          <span className="mt-0.5 block text-xs text-zinc-400 light:text-slate-600 leading-snug">
            {isEn
              ? "View saved calculations and product images"
              : "ดูประวัติรายการและรูปสินค้าที่บันทึกไว้"}
          </span>
        </div>
      </Link>

      <Link
        href={calculatorTabHref}
        scroll={false}
        onClick={onSelect}
        className={`group flex items-start gap-3 rounded-xl px-3.5 py-3 border transition-colors ${
          isCalculatorActive
            ? "bg-emerald-500/12 border-emerald-500/35 light:bg-emerald-50 light:border-emerald-200"
            : "border-transparent hover:bg-white/[0.05] light:hover:bg-slate-100/80"
        }`}
      >
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isCalculatorActive
              ? "bg-emerald-500/25 text-emerald-300 light:bg-emerald-100 light:text-emerald-700"
              : "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 light:bg-emerald-50 light:text-emerald-700 light:group-hover:bg-emerald-100"
          }`}
        >
          <Calculator className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`block text-sm font-semibold transition-colors ${
                isCalculatorActive
                  ? "text-emerald-400 light:text-emerald-700"
                  : "text-zinc-100 group-hover:text-emerald-300 light:text-slate-900 light:group-hover:text-emerald-700"
              }`}
            >
              {isEn ? "Calculator" : "เครื่องมือคำนวณ"}
            </span>
            {isCalculatorActive && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 light:bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 light:text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600 shadow-[0_0_8px_#34d399] light:shadow-none" />
                <span>{isEn ? "Active" : "กำลังใช้งาน"}</span>
              </span>
            )}
          </div>
          <span className="mt-0.5 block text-xs text-zinc-400 light:text-slate-600 leading-snug">
            {isEn
              ? "Calculate costs, selling price, and net profit"
              : "คำนวณต้นทุน ราคาขาย และกำไรสุทธิ"}
          </span>
        </div>
      </Link>

      {isSummaryActive ? (
        <div
          onClick={onSelect}
          className="flex items-start gap-3 rounded-xl px-3.5 py-3 border bg-emerald-500/12 border-emerald-500/35 light:bg-emerald-50 light:border-emerald-200 cursor-default"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/25 text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="block text-sm font-semibold text-emerald-400 light:text-emerald-700">
                {isEn ? "Profit Analytics" : "สรุปผลและวิเคราะห์กำไร"}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 light:bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 light:text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-400 light:bg-emerald-600 shadow-[0_0_8px_#34d399] light:shadow-none" />
                <span>{isEn ? "Active" : "กำลังใช้งาน"}</span>
              </span>
            </div>
            <span className="mt-0.5 block text-xs text-zinc-400 light:text-slate-600 leading-snug">
              {isEn
                ? "Charts, diagnostics, and smart pricing advice"
                : "กราฟวิเคราะห์เชิงลึกและคำแนะนำการตั้งราคา"}
            </span>
          </div>
        </div>
      ) : (
        <div
          aria-disabled="true"
          className="flex items-start gap-3 rounded-xl px-3.5 py-3 border border-transparent opacity-50 pointer-events-none select-none cursor-not-allowed"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 light:bg-slate-100 text-zinc-500 light:text-slate-400">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="block text-sm font-semibold text-zinc-400 light:text-slate-500 whitespace-nowrap">
                {isEn ? "Profit Analytics" : "สรุปผลและวิเคราะห์กำไร"}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/90 light:border-slate-200 light:bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-zinc-400 light:text-slate-500 whitespace-nowrap">
                <Lock className="h-2.5 w-2.5 shrink-0" />
                <span>
                  {isEn ? "Run calculation first" : "ต้องกดประมวลผลก่อน"}
                </span>
              </span>
            </div>
            <span className="mt-0.5 block text-xs text-zinc-500 light:text-slate-400 leading-snug">
              {isEn
                ? "Charts, diagnostics, and smart pricing advice"
                : "กราฟวิเคราะห์เชิงลึกและคำแนะนำการตั้งราคา"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatJoinedDate(
  isoDate: string | null | undefined,
  isEn: boolean
): string | null {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return null;

  if (isEn) {
    return `Joined ${parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return `สร้างบัญชีเมื่อ ${parsed.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function Navbar({
  username = null,
  email = null,
  avatarUrl = null,
  createdAt = null,
  isAuthenticated = false,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useAppLanguage();
  const { isLight, toggleTheme } = useTheme();
  const isEn = language === "en";

  const navContainerRef = useRef<HTMLElement | null>(null);
  const navPillRef = useRef<HTMLSpanElement | null>(null);
  const homeNavRef = useRef<HTMLAnchorElement | null>(null);
  const workspaceNavRef = useRef<HTMLButtonElement | null>(null);
  const toolsDropdownRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  const [hoveredNavKey, setHoveredNavKey] = useState<
    "home" | "workspace" | null
  >(null);
  const [overrideUsername, setOverrideUsername] = useState<string | null>(null);
  const [overrideAvatarUrl, setOverrideAvatarUrl] = useState<string | null>(
    null
  );
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayUsername = overrideUsername ?? username ?? "";
  const displayAvatarUrl = overrideAvatarUrl ?? avatarUrl ?? null;
  const joinedLabel = formatJoinedDate(createdAt, isEn);

  const activeNavKey: "home" | "workspace" | null =
    toolsDropdownOpen || pathname.startsWith("/dashboard")
      ? "workspace"
      : pathname === "/"
        ? "home"
        : null;
  const targetNavKey = hoveredNavKey ?? activeNavKey;

  useEffect(() => {
    const updateNavPill = () => {
      const pill = navPillRef.current;
      if (!pill) return;

      const targetEl =
        targetNavKey === "home"
          ? homeNavRef.current
          : targetNavKey === "workspace"
            ? workspaceNavRef.current
            : null;

      if (!targetEl) {
        pill.style.opacity = "0";
        return;
      }

      const left =
        targetNavKey === "home"
          ? targetEl.offsetLeft
          : (toolsDropdownRef.current?.offsetLeft ?? 0) + targetEl.offsetLeft;
      const width = targetEl.offsetWidth;

      if (width <= 0) {
        pill.style.opacity = "0";
        return;
      }

      pill.style.width = `${width}px`;
      pill.style.transform = `translateX(${left}px)`;
      pill.style.opacity = "1";
    };

    const rafId = window.requestAnimationFrame(updateNavPill);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateNavPill())
        : null;

    if (resizeObserver) {
      if (navContainerRef.current) {
        resizeObserver.observe(navContainerRef.current);
      }
      if (homeNavRef.current) {
        resizeObserver.observe(homeNavRef.current);
      }
      if (workspaceNavRef.current) {
        resizeObserver.observe(workspaceNavRef.current);
      }
    }

    window.addEventListener("resize", updateNavPill);
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateNavPill);
    };
  }, [targetNavKey, language, pathname, toolsDropdownOpen]);

  useEffect(() => {
    if (!toolsDropdownOpen && !profileDropdownOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (
        toolsDropdownOpen &&
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(target)
      ) {
        setToolsDropdownOpen(false);
      }
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toolsDropdownOpen, profileDropdownOpen]);

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
    setToolsDropdownOpen(false);
    setProfileDropdownOpen(false);
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
    setToolsDropdownOpen(false);
    setProfileDropdownOpen(false);
    setOverrideUsername(null);
    setOverrideAvatarUrl(null);
    router.push("/login");
    router.refresh();
    setLoggingOut(false);
  }

  const homeHref = isAuthenticated ? "/?landing=1" : "/";
  const calculatorTabHref = isAuthenticated
    ? "/dashboard?tab=calculator"
    : "/login";
  const cloudTabHref = isAuthenticated ? "/dashboard?tab=history" : "/login";

  const themeToggleLabel = isLight
    ? isEn
      ? "Dark"
      : "มืด"
    : isEn
      ? "Light"
      : "สว่าง";

  const themeToggleAria = isLight
    ? isEn
      ? "Switch to Dark Mode"
      : "สลับเป็นโหมดมืด"
    : isEn
      ? "Switch to Light Mode"
      : "สลับเป็นโหมดสว่าง";

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-zinc-800/90 bg-[#000000]/90 light:border-slate-200 light:bg-white/90 light:shadow-[0_1px_12px_rgba(15,23,42,0.05)] backdrop-blur-md">
        <div className="w-full max-w-[1440px] mx-auto h-full flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-10">
          <div className="flex items-center min-w-0">
            <Link
              href={homeHref}
              scroll={true}
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 group shrink-0 focus:outline-none"
            >
              <KhumLabLogo
                size={36}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 light:text-slate-900 block leading-none">
                  KhumLab
                </span>
                <span className="hidden xs:block sm:block text-[11px] font-medium text-zinc-500 light:text-slate-500">
                  Digital for E-Commerce
                </span>
              </div>
            </Link>

            <span
              aria-hidden="true"
              className="hidden md:block h-5 w-px bg-zinc-800 light:bg-slate-200 mx-4"
            />

            <nav
              ref={navContainerRef}
              onMouseLeave={() => setHoveredNavKey(null)}
              className="relative hidden sm:flex items-center gap-1 ml-3 md:ml-0"
            >
              <span
                ref={navPillRef}
                aria-hidden="true"
                style={{ opacity: 0, width: 0, transform: "translateX(0px)" }}
                className="pointer-events-none absolute top-0 bottom-0 left-0 z-0 rounded-xl border border-emerald-400/55 bg-emerald-500/14 shadow-[0_0_20px_-4px_rgba(16,185,129,0.45)] light:border-emerald-500/45 light:bg-emerald-50 light:shadow-[0_2px_12px_rgba(16,185,129,0.18)] transition-all duration-300 ease-out"
              />

              <Link
                ref={homeNavRef}
                href={homeHref}
                scroll={true}
                onMouseEnter={() => setHoveredNavKey("home")}
                onClick={(event) => {
                  setHoveredNavKey(null);
                  handleLogoClick(event);
                }}
                className={`relative z-10 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  targetNavKey === "home"
                    ? "text-emerald-400 light:text-emerald-700"
                    : "text-zinc-400 hover:text-zinc-100 light:text-slate-600 light:hover:text-slate-900"
                }`}
              >
                {isEn ? "Home" : "หน้าหลัก"}
              </Link>

              <div ref={toolsDropdownRef} className="relative z-10">
                <button
                  ref={workspaceNavRef}
                  type="button"
                  onMouseEnter={() => setHoveredNavKey("workspace")}
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setToolsDropdownOpen((prev) => !prev);
                  }}
                  aria-expanded={toolsDropdownOpen}
                  aria-haspopup="menu"
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none ${
                    targetNavKey === "workspace"
                      ? "text-emerald-400 light:text-emerald-700"
                      : "text-zinc-400 hover:text-zinc-100 light:text-slate-600 light:hover:text-slate-900"
                  }`}
                >
                  <span>{isEn ? "Workspace" : "จัดการข้อมูล"}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      toolsDropdownOpen
                        ? "rotate-180 text-emerald-400 light:text-emerald-700"
                        : ""
                    }`}
                  />
                </button>

                <div
                  role="menu"
                  className={`absolute left-0 mt-3 w-[360px] sm:w-[385px] origin-top-left z-50 overflow-hidden rounded-2xl bg-[#050505] border border-emerald-500/30 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.85),0_0_24px_-6px_rgba(16,185,129,0.2)] light:bg-white light:border-slate-200 light:shadow-[0_14px_36px_rgba(15,23,42,0.12)] transition-all duration-200 ease-out ${
                    toolsDropdownOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 light:via-emerald-500/40 to-transparent"
                  />

                  <Suspense fallback={<div className="p-4 h-36" />}>
                    <ToolsDropdownItems
                      pathname={pathname}
                      isEn={isEn}
                      calculatorTabHref={calculatorTabHref}
                      cloudTabHref={cloudTabHref}
                      onSelect={() => {
                        setToolsDropdownOpen(false);
                        setHoveredNavKey(null);
                      }}
                    />
                  </Suspense>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={themeToggleAria}
                  title={themeToggleAria}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2.5 sm:px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:border-emerald-600/50 light:hover:bg-emerald-50 light:hover:text-emerald-700 focus:outline-none"
                >
                  {isLight ? (
                    <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-300 shrink-0" />
                  )}
                  <span className="hidden md:inline">{themeToggleLabel}</span>
                </button>

                {displayUsername && (
                  <div ref={profileDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        setProfileDropdownOpen((prev) => !prev);
                      }}
                      aria-expanded={profileDropdownOpen}
                      aria-haspopup="menu"
                      className="group inline-flex items-center gap-2 rounded-xl px-2 sm:px-2.5 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.04] hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900 focus:outline-none"
                    >
                      {displayAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={displayAvatarUrl}
                          alt={displayUsername}
                          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-emerald-500/40 light:ring-emerald-600/40"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 transition-colors group-hover:bg-emerald-500/25 light:bg-emerald-100 light:text-emerald-700 light:group-hover:bg-emerald-200/80">
                          <UserIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="max-w-[96px] sm:max-w-[140px] truncate tracking-tight">
                        {displayUsername}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-all duration-200 ${
                          profileDropdownOpen
                            ? "rotate-180 text-emerald-400 light:text-emerald-700"
                            : "text-zinc-500 group-hover:text-zinc-300 light:text-slate-400 light:group-hover:text-slate-700"
                        }`}
                      />
                    </button>

                    <div
                      role="menu"
                      className={`absolute right-0 mt-3 w-80 origin-top-right z-50 overflow-hidden rounded-2xl bg-[#050505] border border-emerald-500/30 shadow-[0_14px_44px_-8px_rgba(0,0,0,0.95),0_0_24px_-6px_rgba(16,185,129,0.22)] light:bg-white light:border-slate-200 light:shadow-[0_14px_36px_rgba(15,23,42,0.12)] transition-all duration-200 ease-out ${
                        profileDropdownOpen
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                          : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                      }`}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 light:via-emerald-500/40 to-transparent"
                      />

                      <div className="p-4 border-b border-zinc-800/80 light:border-slate-200">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 shrink-0">
                            {displayAvatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={displayAvatarUrl}
                                alt={displayUsername}
                                className="h-12 w-12 rounded-full object-cover ring-1 ring-emerald-500/50 light:ring-emerald-600/40 select-none"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 light:bg-emerald-100 light:text-emerald-700 light:ring-emerald-300">
                                <UserIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white light:text-slate-900 truncate">
                              {displayUsername}
                            </p>
                            {email && (
                              <p className="text-xs font-mono text-zinc-400 light:text-slate-600 truncate mt-0.5">
                                {email}
                              </p>
                            )}
                            {joinedLabel && (
                              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500 light:text-slate-500">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>{joinedLabel}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-b border-zinc-800/80 light:border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400 light:text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" />
                            <span>
                              {isEn ? "Language" : "ภาษา / Language"}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-zinc-800/90 bg-black light:border-slate-200 light:bg-slate-100 p-1">
                          <button
                            type="button"
                            onClick={() => setLanguage("th")}
                            className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                              language === "th"
                                ? "bg-emerald-500 text-slate-950 light:bg-emerald-600 light:text-white"
                                : "text-zinc-400 hover:text-zinc-200 light:text-slate-600 light:hover:text-slate-900"
                            }`}
                          >
                            ไทย
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage("en")}
                            className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                              language === "en"
                                ? "bg-emerald-500 text-slate-950 light:bg-emerald-600 light:text-white"
                                : "text-zinc-400 hover:text-zinc-200 light:text-slate-600 light:hover:text-slate-900"
                            }`}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setSettingsOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.05] hover:text-emerald-300 light:text-slate-700 light:hover:bg-emerald-50 light:hover:text-emerald-700"
                        >
                          <KeyRound className="h-4 w-4 text-emerald-400 light:text-emerald-600 shrink-0" />
                          <span>
                            {isEn
                              ? "Account & Password Settings"
                              : "ตั้งค่าบัญชีและรหัสผ่าน"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-zinc-800/80 light:bg-slate-200"
                />

                <button
                  type="button"
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    setProfileDropdownOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-medium text-red-400 transition-colors hover:bg-white/[0.04] hover:text-red-300 light:text-rose-600 light:hover:bg-rose-50 light:hover:text-rose-700 disabled:opacity-60 focus:outline-none"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {isEn ? "Sign Out" : "ออกจากระบบ"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={themeToggleAria}
                  title={themeToggleAria}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/90 px-2.5 sm:px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:border-emerald-600/50 light:hover:bg-emerald-50 light:hover:text-emerald-700 focus:outline-none"
                >
                  {isLight ? (
                    <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-300 shrink-0" />
                  )}
                  <span className="hidden sm:inline">{themeToggleLabel}</span>
                </button>

                <div
                  role="group"
                  aria-label={isEn ? "Language switcher" : "สลับภาษา"}
                  className="inline-flex h-9 items-center rounded-xl border border-zinc-800 bg-zinc-950/90 p-1 light:border-slate-200 light:bg-slate-100/90"
                >
                  <Globe className="ml-1.5 mr-1 h-3.5 w-3.5 text-emerald-400 light:text-emerald-600 hidden sm:block shrink-0" />
                  <button
                    type="button"
                    onClick={() => setLanguage("th")}
                    aria-pressed={language === "th"}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                      language === "th"
                        ? "bg-emerald-500 text-slate-950 light:bg-emerald-600 light:text-white"
                        : "text-zinc-400 hover:text-zinc-200 light:text-slate-600 light:hover:text-slate-900"
                    }`}
                  >
                    TH
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    aria-pressed={language === "en"}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                      language === "en"
                        ? "bg-emerald-500 text-slate-950 light:bg-emerald-600 light:text-white"
                        : "text-zinc-400 hover:text-zinc-200 light:text-slate-600 light:hover:text-slate-900"
                    }`}
                  >
                    EN
                  </button>
                </div>

                <Link
                  href="/login"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 light:bg-emerald-600 light:text-white light:hover:bg-emerald-700 light:shadow-sm whitespace-nowrap"
                >
                  <LogIn className="h-3.5 w-3.5 shrink-0" />
                  <span>{isEn ? "Sign In" : "เข้าสู่ระบบ"}</span>
                </Link>
              </div>
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
          avatarUrl={displayAvatarUrl}
          language={language}
          onUsernameUpdated={(next) => setOverrideUsername(next)}
          onAvatarUpdated={(next) => setOverrideAvatarUrl(next)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 light:bg-slate-900/45 backdrop-blur-md p-4"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-[#050505] p-6 text-zinc-100 shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900 light:shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
            />

            <div className="space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400 light:bg-rose-50 light:text-rose-600">
                <LogOut className="h-5 w-5" />
              </div>
              <h2
                id="logout-confirm-title"
                className="pt-1 text-lg font-bold tracking-tight text-white light:text-slate-900"
              >
                {isEn
                  ? "Are you sure you want to sign out?"
                  : "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?"}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400 light:text-slate-600">
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
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900 disabled:opacity-50"
              >
                {isEn ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 light:bg-rose-600 light:hover:bg-rose-700 disabled:opacity-60"
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
