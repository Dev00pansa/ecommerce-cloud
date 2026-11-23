"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { useAppLanguage } from "@/lib/language";
import { KhumLabLogo } from "@/components/KhumLabLogo";

interface FooterProps {
  isAuthenticated?: boolean;
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

export function Footer({ isAuthenticated = false }: FooterProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const homeHref = isAuthenticated ? "/?landing=1" : "/";

  const handleScrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-20 w-full border-t border-zinc-800 bg-zinc-900 text-zinc-300 light:border-slate-200 light:bg-white light:text-slate-700">
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 pb-10 border-b border-zinc-800 light:border-slate-200">
          <div className="md:col-span-6 space-y-4">
            <Link
              href={homeHref}
              onClick={handleScrollTop}
              className="inline-flex items-center gap-3 group focus:outline-none"
            >
              <KhumLabLogo size={36} />
              <div>
                <span className="text-lg font-bold tracking-tight text-zinc-100 light:text-slate-900 block leading-none">
                  KhumLab
                </span>
                <span className="text-xs font-medium text-emerald-400 light:text-emerald-700">
                  E-Commerce Profit & Break-Even Intelligence
                </span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 light:text-slate-600">
              {isEn
                ? "Real-cost pricing calculator, flash sale discount simulator, and break-even analytics platform built for online sellers — complete with private Cloud persistence."
                : "เครื่องมือคำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ประกอบการร้านค้าออนไลน์ พร้อมระบบบันทึกข้อมูลส่วนตัวบน Cloud"}
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 light:text-slate-900">
              {isEn ? "Navigation" : "เมนูการใช้งาน"}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400 light:text-slate-600">
              <li>
                <Link
                  href={homeHref}
                  onClick={handleScrollTop}
                  className="transition-colors hover:text-emerald-400 light:hover:text-emerald-700"
                >
                  {isEn ? "Home" : "หน้าหลัก"}
                </Link>
              </li>
              <li>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  className="transition-colors hover:text-emerald-400 light:hover:text-emerald-700"
                >
                  {isEn ? "Pricing Calculator" : "เครื่องมือคำนวณราคา"}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-emerald-400 light:hover:text-emerald-700"
                >
                  {isEn ? "Sign In / Register" : "เข้าสู่ระบบ / สมัครสมาชิก"}
                </Link>
              </li>
              <li>
                <Link
                  href="/credits"
                  className="transition-colors hover:text-emerald-400 light:hover:text-emerald-700"
                >
                  {isEn ? "Creator Credits" : "เครดิตผู้จัดทำ"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-100 light:text-slate-900">
              {isEn ? "Key Features" : "ฟีเจอร์หลัก"}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400 light:text-slate-600">
              <li>
                {isEn
                  ? "Automatic marketplace GP calculation"
                  : "คำนวณค่า GP แพลตฟอร์มอัตโนมัติ"}
              </li>
              <li>
                {isEn
                  ? "Net margin & break-even diagnostics"
                  : "วิเคราะห์กำไรสุทธิและจุดคุ้มทุน"}
              </li>
              <li>
                {isEn
                  ? "0%–50% promo discount simulator"
                  : "จำลองจัดโปรโมชันลดราคา 0%–50%"}
              </li>
              <li>
                {isEn
                  ? "Private Cloud sync & custom CSV export"
                  : "บันทึกข้อมูลบน Cloud & ส่งออก CSV"}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-zinc-400 light:text-slate-600">
            <p>
              {isEn
                ? "Built as a Digital for E-Commerce course project."
                : "เว็บไซต์นี้จัดทำขึ้นเป็นโปรเจกต์ในวิชาดิจิทัลฟอร์อีคอมเมิร์ซ"}
            </p>
            <p className="font-medium text-emerald-400 light:text-emerald-700">
              {isEn
                ? "Free to use for as long as the creator can keep the servers running."
                : "เปิดให้ใช้งานฟรีแบบยาวๆ จนกว่าคนสร้างจะไม่มีตังค์"}
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-800/70 light:border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/50 px-3 py-1 font-mono text-[11px] font-medium text-zinc-400 light:border-slate-200 light:bg-slate-50 light:text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 light:bg-emerald-600" />
              <span>
                {isEn
                  ? "v1.2.0 • Updated Nov 23, 2026"
                  : "v1.2.0 • อัปเดต 23 พ.ย. 2569"}
              </span>
            </span>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/credits"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-200 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700 light:hover:border-emerald-400 light:hover:bg-emerald-100"
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>{isEn ? "Creator Credits" : "เครดิตผู้จัดทำ"}</span>
              </Link>

              <a
                href="https://github.com/Dev00pansa"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Profile (@Dev00pansa)"
                aria-label="GitHub Profile (@Dev00pansa)"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-black/70 text-zinc-200 transition-all hover:border-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300 light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:bg-emerald-50 light:hover:text-emerald-700"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
